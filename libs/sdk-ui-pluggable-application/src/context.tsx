// (C) 2026 GoodData Corporation

import { type PropsWithChildren, createContext, useContext } from "react";

import { invariant } from "ts-invariant";

import { type IPlatformContext } from "@gooddata/sdk-pluggable-application-model";

const PlatformContext = createContext<IPlatformContext | undefined>(undefined);
PlatformContext.displayName = "PlatformContext";

/**
 * Props for {@link PlatformContextProvider}.
 *
 * @public
 */
export interface IPlatformContextProviderProps extends PropsWithChildren {
    /**
     * Platform context snapshot.
     */
    value: IPlatformContext;
}

/**
 * React provider that binds platform context into React context.
 *
 * @public
 */
export function PlatformContextProvider({ value, children }: IPlatformContextProviderProps) {
    return <PlatformContext.Provider value={value}>{children}</PlatformContext.Provider>;
}

/**
 * Returns platform context snapshot (or undefined if not available yet).
 *
 * @public
 */
export function usePlatformContext(): IPlatformContext | undefined {
    return useContext(PlatformContext);
}

/**
 * Returns platform context snapshot and throws if it's not available.
 *
 * @public
 */
export function usePlatformContextStrict(context = "usePlatformContextStrict"): IPlatformContext {
    const value = usePlatformContext();
    invariant(
        value,
        `${context}: platform context is not available. Make sure PlatformContextProvider is mounted and the host provided a context snapshot.`,
    );
    return value;
}
