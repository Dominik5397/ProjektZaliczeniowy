import { Card } from './Card';

/**
 * Ustawienia sesji
 */
export interface SessionSettings {
    shuffle: boolean;
    showTimer: boolean;
}

/**
 * Model reprezentujący talię fiszek
 */
export interface Deck {
    deckTitle: string;
    cards: Card[];
    session: SessionSettings;
}

