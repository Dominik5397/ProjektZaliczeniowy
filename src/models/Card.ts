/**
 * Model reprezentujący pojedynczą fiszkę
 */
export interface Card {
    id: number;
    front: string;
    back: string;
    tag?: string;
}

/**
 * Typ oceny fiszki
 */
export type CardRating = 'known' | 'unknown' | null;

/**
 * Wynik oceny pojedynczej fiszki
 */
export interface CardResult {
    cardId: number;
    rating: CardRating;
    timeSpent: number; // czas w milisekundach
}

