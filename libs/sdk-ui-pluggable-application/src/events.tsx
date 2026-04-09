// (C) 2026 GoodData Corporation

import { type PropsWithChildren, createContext, useCallback, useContext, useMemo } from "react";

import {
    type IPluggableAppEvent,
    reloadPlatformContextRequested,
} from "@gooddata/sdk-pluggable-application-model";

/**
 * Value exposed by {@link PluggableAppEventsProvider}.
 *
 * @alpha
 */
export interface IPluggableAppEventsContextValue {
    /**
     * Emits arbitrary event to host.
     */
    emit: (event: IPluggableAppEvent) => void;
    /**
     * Emits a standard platform-context reload request to host.
     */
    emitPlatformContextReload: () => void;
}

/**
 * Props for {@link PluggableAppEventsProvider}.
 *
 * @alpha
 */
export interface IPluggableAppEventsProviderProps extends PropsWithChildren {
    /**
     * Host callback passed through pluggable mount options.
     */
    onEvent?: (event: IPluggableAppEvent) => void;
}

const noop = () => undefined;

const PluggableAppEventsContext = createContext<IPluggableAppEventsContextValue>({
    emit: noop,
    emitPlatformContextReload: noop,
});
PluggableAppEventsContext.displayName = "PluggableAppEventsContext";

/**
 * React provider exposing pluggable-to-host event helpers.
 *
 * @alpha
 */
export function PluggableAppEventsProvider({ onEvent, children }: IPluggableAppEventsProviderProps) {
    const emit = useCallback(
        (event: IPluggableAppEvent) => {
            onEvent?.(event);
        },
        [onEvent],
    );

    const emitPlatformContextReload = useCallback(() => {
        emit(reloadPlatformContextRequested());
    }, [emit]);

    return (
        <PluggableAppEventsContext.Provider
            value={useMemo(() => ({ emit, emitPlatformContextReload }), [emit, emitPlatformContextReload])}
        >
            {children}
        </PluggableAppEventsContext.Provider>
    );
}

/**
 * Returns event helpers for communication with host.
 *
 * @alpha
 */
export function usePluggableAppEvents(): IPluggableAppEventsContextValue {
    return useContext(PluggableAppEventsContext);
}
