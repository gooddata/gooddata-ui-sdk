// (C) 2026 GoodData Corporation

import { type IPlatformContext } from "./platformContext.js";

/**
 * Known generic pluggable application event types.
 *
 * @alpha
 */
export const PluggableAppEventType = {
    RELOAD_PLATFORM_CONTEXT_REQUESTED: "GDC.PLUGGABLE_APP/EVT.RELOAD_PLATFORM_CONTEXT.REQUESTED",
    DOCUMENT_TITLE_CHANGED: "GDC.PLUGGABLE_APP/EVT.DOCUMENT_TITLE.CHANGED",
} as const;

/**
 * Union of known pluggable application event type names.
 *
 * @alpha
 */
export type KnownPluggableAppEventTypeName =
    (typeof PluggableAppEventType)[keyof typeof PluggableAppEventType];

/**
 * Event type name accepted by pluggable application to host events.
 *
 * @remarks
 * This type is intentionally open for extension (`string & {}`) to preserve forward compatibility:
 * newly introduced app-specific or future platform event types should not break existing consumers at compile time.
 * For built-in platform events, prefer values from {@link PluggableAppEventType}.
 *
 * @alpha
 */
export type PluggableAppEventTypeName = KnownPluggableAppEventTypeName | (string & {});

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
    readonly type: PluggableAppEventTypeName;
    readonly payload?: unknown;
}

/**
 * Event requesting the host to reload the platform context.
 *
 * @alpha
 */
export interface IReloadPlatformContextRequestedEvent extends IPluggableAppEvent {
    readonly type: "GDC.PLUGGABLE_APP/EVT.RELOAD_PLATFORM_CONTEXT.REQUESTED";
}

/**
 * Creates an {@link IReloadPlatformContextRequestedEvent}.
 *
 * @alpha
 */
export function reloadPlatformContextRequested(): IReloadPlatformContextRequestedEvent {
    return { type: "GDC.PLUGGABLE_APP/EVT.RELOAD_PLATFORM_CONTEXT.REQUESTED" };
}

/**
 * Type guard for {@link IReloadPlatformContextRequestedEvent}.
 *
 * @alpha
 */
export function isReloadPlatformContextRequestedEvent(
    obj: unknown,
): obj is IReloadPlatformContextRequestedEvent {
    return (
        typeof obj === "object" &&
        obj !== null &&
        "type" in obj &&
        (obj as { type?: unknown }).type === "GDC.PLUGGABLE_APP/EVT.RELOAD_PLATFORM_CONTEXT.REQUESTED"
    );
}

/**
 * Event setting the page-title segment of the browser tab title on the host.
 *
 * @remarks
 * The host owns `document.title` and composes it as `"{pageTitle} - {brand}"`. A `pageTitle` of
 * `undefined` tells the host to fall back to the application's manifest title.
 *
 * @alpha
 */
export interface IDocumentTitleChangedEvent extends IPluggableAppEvent {
    readonly type: "GDC.PLUGGABLE_APP/EVT.DOCUMENT_TITLE.CHANGED";
    readonly payload: {
        readonly pageTitle: string | undefined;
    };
}

/**
 * Creates an {@link IDocumentTitleChangedEvent}.
 *
 * @alpha
 */
export function documentTitleChanged(pageTitle: string | undefined): IDocumentTitleChangedEvent {
    return { type: "GDC.PLUGGABLE_APP/EVT.DOCUMENT_TITLE.CHANGED", payload: { pageTitle } };
}

/**
 * Type guard for {@link IDocumentTitleChangedEvent}.
 *
 * @remarks
 * Validates the payload shape too (not just the type), so a malformed event — e.g. one emitted
 * from JS or a mismatched remote module without the expected `payload` — is rejected rather than
 * narrowed to a type whose later `payload.pageTitle` access would throw.
 *
 * @alpha
 */
export function isDocumentTitleChangedEvent(obj: unknown): obj is IDocumentTitleChangedEvent {
    if (
        typeof obj !== "object" ||
        obj === null ||
        (obj as { type?: unknown }).type !== "GDC.PLUGGABLE_APP/EVT.DOCUMENT_TITLE.CHANGED"
    ) {
        return false;
    }
    const payload = (obj as { payload?: unknown }).payload;
    if (typeof payload !== "object" || payload === null) {
        return false;
    }
    const pageTitle = (payload as { pageTitle?: unknown }).pageTitle;
    return typeof pageTitle === "string" || pageTitle === undefined;
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
 * Header customization options that a pluggable application can push to the host shell.
 *
 * @remarks
 * The host shell owns the application header. A pluggable application can declare its preferred
 * header configuration by calling the {@link IPluggableApplicationMountOptions.onHeaderChange}
 * callback at mount time or whenever the configuration needs to change (e.g. after locale switch).
 *
 * All fields are optional — only the fields provided are applied; the host uses its own defaults
 * for anything not specified.
 *
 * @alpha
 */
export interface IAppHeaderOptions {
    /**
     * Help menu items to show in the host header when this application is active.
     *
     * @remarks
     * Each item is a plain data object. Use `label` for a pre-translated display string;
     * when omitted the host falls back to looking up `key` as an intl message ID.
     *
     * When not provided, the host falls back to its default static help items.
     */
    helpMenuItems?: Array<{
        key: string;
        label?: string;
        href?: string;
        target?: string;
        className?: string;
        iconName?: string;
    }>;
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

    /**
     * Callback invoked by the pluggable application to push chrome customizations to the host shell.
     *
     * @remarks
     * Call this at mount time to declare the application's preferred header configuration
     * (e.g. help menu items). Can be called again at any time to update the configuration —
     * for example after a locale change that affects translated item labels.
     *
     * The provided object replaces the current header options entirely.
     * The host falls back to its own defaults for any fields not present.
     */
    onHeaderChange?: (header: IAppHeaderOptions) => void;
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

    /**
     * Organization IDs allowed to load this app.
     *
     * @remarks
     * The host enforces this check only for apps loaded from a secured remote origin
     * (e.g. the shared demo plugins bucket). When enforced, the current organization's
     * id must appear in this list or the host refuses to mount the app. Apps loaded
     * from any other origin (same-hostname remotes, local modules) are not subject
     * to this check.
     *
     * @alpha
     */
    allowedOrganizations?: string[];

    /**
     * Unix milliseconds timestamp captured at build time.
     *
     * @remarks
     * The host enforces this check only for apps loaded from a secured remote origin
     * (e.g. the shared demo plugins bucket). When enforced, builds older than the host's
     * freshness window are rejected. Apps loaded from any other origin are not subject
     * to this check.
     *
     * @alpha
     */
    buildTimestamp?: number;
}
