// (C) 2007-2026 GoodData Corporation

// It ships no types and is consumed via a default import, which `no-restricted-exports` forbids
// declaring explicitly — the shorthand form still silences TS7016 if `noImplicitAny` is ever enabled.
// Dev-only Immutable inspector, loaded behind the DEBUG flag in Root.tsx.
declare module "immutable-devtools";

// FSA validation middleware (dropped at Phase 7.3).

declare module "redux-saga-test-plan/providers" {
    export type StaticProvider = any;
    export const StaticProvider: any;
    export const throwError: any;
    export const dynamic: any;
}

declare module "redux-saga-test-plan/matchers";
