// (C) 2026 GoodData Corporation

import { type IGenAIUserContext } from "@gooddata/sdk-model";

import { type IPlatformContext } from "./platformContext.js";

/**
 * Known generic pluggable application event types.
 *
 * @alpha
 */
export const PluggableAppEventType = {
    RELOAD_PLATFORM_CONTEXT_REQUESTED: "GDC.PLUGGABLE_APP/EVT.RELOAD_PLATFORM_CONTEXT.REQUESTED",
    DOCUMENT_TITLE_CHANGED: "GDC.PLUGGABLE_APP/EVT.DOCUMENT_TITLE.CHANGED",
    AI_ASSISTANT_OPEN_REQUESTED: "GDC.PLUGGABLE_APP/EVT.AI_ASSISTANT.OPEN_REQUESTED",
    AI_ASSISTANT_CLOSE_REQUESTED: "GDC.PLUGGABLE_APP/EVT.AI_ASSISTANT.CLOSE_REQUESTED",
    AI_ASSISTANT_CONTEXT_CHANGED: "GDC.PLUGGABLE_APP/EVT.AI_ASSISTANT.CONTEXT_CHANGED",
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
 * Event requesting the host to open its AI assistant chat.
 *
 * @remarks
 * The host shell owns the AI assistant on hosted-application routes — a pluggable application must
 * not render its own chat dialog there (two assistants would overlay each other and a duplicate
 * could auto-open from the shared open-state, see LX-2544). Instead, its in-content entry points
 * (e.g. a "Summarize" action) emit this event and the host opens its chat, optionally seeded with a
 * question and the user's location context. Tag scoping for the assistant's object search is carried
 * separately via {@link IAiAssistantContextChangedEvent}, which reflects the app's current view.
 *
 * @alpha
 */
export interface IOpenAiAssistantRequestedEvent extends IPluggableAppEvent {
    readonly type: "GDC.PLUGGABLE_APP/EVT.AI_ASSISTANT.OPEN_REQUESTED";
    readonly payload: {
        /**
         * Question to seed the chat with. When omitted, the chat just opens.
         */
        readonly question?: string;
        /**
         * Context of the user's current location (e.g. the active dashboard and its widgets),
         * passed to the assistant alongside the seeded question.
         */
        readonly userContext?: IGenAIUserContext;
        /**
         * When true, the question is appended to the existing chat, otherwise it replaces the existing chat.
         */
        readonly appendToChat?: boolean;
        /**
         * When true, the userContext is replaced with the new one, otherwise it is merged with the existing one.
         */
        readonly replaceUserContext?: boolean;
    };
}

/**
 * Creates an {@link IOpenAiAssistantRequestedEvent}.
 *
 * @alpha
 */
export function openAiAssistantRequested(payload?: {
    question?: string;
    userContext?: IGenAIUserContext;
    appendToChat?: boolean;
    replaceUserContext?: boolean;
}): IOpenAiAssistantRequestedEvent {
    return { type: "GDC.PLUGGABLE_APP/EVT.AI_ASSISTANT.OPEN_REQUESTED", payload: payload ?? {} };
}

/**
 * Type guard for {@link IOpenAiAssistantRequestedEvent}.
 *
 * @remarks
 * Validates the payload shape too (not just the type), so a malformed event — e.g. one emitted
 * from JS or a mismatched remote module — is rejected rather than narrowed to a type whose later
 * `payload.question` access would throw.
 *
 * @alpha
 */
export function isOpenAiAssistantRequestedEvent(obj: unknown): obj is IOpenAiAssistantRequestedEvent {
    if (
        typeof obj !== "object" ||
        obj === null ||
        (obj as { type?: unknown }).type !== "GDC.PLUGGABLE_APP/EVT.AI_ASSISTANT.OPEN_REQUESTED"
    ) {
        return false;
    }
    const payload = (obj as { payload?: unknown }).payload;
    if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
        return false;
    }
    const { question, userContext } = payload as { question?: unknown; userContext?: unknown };
    const questionOk = typeof question === "string" || question === undefined;
    // userContext is an opaque structured object; validate only that it is an object when present
    // so a later property read on the host side cannot throw.
    const userContextOk =
        userContext === undefined || (typeof userContext === "object" && userContext !== null);
    return questionOk && userContextOk;
}

/**
 * Event requesting the host to close its AI assistant chat.
 *
 * @remarks
 * Counterpart to {@link IOpenAiAssistantRequestedEvent}. A pluggable application emits this when one
 * of its in-content controls toggles the assistant closed (e.g. an embedded AI button), so the
 * host-owned chat closes in step with the application.
 *
 * @alpha
 */
export interface ICloseAiAssistantRequestedEvent extends IPluggableAppEvent {
    readonly type: "GDC.PLUGGABLE_APP/EVT.AI_ASSISTANT.CLOSE_REQUESTED";
}

/**
 * Creates an {@link ICloseAiAssistantRequestedEvent}.
 *
 * @alpha
 */
export function closeAiAssistantRequested(): ICloseAiAssistantRequestedEvent {
    return { type: "GDC.PLUGGABLE_APP/EVT.AI_ASSISTANT.CLOSE_REQUESTED" };
}

/**
 * Type guard for {@link ICloseAiAssistantRequestedEvent}.
 *
 * @alpha
 */
export function isCloseAiAssistantRequestedEvent(obj: unknown): obj is ICloseAiAssistantRequestedEvent {
    return (
        typeof obj === "object" &&
        obj !== null &&
        (obj as { type?: unknown }).type === "GDC.PLUGGABLE_APP/EVT.AI_ASSISTANT.CLOSE_REQUESTED"
    );
}

/**
 * Event informing the host of the active application's current AI-assistant tag scope.
 *
 * @remarks
 * A hosted application can constrain its catalog to objects tagged in a certain way (e.g. AD's
 * `includeObjectsWithTags` route filter). Because the host owns the single chat instance on hosted
 * routes, the application forwards its current tag scope through this event so the host assistant's
 * object search/autocomplete stays within the same scope the rest of the application enforces.
 * The host keeps the latest reported scope and clears it (empty arrays / omitted) when the
 * application no longer constrains its catalog.
 *
 * @alpha
 */
export interface IAiAssistantContextChangedEvent extends IPluggableAppEvent {
    readonly type: "GDC.PLUGGABLE_APP/EVT.AI_ASSISTANT.CONTEXT_CHANGED";
    readonly payload: {
        /**
         * Tag identifiers the assistant's object search should be restricted to. Empty/omitted
         * means no include filter.
         */
        readonly includeTags?: string[];
        /**
         * Tag identifiers the assistant's object search should exclude. Empty/omitted means no
         * exclude filter.
         */
        readonly excludeTags?: string[];
        /**
         * Where the application wants the host chat positioned (e.g. an embedded dashboard places it
         * left/right via the `showassistant` URL param). Omitted leaves the default placement.
         */
        readonly dialogPosition?: "left" | "right";
        /**
         * Whether the application is running embedded (no host chrome). The host uses this to apply
         * the embedded chat presentation and to delegate link clicks back to the application.
         */
        readonly embedded?: boolean;
        /**
         * Ambient user context reflecting the application's current view (e.g. the open dashboard,
         * its live filter state and widgets). The host keeps the latest reported context and passes
         * it to the assistant with every message, so answers stay grounded in what the user sees.
         * Omitted/undefined clears the context (e.g. the user left the dashboard).
         */
        readonly userContext?: IGenAIUserContext;
    };
}

/**
 * Creates an {@link IAiAssistantContextChangedEvent}.
 *
 * @alpha
 */
export function aiAssistantContextChanged(payload?: {
    includeTags?: string[];
    excludeTags?: string[];
    dialogPosition?: "left" | "right";
    embedded?: boolean;
    userContext?: IGenAIUserContext;
}): IAiAssistantContextChangedEvent {
    return { type: "GDC.PLUGGABLE_APP/EVT.AI_ASSISTANT.CONTEXT_CHANGED", payload: payload ?? {} };
}

/**
 * Type guard for {@link IAiAssistantContextChangedEvent}.
 *
 * @alpha
 */
export function isAiAssistantContextChangedEvent(obj: unknown): obj is IAiAssistantContextChangedEvent {
    if (
        typeof obj !== "object" ||
        obj === null ||
        (obj as { type?: unknown }).type !== "GDC.PLUGGABLE_APP/EVT.AI_ASSISTANT.CONTEXT_CHANGED"
    ) {
        return false;
    }
    const payload = (obj as { payload?: unknown }).payload;
    if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
        return false;
    }
    const { includeTags, excludeTags, dialogPosition, embedded, userContext } = payload as {
        includeTags?: unknown;
        excludeTags?: unknown;
        dialogPosition?: unknown;
        embedded?: unknown;
        userContext?: unknown;
    };
    const isStringArrayOrUndefined = (value: unknown): boolean =>
        value === undefined || (Array.isArray(value) && value.every((item) => typeof item === "string"));
    return (
        isStringArrayOrUndefined(includeTags) &&
        isStringArrayOrUndefined(excludeTags) &&
        (dialogPosition === undefined || dialogPosition === "left" || dialogPosition === "right") &&
        (embedded === undefined || typeof embedded === "boolean") &&
        // userContext is an opaque structured object; validate only that it is an object when
        // present so a later property read on the host side cannot throw. It must stay optional —
        // host and application deploy independently.
        (userContext === undefined || (typeof userContext === "object" && userContext !== null))
    );
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
 * A structured OpenTelemetry log record forwarded by a pluggable application to the host shell.
 *
 * @remarks
 * Mirrors the shape of an OpenTelemetry `LogRecord` body/severity/attributes. The host emits it through
 * its own page-level OTel logger (see {@link IPluggableAppTelemetryCallbacks.logRecord}), so the module
 * does not need its own `LoggerProvider`. The host fills in the timestamp, resource and shared context
 * (deployment / organization / user / source application) — the module supplies only the event-specific
 * fields.
 *
 * @alpha
 */
export interface IPluggableAppLogRecord {
    /** Log body — typically an event name such as `"timing-dashboard-load-kd"`. */
    body: string;
    /** OTel severity number (1–24). Defaults to `9` (INFO) when omitted. */
    severityNumber?: number;
    /** OTel severity text, e.g. `"INFO"`. Defaults to `"INFO"` when omitted. */
    severityText?: string;
    /** Event-specific attributes (e.g. `{ duration }`). Merged with the host's shared context. */
    attributes?: Record<string, unknown>;
}

/**
 * Transport-neutral structured data a pluggable application may attach to a telemetry event.
 *
 * @remarks
 * Pluggable applications describe an event with these neutral groups and must NOT assume any particular
 * analytics backend (Matomo, Amplitude, …) — the host shell decides how to record them. `identifiers` are
 * sensitive entity ids (workspace, dashboard, report, …) the shell may hash and aggregate; `stats` are
 * contextual metrics (counts, types, …). Any other key is a free-form event property. Passed as the `data`
 * argument of {@link IPluggableAppTelemetryCallbacks.trackEvent}.
 *
 * @alpha
 */
export interface IPluggableAppTelemetryEventData {
    [key: string]: unknown;
    /**
     * Sensitive entity identifiers for the event (e.g. `{ workspaceId, dashboardId }`). The shell decides
     * how to record them — modules must not hash, pack or otherwise format them for a specific backend.
     */
    identifiers?: Record<string, string>;
    /**
     * Contextual metrics / stats for the event (e.g. `{ insightsCount, attributeFiltersCount }`).
     */
    stats?: Record<string, string | number | boolean>;
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
    /**
     * Track a page view within the pluggable application.
     *
     * @param page - The page path/identifier.
     * @param data - Optional neutral event data ({@link IPluggableAppTelemetryEventData}); `identifiers`
     *   keep the page view's workspace/dashboard attribution, `stats` carry contextual metrics.
     */
    trackPageView: (page: string, data?: IPluggableAppTelemetryEventData) => void;
    /**
     * Track a timing measurement from the pluggable application.
     *
     * @param variable - The timing variable name.
     * @param label - The timing label.
     * @param valueMs - The measured duration in milliseconds.
     * @param data - Optional neutral event data ({@link IPluggableAppTelemetryEventData}); a `category`
     *   property attributes the timing to the source app rather than the shell, `stats` carry metrics.
     */
    trackTiming: (
        variable: string,
        label: string,
        valueMs: number,
        data?: IPluggableAppTelemetryEventData,
    ) => void;
    /**
     * Forward a structured OpenTelemetry log record to the host's page-level OTel logger.
     *
     * @remarks
     * Unlike {@link IPluggableAppTelemetryCallbacks.trackEvent} (which routes to the analytics
     * trackers — Matomo / Amplitude), this targets the host's OpenTelemetry logging pipeline (OTLP
     * `/v1/logs`). It exists because the OTel Logs API cannot be reliably shared across module-federation
     * bundles the way the global tracer is, so module logs are forwarded as plain data and re-emitted by
     * the host. Optional: a host that has no OTel logger configured simply omits it (the call is a no-op).
     */
    logRecord?: (record: IPluggableAppLogRecord) => void;
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

    /**
     * Pushes the host-owned AI assistant chat open-state into the pluggable application.
     *
     * @remarks
     * On hosted routes the host owns the single chat instance; an application that exposes its own
     * assistant controls (e.g. an embedded AI button, or the `toggleAIAssistant` postMessage command
     * whose result is echoed to an embedding client) needs to know the real open-state to keep those
     * controls and their reported results aligned with what the user sees. The host calls this
     * whenever its chat opens or closes. Applications without such controls may omit it.
     */
    setAiAssistantOpen?: (open: boolean) => void;

    /**
     * Delegates an AI-assistant link click to the application so it can handle navigation in-app.
     *
     * @remarks
     * On hosted routes the host owns the chat, so links clicked inside it are handled by the host by
     * default (open in a tab / navigate). An embedded application can intercept them instead — e.g. an
     * embedded dashboard opening a visualization as an in-place overlay rather than navigating away.
     * Return `true` if the application handled it (the host suppresses its own navigation); return
     * `false` to let the host perform default link handling.
     */
    onAiAssistantLinkClicked?: (link: {
        type?: string;
        id?: string;
        itemUrl?: string;
        newTab?: boolean;
    }) => boolean;
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
