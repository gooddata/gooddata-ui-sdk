// (C) 2026 GoodData Corporation

import {
    type IPlatformContext,
    type IPluggableAppTelemetryCallbacks,
    type ITelemetryProvider,
    type TelemetryIdentityMode,
} from "@gooddata/sdk-pluggable-application-model";

/**
 * Telemetry provider that a headless module registers, as the runtime passes it to the host.
 *
 * @alpha
 */
export interface IHeadlessTelemetryProviderRegistration {
    moduleId: string;
    provider: ITelemetryProvider;
    identity: TelemetryIdentityMode;
    ctx: IPlatformContext;
    /**
     * Whether the host may give the provider the records from the page start. It is false after the
     * page switched to another user or organization, because those records belong to that principal.
     */
    replayPageStart: boolean;
}

/**
 * Telemetry services that the host gives to the runtime.
 *
 * @alpha
 */
export interface IHostTelemetryServices {
    /**
     * Creates the callbacks through which an application or the host UI reports its telemetry.
     */
    createTelemetryCallbacks?: (appId: string) => IPluggableAppTelemetryCallbacks;
    /**
     * Connects a telemetry provider of a headless module to the host telemetry. Returns a function that
     * disconnects it. Without this service the runtime ignores the providers.
     */
    registerTelemetryProvider?: (registration: IHeadlessTelemetryProviderRegistration) => () => void;
}
