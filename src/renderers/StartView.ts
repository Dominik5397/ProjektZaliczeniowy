import { Deck } from '../models';

/**
 * Renderer dla ekranu startowego
 */
export class StartView {
    /**
     * Renderuje ekran startowy
     */
    static render(deck: Deck, onStart: () => void): HTMLElement {
        const container = document.createElement('div');
        container.className = 'start-view';

        const title = document.createElement('h1');
        title.className = 'deck-title';
        title.textContent = deck.deckTitle;

        const info = document.createElement('div');
        info.className = 'deck-info';
        info.innerHTML = `
            <p>Liczba fiszek: <strong>${deck.cards.length}</strong></p>
            ${deck.session.shuffle ? '<p>🔀 Fiszki będą przetasowane</p>' : ''}
            ${deck.session.showTimer ? '<p>⏱️ Timer będzie widoczny</p>' : ''}
        `;

        const startButton = document.createElement('button');
        startButton.className = 'btn btn-primary';
        startButton.textContent = 'Rozpocznij sesję';
        startButton.addEventListener('click', onStart);

        container.appendChild(title);
        container.appendChild(info);
        container.appendChild(startButton);

        return container;
    }
}

