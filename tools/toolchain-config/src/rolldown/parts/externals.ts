// (C) 2026 GoodData Corporation

import { builtinModules } from "node:module";

/**
 * A rolldown external matcher: an exact module id or a pattern tested against it.
 */
export type ExternalPattern = string | RegExp;

/**
 * Node built-in modules in both their bare (`fs`) and prefixed (`node:fs`) forms.
 */
export const NODE_BUILTINS: readonly string[] = [
    ...builtinModules,
    ...builtinModules.map((moduleName) => `node:${moduleName}`),
];

/**
 * The Playwright runner loads the bundle, so it must never be inlined into it.
 */
export const PLAYWRIGHT_EXTERNALS: readonly RegExp[] = [/^@playwright\/test$/];

/**
 * Externals for a Playwright e2e bundle: the runner, every Node built-in, and whatever the package
 * adds on top (packages that rely on `__dirname` or native binaries have to stay external too).
 */
export function playwrightExternals(extra: readonly ExternalPattern[] = []): ExternalPattern[] {
    return [...PLAYWRIGHT_EXTERNALS, /^node:/, ...NODE_BUILTINS, ...extra];
}
