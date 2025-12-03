import { Deck } from './models';
import { SessionManager } from './logic';
import { StartView, CardView, SummaryView } from './renderers';
import deckData from './data/deck.json';

/**
 * Główna klasa aplikacji
 */
class FiszkiApp {
    private appContainer: HTMLElement;
    private deck: Deck;
    private sessionManager: SessionManager | null = null;
    private cardView: CardView | null = null;

    constructor() {
        const appElement = document.getElementById('app');
        if (!appElement) {
            throw new Error('Element #app nie został znaleziony');
        }
        this.appContainer = appElement;

        // Wczytujemy dane talii
        this.deck = deckData as Deck;

        // Wyświetlamy ekran startowy
        this.showStartView();
    }

    /**
     * Wyświetla ekran startowy
     */
    private showStartView(): void {
        this.appContainer.innerHTML = '';
        const startView = StartView.render(this.deck, () => {
            this.startSession();
        });
        this.appContainer.appendChild(startView);
    }

    /**
     * Rozpoczyna sesję
     */
    private startSession(): void {
        this.sessionManager = new SessionManager(this.deck);
        this.showCardView();
    }

    /**
     * Wyświetla widok fiszki
     */
    private showCardView(): void {
        if (!this.sessionManager) return;

        this.appContainer.innerHTML = '';
        
        this.cardView = new CardView(this.sessionManager, {
            onPrevious: () => {
                this.sessionManager!.goToPrevious();
                this.cardView!.update();
            },
            onNext: () => {
                this.sessionManager!.goToNext();
                this.cardView!.update();
            },
            onFinish: () => {
                this.finishSession();
            },
            onReveal: () => {
                // Odświeżamy widok po odsłonięciu odpowiedzi
                this.cardView!.update();
            },
            onRate: () => {
                // Odświeżamy widok po ocenie
                this.cardView!.update();
            }
        });

        const cardViewElement = this.cardView.render();
        this.appContainer.appendChild(cardViewElement);
    }

    /**
     * Kończy sesję i wyświetla podsumowanie
     */
    private finishSession(): void {
        if (!this.sessionManager) return;

        // Czyścimy interwały
        if (this.cardView) {
            this.cardView.cleanup();
        }

        const result = this.sessionManager.finishSession();
        const difficultCards = this.sessionManager.getDifficultCards();

        this.appContainer.innerHTML = '';
        const summaryView = SummaryView.render(
            result,
            this.deck,
            difficultCards,
            () => {
                this.showStartView();
            }
        );
        this.appContainer.appendChild(summaryView);
    }
}

// Inicjalizacja aplikacji po załadowaniu DOM
document.addEventListener('DOMContentLoaded', () => {
    new FiszkiApp();
});

