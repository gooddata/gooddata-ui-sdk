// (C) 2022-2024 GoodData Corporation
// declare package json so that we can import it even without resolveJsonModule which breaks outputs
declare module "*/package.json" {
    export const name: string;
    export const version: string;
}

interface Window {
    // this variable is set before e2e and causes widget identifiers to be deterministic for recording snapshots
    useSafeWidgetLocalIdentifiersForE2e: boolean;
}
