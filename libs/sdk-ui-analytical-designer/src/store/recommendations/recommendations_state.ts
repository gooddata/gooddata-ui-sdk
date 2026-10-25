// (C) 2026 GoodData Corporation

export type IDismissedRecommendationsState = string[];

// Seeded from localStorage at module load, and hardened against a missing localStorage binding,
// corrupt JSON, or a non-array value (which would break the slice's spread). The matching
// persistence WRITE lives in recommendations_sagas.ts.
function readDismissedRecommendations(): IDismissedRecommendationsState {
    try {
        const stored = globalThis.localStorage?.getItem("dismissedRecommendations");
        const parsed: unknown = stored ? JSON.parse(stored) : [];
        return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
    } catch {
        return [];
    }
}

export const dismissedRecommendationsInitialState: IDismissedRecommendationsState =
    readDismissedRecommendations();
