// (C) 2026 GoodData Corporation

import { useSyncExternalStore } from "react";

/**
 * Host-wide latch for the tier of an expired contract or deployment license.
 *
 * @remarks
 * The backend reports the denial through `onContractExpired`, which fires from any request made through
 * the host backend (bootstrap included). The value is latched because the condition is deployment-wide
 * and cannot clear without a reload; the first tier reported wins.
 */
let expiredTier: string | undefined;
const listeners = new Set<() => void>();

export function notifyContractExpired(tier: string): void {
    if (expiredTier !== undefined) {
        return;
    }
    expiredTier = tier;
    listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

function getSnapshot(): string | undefined {
    return expiredTier;
}

/**
 * Returns the tier of the expired contract once the backend has reported one, otherwise `undefined`.
 */
export function useContractExpiredTier(): string | undefined {
    return useSyncExternalStore(subscribe, getSnapshot);
}
