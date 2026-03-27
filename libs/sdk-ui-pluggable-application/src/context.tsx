// (C) 2026 GoodData Corporation

import { type PropsWithChildren, createContext, useContext } from "react";

import { invariant } from "ts-invariant";

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { type IPlatformContext } from "@gooddata/sdk-pluggable-application-model";

/**
 * Platform context extended with a client-created backend instance.
 *
 * @remarks
 * Client applications receive `IPlatformContext` from the shell (which
 * contains auth credentials but no backend). They create their own backend
 * using those credentials and produce an `IClientPlatformContext` which
 * includes the backend instance.
 *
 * The backend's `internal_backendSpecificFunctions` field carries any
 * backend-specific escape hatches (e.g., tiger-specific functions)
 * automatically.
 *
 * @public
 */
export interface IClientPlatformContext extends IPlatformContext {
    /**
     * Backend instance created by the client application from the
     * auth credentials in the platform context.
     */
    backend: IAnalyticalBackend;
}

const PlatformContext = createContext<IClientPlatformContext | undefined>(undefined);
PlatformContext.displayName = "PlatformContext";

/**
 * Props for {@link PlatformContextProvider}.
 *
 * @public
 */
export interface IPlatformContextProviderProps extends PropsWithChildren {
    /**
     * Client platform context snapshot (includes the client-created backend).
     */
    value: IClientPlatformContext;
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
 * Returns client platform context snapshot (or undefined if not available yet).
 *
 * @public
 */
export function usePlatformContext(): IClientPlatformContext | undefined {
    return useContext(PlatformContext);
}

/**
 * Returns client platform context snapshot and throws if it's not available.
 *
 * @public
 */
export function usePlatformContextStrict(context = "usePlatformContextStrict"): IClientPlatformContext {
    const value = usePlatformContext();
    invariant(
        value,
        `${context}: platform context is not available. Make sure PlatformContextProvider is mounted and the host provided a context snapshot.`,
    );
    return value;
}
