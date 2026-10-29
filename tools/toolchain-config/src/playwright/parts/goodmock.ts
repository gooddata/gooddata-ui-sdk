// (C) 2026 GoodData Corporation

/**
 * Retries for a goodmock-backed suite. A recording run must not retry: a retried test records its
 * requests twice and corrupts the mapping storage.
 */
export function goodmockRetries(recording: boolean, retries = 2): number {
    return recording ? 0 : retries;
}
