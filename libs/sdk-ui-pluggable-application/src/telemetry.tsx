// (C) 2026 GoodData Corporation

import { type PropsWithChildren, createContext, useContext, useMemo } from "react";

import { type IPluggableAppTelemetryCallbacks } from "@gooddata/sdk-pluggable-application-model";

/**
 * Metadata describing the module runtime that owns the telemetry callbacks.
 *
 * @remarks
 * Attached to every {@link @gooddata/sdk-pluggable-application-model#IPluggableAppTelemetryCallbacks.trackEvent}
 * payload so events can be attributed to the module's own React / SDK versions. These may differ from the
 * host's (which the host attaches as `hostReactVersion` / `hostSdkVersion`) when a module bundles its own
 * React instead of consuming the host's shared singleton.
 *
 * Capture the versions at the module's mount entry — `import { version } from "react"` and
 * `import { LIB_VERSION } from "@gooddata/sdk-pluggable-application-model"` — and pass them in. Reading them
 * inside this shared library would resolve to the host's copies under module federation.
 *
 * @alpha
 */
export interface IModuleTelemetryMetadata {
    /**
     * Version of React that rendered the module, e.g. `import { version } from "react"`.
     */
    moduleReactVersion?: string;
    /**
     * Version of the GoodData SDK the module is built against, e.g.
     * `import { LIB_VERSION } from "@gooddata/sdk-pluggable-application-model"`.
     */
    moduleSdkVersion?: string;
}

/**
 * Wraps host telemetry callbacks so every `trackEvent` call also reports the module's runtime metadata.
 *
 * @remarks
 * The metadata is merged into the event `data` before the host's own `data` keys, so an explicit key in
 * the call site's `data` wins on collision (mirroring how the host merges its common properties).
 * `trackPageView` and `trackTiming` are passed through unchanged — they carry no `data` slot today.
 * Returns `undefined` when given `undefined`, so a standalone module (mounted outside the host) stays a no-op.
 *
 * @alpha
 */
export function enrichTelemetryCallbacks(
    callbacks: IPluggableAppTelemetryCallbacks | undefined,
    metadata: IModuleTelemetryMetadata,
): IPluggableAppTelemetryCallbacks | undefined {
    if (!callbacks) {
        return undefined;
    }
    return {
        ...callbacks,
        trackEvent(eventName, data, options) {
            callbacks.trackEvent(eventName, { ...metadata, ...data }, options);
        },
    };
}

const noop = () => undefined;

const defaultTelemetry: IPluggableAppTelemetryCallbacks = {
    trackEvent: noop,
    trackPageView: noop,
    trackTiming: noop,
};

const PluggableAppTelemetryContext = createContext<IPluggableAppTelemetryCallbacks>(defaultTelemetry);
PluggableAppTelemetryContext.displayName = "PluggableAppTelemetryContext";

/**
 * Props for {@link PluggableAppTelemetryProvider}.
 *
 * @alpha
 */
export interface IPluggableAppTelemetryProviderProps extends PropsWithChildren, IModuleTelemetryMetadata {
    /**
     * Host telemetry callbacks passed through pluggable mount options.
     */
    onTelemetryEvent?: IPluggableAppTelemetryCallbacks;
}

/**
 * React provider exposing telemetry callbacks enriched with the module's runtime metadata.
 *
 * @remarks
 * Components consume the enriched callbacks via {@link usePluggableAppTelemetry} and never handle the
 * module metadata themselves — it lives in the provider's closure. No-ops safely when `onTelemetryEvent`
 * is absent (e.g. standalone runs outside the host).
 *
 * @alpha
 */
export function PluggableAppTelemetryProvider({
    onTelemetryEvent,
    moduleReactVersion,
    moduleSdkVersion,
    children,
}: IPluggableAppTelemetryProviderProps) {
    const value = useMemo(
        () =>
            enrichTelemetryCallbacks(onTelemetryEvent, { moduleReactVersion, moduleSdkVersion }) ??
            defaultTelemetry,
        [onTelemetryEvent, moduleReactVersion, moduleSdkVersion],
    );

    return (
        <PluggableAppTelemetryContext.Provider value={value}>
            {children}
        </PluggableAppTelemetryContext.Provider>
    );
}

/**
 * Returns telemetry callbacks enriched with the module's runtime metadata.
 *
 * @alpha
 */
export function usePluggableAppTelemetry(): IPluggableAppTelemetryCallbacks {
    return useContext(PluggableAppTelemetryContext);
}
