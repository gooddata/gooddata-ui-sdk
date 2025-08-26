// (C) 2007-2025 GoodData Corporation

/**
 * Creates a callback function that only executes if the state context matches.
 * This prevents stale callbacks from executing after component state changes.
 *
 * @param callback - The callback function to wrap
 * @param currentContext - The current context/state reference
 * @param getContext - Function to get the current context/state at execution time
 * @returns The wrapped callback that checks context before executing
 */
export function createStateBoundCallback<T extends (...args: any[]) => any, C>(
    callback: T,
    currentContext: C,
    getContext: () => C,
): T {
    return ((...args: Parameters<T>) => {
        if (getContext() !== currentContext) {
            return;
        }
        return callback(...args);
    }) as T;
}

/**
 * Creates a debounced version of a callback with a specified timeout.
 *
 * @param callback - The callback to debounce
 * @param timeout - The debounce timeout in milliseconds
 * @returns The debounced callback
 */
export function createDebouncedCallback<T extends (...args: any[]) => any>(callback: T, timeout: number): T {
    let timeoutId: number | undefined;

    return ((...args: Parameters<T>) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        timeoutId = window.setTimeout(() => {
            callback(...args);
            timeoutId = undefined;
        }, timeout);
    }) as T;
}
