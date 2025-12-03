import { Card, CardRating } from '../models';
import { SessionManager } from '../logic';
import { Timer } from '../logic';

/**
 * Renderer dla widoku fiszki
 */
export class CardView {
    private sessionManager: SessionManager;
    private onPrevious: () => void;
    private onNext: () => void;
    private onFinish: () => void;
    private onReveal: () => void;
    private onRate: (rating: 'known' | 'unknown') => void;
    private updateInterval: number | null = null;

    constructor(
        sessionManager: SessionManager,
        callbacks: {
            onPrevious: () => void;
            onNext: () => void;
            onFinish: () => void;
            onReveal: () => void;
            onRate: (rating: 'known' | 'unknown') => void;
        }
    ) {
        this.sessionManager = sessionManager;
        this.onPrevious = callbacks.onPrevious;
        this.onNext = callbacks.onNext;
        this.onFinish = callbacks.onFinish;
        this.onReveal = callbacks.onReveal;
        this.onRate = callbacks.onRate;
    }

    /**
     * Renderuje widok fiszki
     */
    render(): HTMLElement {
        const container = document.createElement('div');
        container.className = 'card-view';

        // Nagłówek z tytułem talii
        const header = this.createHeader();
        container.appendChild(header);

        // Panel statystyk
        const stats = this.createStatsPanel();
        container.appendChild(stats);

        // Główna sekcja z fiszką
        const cardSection = this.createCardSection();
        container.appendChild(cardSection);

        // Przyciski nawigacji
        const navigation = this.createNavigation();
        container.appendChild(navigation);

        // Aktualizacja statystyk co sekundę
        this.updateInterval = window.setInterval(() => {
            this.updateStats(stats);
        }, 1000);

        return container;
    }

    /**
     * Tworzy nagłówek z tytułem talii
     */
    private createHeader(): HTMLElement {
        const header = document.createElement('div');
        header.className = 'card-header';
        const title = document.createElement('h2');
        title.textContent = this.sessionManager.getDeck().deckTitle;
        header.appendChild(title);
        return header;
    }

    /**
     * Tworzy panel statystyk
     */
    private createStatsPanel(): HTMLElement {
        const stats = document.createElement('div');
        stats.className = 'stats-panel';
        this.updateStats(stats);
        return stats;
    }

    /**
     * Aktualizuje panel statystyk
     */
    private updateStats(statsElement: HTMLElement): void {
        const stats = this.sessionManager.getStatistics();
        const showTimer = this.sessionManager.getDeck().session.showTimer;

        statsElement.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">Fiszka:</span>
                <span class="stat-value">${stats.currentIndex}/${stats.totalCards}</span>
            </div>
            ${showTimer ? `
                <div class="stat-item">
                    <span class="stat-label">Czas na fiszce:</span>
                    <span class="stat-value">${Timer.formatTime(stats.currentCardTime)}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Czas sesji:</span>
                    <span class="stat-value">${Timer.formatTime(stats.totalTime)}</span>
                </div>
            ` : ''}
            <div class="stat-item">
                <span class="stat-label">Znam:</span>
                <span class="stat-value known">${stats.knownCount}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Jeszcze nie:</span>
                <span class="stat-value unknown">${stats.unknownCount}</span>
            </div>
        `;
    }

    /**
     * Tworzy sekcję z fiszką
     */
    private createCardSection(): HTMLElement {
        const section = document.createElement('div');
        section.className = 'card-section';

        const card = this.sessionManager.getCurrentCard();
        const isRevealed = this.sessionManager.isAnswerRevealed();
        const rating = this.sessionManager.getCurrentCardRating();

        // Front fiszki
        const frontDiv = document.createElement('div');
        frontDiv.className = 'card-front';
        frontDiv.innerHTML = `
            <div class="card-label">Pytanie</div>
            <div class="card-content">${card.front}</div>
            ${card.tag ? `<div class="card-tag">${card.tag}</div>` : ''}
        `;
        section.appendChild(frontDiv);

        // Przycisk "Pokaż odpowiedź"
        if (!isRevealed) {
            const revealButton = document.createElement('button');
            revealButton.className = 'btn btn-secondary';
            revealButton.textContent = 'Pokaż odpowiedź';
            revealButton.addEventListener('click', () => {
                this.sessionManager.revealAnswer();
                this.onReveal();
                this.updateCardSection(section);
            });
            section.appendChild(revealButton);
        }

        // Back fiszki (jeśli odsłonięta)
        if (isRevealed) {
            const backDiv = document.createElement('div');
            backDiv.className = 'card-back';
            backDiv.innerHTML = `
                <div class="card-label">Odpowiedź</div>
                <div class="card-content">${card.back}</div>
            `;
            section.appendChild(backDiv);

            // Przyciski oceny (jeśli jeszcze nie oceniono)
            if (rating === null) {
                const ratingButtons = document.createElement('div');
                ratingButtons.className = 'rating-buttons';
                
                const knownButton = document.createElement('button');
                knownButton.className = 'btn btn-success';
                knownButton.textContent = 'Znam';
                knownButton.addEventListener('click', () => {
                    this.sessionManager.rateCard('known');
                    this.onRate('known');
                    this.updateCardSection(section);
                    this.updateStats(document.querySelector('.stats-panel') as HTMLElement);
                    this.updateNavigation();
                });

                const unknownButton = document.createElement('button');
                unknownButton.className = 'btn btn-danger';
                unknownButton.textContent = 'Jeszcze nie';
                unknownButton.addEventListener('click', () => {
                    this.sessionManager.rateCard('unknown');
                    this.onRate('unknown');
                    this.updateCardSection(section);
                    this.updateStats(document.querySelector('.stats-panel') as HTMLElement);
                    this.updateNavigation();
                });

                ratingButtons.appendChild(knownButton);
                ratingButtons.appendChild(unknownButton);
                section.appendChild(ratingButtons);
            } else {
                // Jeśli już oceniono, pokazujemy status
                const ratingStatus = document.createElement('div');
                ratingStatus.className = `rating-status ${rating}`;
                ratingStatus.textContent = rating === 'known' ? '✓ Znam' : '✗ Jeszcze nie';
                section.appendChild(ratingStatus);
            }
        }

        return section;
    }

    /**
     * Aktualizuje sekcję z fiszką (po odsłonięciu lub ocenie)
     */
    private updateCardSection(section: HTMLElement): void {
        section.innerHTML = '';
        const newSection = this.createCardSection();
        Array.from(newSection.childNodes).forEach(node => {
            section.appendChild(node);
        });
    }

    /**
     * Tworzy przyciski nawigacji
     */
    private createNavigation(): HTMLElement {
        const nav = document.createElement('div');
        nav.className = 'card-navigation';

        const prevButton = document.createElement('button');
        prevButton.className = 'btn btn-outline';
        prevButton.textContent = 'Poprzednia';
        prevButton.disabled = !this.sessionManager.canGoPrevious();
        prevButton.addEventListener('click', () => {
            this.onPrevious();
        });

        const finishButton = document.createElement('button');
        finishButton.className = 'btn btn-warning';
        finishButton.textContent = 'Zakończ';
        finishButton.disabled = !this.sessionManager.areAllCardsRated();
        finishButton.addEventListener('click', () => {
            if (this.updateInterval !== null) {
                clearInterval(this.updateInterval);
            }
            this.onFinish();
        });

        const nextButton = document.createElement('button');
        nextButton.className = 'btn btn-outline';
        nextButton.textContent = 'Następna';
        nextButton.disabled = !this.sessionManager.canGoNext();
        nextButton.addEventListener('click', () => {
            this.onNext();
        });

        nav.appendChild(prevButton);
        nav.appendChild(finishButton);
        nav.appendChild(nextButton);

        return nav;
    }

    /**
     * Aktualizuje nawigację (szczególnie przycisk Zakończ)
     */
    private updateNavigation(): void {
        const container = document.querySelector('.card-view');
        if (container) {
            const navigation = container.querySelector('.card-navigation');
            if (navigation) {
                navigation.innerHTML = '';
                const newNav = this.createNavigation();
                Array.from(newNav.childNodes).forEach(node => {
                    navigation.appendChild(node);
                });
            }
        }
    }

    /**
     * Aktualizuje widok (po zmianie fiszki)
     */
    update(): void {
        // Metoda do wywołania z zewnątrz, gdy zmienia się fiszka
        const container = document.querySelector('.card-view');
        if (container) {
            const cardSection = container.querySelector('.card-section');
            const navigation = container.querySelector('.card-navigation');
            
            if (cardSection) {
                cardSection.innerHTML = '';
                const newSection = this.createCardSection();
                Array.from(newSection.childNodes).forEach(node => {
                    cardSection.appendChild(node);
                });
            }
            
            if (navigation) {
                navigation.innerHTML = '';
                const newNav = this.createNavigation();
                Array.from(newNav.childNodes).forEach(node => {
                    navigation.appendChild(node);
                });
            }
        }
    }

    /**
     * Czyści interwały
     */
    cleanup(): void {
        if (this.updateInterval !== null) {
            clearInterval(this.updateInterval);
        }
    }
}

