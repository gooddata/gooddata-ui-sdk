// (C) 2026 GoodData Corporation

// Deliberately import-free: the leave-anyway saga reaches this, and the store module already pulls in
// the root saga, so importing the store here would close an import cycle.
let pendingHostNavigation: (() => void) | undefined;

export function setPendingHostNavigation(proceed: () => void): void {
    pendingHostNavigation = proceed;
}

export function clearPendingHostNavigation(): void {
    pendingHostNavigation = undefined;
}

export function runPendingHostNavigation(): void {
    const proceed = pendingHostNavigation;
    pendingHostNavigation = undefined;
    proceed?.();
}
