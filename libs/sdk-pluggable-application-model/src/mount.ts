// (C) 2026 GoodData Corporation

import { type IPlatformContext } from "./platformContext.js";

/**
 * Event emitted by the pluggable application towards the host.
 *
 * @remarks
 * The host is the single writer of the canonical platform context. Use these events to request changes;
 * the host decides what (if anything) to apply and then pushes updated context down via the `updateContext` callback
 * on the mounted instance.
 *
 * @alpha
 */
export interface IPluggableAppEvent {
    // TODO: This should be a union of known event types
    type: string;
    payload?: unknown;
}

/**
 * Telemetry channel determines which analytics pipeline receives the event.
 *
 * @remarks
 * - `"standard"` — default channel for general UI events.
 * - `"ai"` — channel for AI-related events that require separate compliance handling.
 *
 * @alpha
 */
export type TelemetryChannel = "standard" | "ai";

/**
 * Optional configuration for a telemetry event.
 *
 * @alpha
 */
export interface ITelemetryEventOptions {
    /**
     * Which analytics channel to route the event to.
     *
     * @defaultValue `"standard"`
     */
    channel?: TelemetryChannel;
}

/**
 * Telemetry callbacks provided by the shell to pluggable applications.
 *
 * @remarks
 * Pluggable applications can use these methods to log events through the shell's
 * centralized telemetry system. All events are automatically tagged with the
 * source application ID.
 *
 * @alpha
 */
export interface IPluggableAppTelemetryCallbacks {
    /**
     * Track a custom telemetry event from the pluggable application.
     *
     * @param eventName - Name of the event.
     * @param data - Optional key-value payload.
     * @param options - Optional event configuration (e.g. channel routing).
     */
    trackEvent: (eventName: string, data?: Record<string, unknown>, options?: ITelemetryEventOptions) => void;
    /** Track a page view within the pluggable application. */
    trackPageView: (page: string) => void;
    /** Track a timing measurement from the pluggable application. */
    trackTiming: (variable: string, label: string, valueMs: number) => void;
}

/**
 * Options passed by the host into a pluggable application's mount function.
 *
 * @alpha
 */
export interface IPluggableApplicationMountOptions {
    /**
     * Unique application instance identifier.
     */
    id: string;

    /**
     * DOM element into which the pluggable application should render itself.
     */
    container: HTMLElement;

    /**
     * Platform context snapshot provided by the host.
     */
    ctx: IPlatformContext;

    /**
     * Base path under which the pluggable application should consider itself mounted.
     *
     * @example
     * `/organization/someOrg/apps/someApp`
     */
    basePath: string;

    /**
     * Callback invoked by the pluggable application to emit events.
     *
     * @remarks
     * The host remains the single writer of the canonical platform context; pluggable application emits events
     * and host applies changes (if any) and publishes updated context via the `updateContext` callback on the mounted
     * instance.
     */
    onEvent?: (e: IPluggableAppEvent) => void;

    /**
     * Telemetry callbacks for the pluggable application to track events through the shell's
     * centralized telemetry system.
     *
     * @remarks
     * This is the preferred way for pluggable applications to emit telemetry. Events are
     * automatically tagged with the source application ID and forwarded to all configured
     * telemetry providers registered in the shell application.
     */
    onTelemetryEvent?: IPluggableAppTelemetryCallbacks;
}

/**
 * Handle returned from mount for lifecycle management and host -\> module interaction.
 *
 * @alpha
 */
export interface IPluggableApplicationMountHandle {
    /**
     * Unmounts the pluggable application and releases all resources.
     */
    unmount(): void;

    /**
     * Updates context snapshot in the pluggable application.
     *
     * @remarks
     * Host uses this to push down context changes after initial mount.
     */
    updateContext?: (ctx: IPlatformContext) => void;
}

/**
 * Pluggable application mount function signature.
 *
 * @alpha
 */
export type PluggableApplicationMount = (
    options: IPluggableApplicationMountOptions,
) => IPluggableApplicationMountHandle;

/**
 * Mounted application instance.
 *
 * @alpha
 */
export interface IAppInstance extends IPluggableApplicationMountHandle {
    id: string;
}

/**
 * Pluggable application entrypoint.
 *
 * @alpha
 */
export interface IPluggableApp {
    mount: PluggableApplicationMount;
}
