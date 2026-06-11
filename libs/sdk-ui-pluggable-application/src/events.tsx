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
    /**
     * Sets the page-title segment of the browser tab title on the host.
     *
     * @remarks
     * The host owns `document.title` and composes it as `"{pageTitle} - {brand}"`. Pass
     * `undefined` to fall back to the application's manifest title. No-ops when the application
     * runs standalone (outside the host).
     */
    setDocumentTitle: (pageTitle: string | undefined) => void;
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
    /**
     * Host callback (from pluggable mount options) to set the page-title segment of the tab title.
     */
    onDocumentTitleChange?: (pageTitle: string | undefined) => void;
}

const noop = () => undefined;

const PluggableAppEventsContext = createContext<IPluggableAppEventsContextValue>({
    emit: noop,
    emitPlatformContextReload: noop,
    setDocumentTitle: noop,
});
PluggableAppEventsContext.displayName = "PluggableAppEventsContext";

/**
 * React provider exposing pluggable-to-host event helpers.
 *
 * @alpha
 */
export function PluggableAppEventsProvider({
    onEvent,
    onDocumentTitleChange,
    children,
}: IPluggableAppEventsProviderProps) {
    const emit = useCallback(
        (event: IPluggableAppEvent) => {
            onEvent?.(event);
        },
        [onEvent],
    );

    const emitPlatformContextReload = useCallback(() => {
        emit(reloadPlatformContextRequested());
    }, [emit]);

    const setDocumentTitle = useCallback(
        (pageTitle: string | undefined) => {
            onDocumentTitleChange?.(pageTitle);
        },
        [onDocumentTitleChange],
    );

    return (
        <PluggableAppEventsContext.Provider
            value={useMemo(
                () => ({ emit, emitPlatformContextReload, setDocumentTitle }),
                [emit, emitPlatformContextReload, setDocumentTitle],
            )}
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
