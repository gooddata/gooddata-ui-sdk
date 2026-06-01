// (C) 2026 GoodData Corporation

// eslint-disable-next-line @typescript-eslint/naming-convention
interface Window {
    // this variable is set before e2e and causes local identifiers to be deterministic for recording snapshots
    useSafeLocalIdentifiersForE2e: boolean;
}
