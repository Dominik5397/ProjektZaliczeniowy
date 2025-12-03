import { SessionResult, Card } from '../models';
import { Timer } from '../logic';
import { Deck } from '../models';

/**
 * Renderer dla widoku podsumowania sesji
 */
export class SummaryView {
    /**
     * Renderuje widok podsumowania
     */
    static render(
        result: SessionResult,
        deck: Deck,
        difficultCards: Card[],
        onBack: () => void
    ): HTMLElement {
        const container = document.createElement('div');
        container.className = 'summary-view';

        const title = document.createElement('h1');
        title.className = 'summary-title';
        title.textContent = 'Podsumowanie sesji';

        const deckTitle = document.createElement('h2');
        deckTitle.className = 'deck-title';
        deckTitle.textContent = result.deckTitle;

        // Statystyki
        const stats = this.createStats(result);
        container.appendChild(title);
        container.appendChild(deckTitle);
        container.appendChild(stats);

        // Trudne fiszki
        if (difficultCards.length > 0) {
            const difficultSection = this.createDifficultCardsSection(difficultCards);
            container.appendChild(difficultSection);
        }

        // Przycisk powrotu
        const backButton = document.createElement('button');
        backButton.className = 'btn btn-primary';
        backButton.textContent = 'Powrót';
        backButton.addEventListener('click', onBack);
        container.appendChild(backButton);

        return container;
    }

    /**
     * Tworzy sekcję ze statystykami
     */
    private static createStats(result: SessionResult): HTMLElement {
        const stats = document.createElement('div');
        stats.className = 'summary-stats';

        const knownCount = result.results.filter(r => r.rating === 'known').length;
        const unknownCount = result.results.filter(r => r.rating === 'unknown').length;
        const ratedCount = knownCount + unknownCount;
        const totalCards = result.results.length;
        
        // Średni czas tylko dla ocenionych fiszek
        const ratedResults = result.results.filter(r => r.rating !== null);
        const averageTime = ratedResults.length > 0 
            ? ratedResults.reduce((sum, r) => sum + r.timeSpent, 0) / ratedResults.length
            : 0;

        stats.innerHTML = `
            <div class="stat-card">
                <div class="stat-label">Ocenione fiszki</div>
                <div class="stat-value">${ratedCount} / ${totalCards}</div>
            </div>
            <div class="stat-card known">
                <div class="stat-label">Znam</div>
                <div class="stat-value">${knownCount}</div>
            </div>
            <div class="stat-card unknown">
                <div class="stat-label">Jeszcze nie</div>
                <div class="stat-value">${unknownCount}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Czas całkowity</div>
                <div class="stat-value">${Timer.formatTimeReadable(result.totalTime)}</div>
            </div>
            <div class="stat-card">
                <div class="stat-label">Średni czas na fiszkę</div>
                <div class="stat-value">${Timer.formatTimeReadable(averageTime)}</div>
            </div>
        `;

        return stats;
    }

    /**
     * Tworzy sekcję z trudnymi fiszkami
     */
    private static createDifficultCardsSection(difficultCards: Card[]): HTMLElement {
        const section = document.createElement('div');
        section.className = 'difficult-cards';

        const title = document.createElement('h3');
        title.textContent = 'Trudne fiszki (Jeszcze nie):';
        section.appendChild(title);

        const list = document.createElement('ul');
        list.className = 'difficult-cards-list';
        
        difficultCards.forEach(card => {
            const item = document.createElement('li');
            item.className = 'difficult-card-item';
            item.innerHTML = `
                <div class="card-front-small">
                    <strong>${card.front}</strong> → ${card.back}
                    ${card.tag ? `<span class="card-tag-small">${card.tag}</span>` : ''}
                </div>
            `;
            list.appendChild(item);
        });

        section.appendChild(list);
        return section;
    }
}

