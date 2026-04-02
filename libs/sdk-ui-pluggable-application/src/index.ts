// (C) 2026 GoodData Corporation

/* oxlint-disable no-barrel-files/no-barrel-files */

/**
 * React helpers for pluggable application integration.
 *
 * @packageDocumentation
 */

export {
    type IClientPlatformContext,
    PlatformContextProvider,
    type IPlatformContextProviderProps,
    usePlatformContext,
    usePlatformContextStrict,
} from "./context.js";

export { createBackendForModule, type ICreateBackendForModuleOptions } from "./backend.js";
