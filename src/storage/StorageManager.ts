import { SessionResult } from '../models';

/**
 * Klucze używane w localStorage
 */
const STORAGE_KEYS = {
    LAST_SESSION: 'fiszki_last_session',
    SESSION_RESULTS: 'fiszki_session_results',
    DECK_PROGRESS: 'fiszki_deck_progress'
} as const;

/**
 * Manager obsługujący zapis i odczyt danych z localStorage
 */
export class StorageManager {
    /**
     * Zapisuje wynik ostatniej sesji
     */
    static saveLastSession(deckTitle: string, result: SessionResult): void {
        const key = `${STORAGE_KEYS.LAST_SESSION}_${deckTitle}`;
        localStorage.setItem(key, JSON.stringify(result));
    }

    /**
     * Pobiera wynik ostatniej sesji dla danej talii
     */
    static getLastSession(deckTitle: string): SessionResult | null {
        const key = `${STORAGE_KEYS.LAST_SESSION}_${deckTitle}`;
        const data = localStorage.getItem(key);
        if (!data) return null;
        
        try {
            return JSON.parse(data) as SessionResult;
        } catch {
            return null;
        }
    }

    /**
     * Zapisuje wynik sesji do historii
     */
    static saveSessionResult(result: SessionResult): void {
        const results = this.getAllSessionResults();
        results.push(result);
        localStorage.setItem(STORAGE_KEYS.SESSION_RESULTS, JSON.stringify(results));
    }

    /**
     * Pobiera wszystkie wyniki sesji
     */
    static getAllSessionResults(): SessionResult[] {
        const data = localStorage.getItem(STORAGE_KEYS.SESSION_RESULTS);
        if (!data) return [];
        
        try {
            return JSON.parse(data) as SessionResult[];
        } catch {
            return [];
        }
    }

    /**
     * Zapisuje postęp dla danej talii (które fiszki zostały ocenione)
     */
    static saveDeckProgress(deckTitle: string, progress: Map<number, boolean>): void {
        const key = `${STORAGE_KEYS.DECK_PROGRESS}_${deckTitle}`;
        const progressObj: Record<string, boolean> = {};
        progress.forEach((value, cardId) => {
            progressObj[cardId.toString()] = value;
        });
        localStorage.setItem(key, JSON.stringify(progressObj));
    }

    /**
     * Pobiera postęp dla danej talii
     */
    static getDeckProgress(deckTitle: string): Map<number, boolean> | null {
        const key = `${STORAGE_KEYS.DECK_PROGRESS}_${deckTitle}`;
        const data = localStorage.getItem(key);
        if (!data) return null;
        
        try {
            const progressObj = JSON.parse(data) as Record<string, boolean>;
            const progress = new Map<number, boolean>();
            Object.entries(progressObj).forEach(([cardId, value]) => {
                progress.set(parseInt(cardId, 10), value);
            });
            return progress;
        } catch {
            return null;
        }
    }

    /**
     * Czyści wszystkie dane aplikacji
     */
    static clearAll(): void {
        Object.values(STORAGE_KEYS).forEach(key => {
            // Usuwamy wszystkie klucze zaczynające się od prefiksów
            for (let i = 0; i < localStorage.length; i++) {
                const storageKey = localStorage.key(i);
                if (storageKey && storageKey.startsWith('fiszki_')) {
                    localStorage.removeItem(storageKey);
                }
            }
        });
    }
}

