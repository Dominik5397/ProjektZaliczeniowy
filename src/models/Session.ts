import { CardResult } from './Card';

/**
 * Wynik całej sesji
 */
export interface SessionResult {
    deckTitle: string;
    totalTime: number; // czas w milisekundach
    results: CardResult[];
    date: string; // ISO string daty
}

/**
 * Stan bieżącej sesji
 */
export interface SessionState {
    currentCardIndex: number;
    startTime: number;
    currentCardStartTime: number;
    results: Map<number, CardResult>; // cardId -> CardResult
    revealedCards: Set<number>; // cardId -> czy odpowiedź została odsłonięta
    revealTimes: Map<number, number>; // cardId -> timestamp odsłonięcia odpowiedzi
}

