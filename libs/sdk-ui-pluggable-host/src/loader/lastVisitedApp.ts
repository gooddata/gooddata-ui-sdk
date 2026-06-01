// (C) 2026 GoodData Corporation

import { type ApplicationScope } from "@gooddata/sdk-model";

const STORAGE_KEY = "gdc-host-lastVisitedApp";

interface ILastVisitedAppRecord {
    [scope: string]: string;
}

/**
 * Safely parse the stored JSON record, falling back to an empty record on
 * missing or corrupt values.
 */
function safeParse(raw: string | null): ILastVisitedAppRecord {
    if (!raw) {
        return {};
    }
    try {
        return JSON.parse(raw);
    } catch {
        return {};
    }
}

/**
 * Returns the last visited app ID for the given scope, or `undefined` if none is stored
 * or the stored value cannot be read.
 */
export function getLastVisitedApp(scope: ApplicationScope): string | undefined {
    try {
        return safeParse(localStorage.getItem(STORAGE_KEY))[scope] ?? undefined;
    } catch {
        return undefined;
    }
}

/**
 * Persists the app ID that the user last visited in the given scope.
 * Silently swallows errors (e.g. storage full, private browsing).
 */
export function setLastVisitedApp(scope: ApplicationScope, appId: string): void {
    try {
        const record = safeParse(localStorage.getItem(STORAGE_KEY));
        record[scope] = appId;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
    } catch {
        // Intentionally ignored — localStorage may be unavailable or full
    }
}
