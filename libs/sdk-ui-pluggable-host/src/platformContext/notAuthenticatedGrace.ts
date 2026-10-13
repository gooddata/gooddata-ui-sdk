// (C) 2026 GoodData Corporation

/**
 * How long a 401 is treated as "login redirect in progress" before it is shown as an error.
 *
 * @remarks
 * The backend's not-authenticated handler navigates to the login page on every 401, so the error
 * is normally never seen. The error surfaces only when no navigation happens, e.g. the 401 carries
 * no authentication flow or an embedding host installed a handler that does not redirect.
 *
 * @internal
 */
export const NOT_AUTHENTICATED_GRACE_MS = 10_000;

/**
 * Calls `onExpired` once the grace period passes. Returns a function that cancels the call.
 *
 * @internal
 */
export function afterNotAuthenticatedGrace(onExpired: () => void): () => void {
    const timer = setTimeout(onExpired, NOT_AUTHENTICATED_GRACE_MS);
    return () => clearTimeout(timer);
}

/**
 * Resolves once the grace period passes, or immediately when `signal` aborts.
 *
 * @internal
 */
export function waitForNotAuthenticatedGrace(signal: AbortSignal): Promise<void> {
    return new Promise((resolve) => {
        if (signal.aborted) {
            resolve();
            return;
        }
        const cancel = afterNotAuthenticatedGrace(resolve);
        signal.addEventListener(
            "abort",
            () => {
                cancel();
                resolve();
            },
            { once: true },
        );
    });
}
