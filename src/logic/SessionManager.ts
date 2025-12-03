import { Deck, Card, CardResult, SessionState, SessionResult, CardRating } from '../models';
import { StorageManager } from '../storage';

/**
 * Manager zarządzający sesją nauki
 */
export class SessionManager {
    private deck: Deck;
    private state: SessionState;
    private cards: Card[]; // kopia talii (może być przetasowana)

    constructor(deck: Deck) {
        this.deck = deck;
        this.cards = [...deck.cards];
        
        // Tasowanie jeśli włączone
        if (deck.session.shuffle) {
            this.shuffleCards();
        }

        this.state = {
            currentCardIndex: 0,
            startTime: Date.now(),
            currentCardStartTime: Date.now(),
            results: new Map(),
            revealedCards: new Set(),
            revealTimes: new Map()
        };
    }

    /**
     * Tasuje fiszki
     */
    private shuffleCards(): void {
        for (let i = this.cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
        }
    }

    /**
     * Zwraca aktualną fiszkę
     */
    getCurrentCard(): Card {
        return this.cards[this.state.currentCardIndex];
    }

    /**
     * Zwraca indeks aktualnej fiszki
     */
    getCurrentIndex(): number {
        return this.state.currentCardIndex;
    }

    /**
     * Zwraca całkowitą liczbę fiszek
     */
    getTotalCards(): number {
        return this.cards.length;
    }

    /**
     * Zwraca obiekt deck
     */
    getDeck(): Deck {
        return this.deck;
    }

    /**
     * Sprawdza czy można przejść do poprzedniej fiszki
     */
    canGoPrevious(): boolean {
        return this.state.currentCardIndex > 0;
    }

    /**
     * Sprawdza czy można przejść do następnej fiszki
     */
    canGoNext(): boolean {
        return this.state.currentCardIndex < this.cards.length - 1;
    }

    /**
     * Przechodzi do poprzedniej fiszki
     */
    goToPrevious(): void {
        if (this.canGoPrevious()) {
            this.state.currentCardIndex--;
            this.state.currentCardStartTime = Date.now();
        }
    }

    /**
     * Przechodzi do następnej fiszki
     */
    goToNext(): void {
        if (this.canGoNext()) {
            this.state.currentCardIndex++;
            this.state.currentCardStartTime = Date.now();
        }
    }

    /**
     * Odsłania odpowiedź dla aktualnej fiszki
     */
    revealAnswer(): void {
        const currentCard = this.getCurrentCard();
        if (!this.state.revealedCards.has(currentCard.id)) {
            this.state.revealedCards.add(currentCard.id);
            this.state.revealTimes.set(currentCard.id, Date.now());
        }
    }

    /**
     * Sprawdza czy odpowiedź została odsłonięta dla aktualnej fiszki
     */
    isAnswerRevealed(): boolean {
        const currentCard = this.getCurrentCard();
        return this.state.revealedCards.has(currentCard.id);
    }

    /**
     * Ocenia aktualną fiszkę
     */
    rateCard(rating: 'known' | 'unknown'): void {
        const currentCard = this.getCurrentCard();
        
        // Czas liczony od momentu odsłonięcia odpowiedzi, jeśli odpowiedź była odsłonięta
        // W przeciwnym razie od momentu wejścia na fiszkę
        const revealTime = this.state.revealTimes.get(currentCard.id);
        const startTime = revealTime || this.state.currentCardStartTime;
        const timeSpent = Date.now() - startTime;

        const result: CardResult = {
            cardId: currentCard.id,
            rating: rating,
            timeSpent: timeSpent
        };

        this.state.results.set(currentCard.id, result);
    }

    /**
     * Zwraca ocenę dla aktualnej fiszki
     */
    getCurrentCardRating(): CardRating {
        const currentCard = this.getCurrentCard();
        const result = this.state.results.get(currentCard.id);
        return result ? result.rating : null;
    }

    /**
     * Sprawdza czy wszystkie fiszki zostały ocenione
     */
    areAllCardsRated(): boolean {
        return this.state.results.size === this.cards.length;
    }

    /**
     * Zwraca czas spędzony na aktualnej fiszce (w milisekundach)
     */
    getCurrentCardTime(): number {
        return Date.now() - this.state.currentCardStartTime;
    }

    /**
     * Zwraca całkowity czas sesji (w milisekundach)
     */
    getTotalTime(): number {
        return Date.now() - this.state.startTime;
    }

    /**
     * Zwraca statystyki sesji
     */
    getStatistics(): {
        currentIndex: number;
        totalCards: number;
        knownCount: number;
        unknownCount: number;
        currentCardTime: number;
        totalTime: number;
    } {
        let knownCount = 0;
        let unknownCount = 0;

        this.state.results.forEach(result => {
            if (result.rating === 'known') {
                knownCount++;
            } else if (result.rating === 'unknown') {
                unknownCount++;
            }
        });

        return {
            currentIndex: this.state.currentCardIndex + 1,
            totalCards: this.cards.length,
            knownCount,
            unknownCount,
            currentCardTime: this.getCurrentCardTime(),
            totalTime: this.getTotalTime()
        };
    }

    /**
     * Kończy sesję i zapisuje wyniki
     */
    finishSession(): SessionResult {
        const totalTime = this.getTotalTime();
        const results: CardResult[] = [];

        // Tworzymy wyniki dla wszystkich fiszek (nawet tych nieocenionych)
        this.cards.forEach(card => {
            const result = this.state.results.get(card.id);
            if (result) {
                results.push(result);
            } else {
                // Jeśli fiszka nie została oceniona, dodajemy wynik z ratingiem null
                results.push({
                    cardId: card.id,
                    rating: null,
                    timeSpent: 0
                });
            }
        });

        const sessionResult: SessionResult = {
            deckTitle: this.deck.deckTitle,
            totalTime: totalTime,
            results: results,
            date: new Date().toISOString()
        };

        // Zapisujemy wyniki
        StorageManager.saveLastSession(this.deck.deckTitle, sessionResult);
        StorageManager.saveSessionResult(sessionResult);

        // Zapisujemy postęp (które fiszki zostały ocenione)
        const progress = new Map<number, boolean>();
        this.state.results.forEach((result, cardId) => {
            progress.set(cardId, true);
        });
        StorageManager.saveDeckProgress(this.deck.deckTitle, progress);

        return sessionResult;
    }

    /**
     * Zwraca listę trudnych fiszek (oznaczonych jako "unknown")
     */
    getDifficultCards(): Card[] {
        const difficultCardIds = new Set<number>();
        this.state.results.forEach((result, cardId) => {
            if (result.rating === 'unknown') {
                difficultCardIds.add(cardId);
            }
        });

        return this.cards.filter(card => difficultCardIds.has(card.id));
    }
}

