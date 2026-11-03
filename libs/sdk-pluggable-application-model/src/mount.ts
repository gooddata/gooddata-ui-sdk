// (C) 2026 GoodData Corporation

import {
    type GenAIChatEffort,
    type IDashboard,
    type IGenAIUserContext,
    type IInsight,
    type IPublisherDocumentDefinition,
    type IPublisherDocumentDefinitionV2,
} from "@gooddata/sdk-model";

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
    AI_ASSISTANT_EVENT_SENT: "GDC.PLUGGABLE_APP/EVT.AI_ASSISTANT.EVENT_SENT",
    PRICING_DIALOG_OPEN_REQUESTED: "GDC.PLUGGABLE_APP/EVT.PRICING_DIALOG.OPEN_REQUESTED",
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
    return { type: PluggableAppEventType.RELOAD_PLATFORM_CONTEXT_REQUESTED };
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
        (obj as { type?: unknown }).type === PluggableAppEventType.RELOAD_PLATFORM_CONTEXT_REQUESTED
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
    return { type: PluggableAppEventType.DOCUMENT_TITLE_CHANGED, payload: { pageTitle } };
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
        (obj as { type?: unknown }).type !== PluggableAppEventType.DOCUMENT_TITLE_CHANGED
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
         * Agent ID to seed the chat with. When omitted, default will be used.
         */
        readonly agentId?: string;
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
        /**
         * Reasoning effort for the conversation the question starts. When omitted, the default is used.
         * Ignored when the question is appended to the existing chat.
         */
        readonly effort?: GenAIChatEffort;
        /**
         * Existing conversation to select when opening the chat. When provided, takes precedence over
         * the seeded question and user context. When omitted, the current open/ask behavior is preserved.
         */
        readonly conversationId?: string;
    };
}

/**
 * Creates an {@link IOpenAiAssistantRequestedEvent}.
 *
 * @alpha
 */
export function openAiAssistantRequested(payload?: {
    agentId?: string;
    question?: string;
    userContext?: IGenAIUserContext;
    appendToChat?: boolean;
    replaceUserContext?: boolean;
    effort?: GenAIChatEffort;
    conversationId?: string;
}): IOpenAiAssistantRequestedEvent {
    return { type: PluggableAppEventType.AI_ASSISTANT_OPEN_REQUESTED, payload: payload ?? {} };
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
        (obj as { type?: unknown }).type !== PluggableAppEventType.AI_ASSISTANT_OPEN_REQUESTED
    ) {
        return false;
    }
    const payload = (obj as { payload?: unknown }).payload;
    if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
        return false;
    }
    const { question, userContext, conversationId } = payload as {
        question?: unknown;
        userContext?: unknown;
        conversationId?: unknown;
    };
    const questionOk = typeof question === "string" || question === undefined;
    const conversationIdOk = typeof conversationId === "string" || conversationId === undefined;
    // userContext is an opaque structured object; validate only that it is an object when present
    // so a later property read on the host side cannot throw.
    const userContextOk =
        userContext === undefined || (typeof userContext === "object" && userContext !== null);
    return questionOk && userContextOk && conversationIdOk;
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
    return { type: PluggableAppEventType.AI_ASSISTANT_CLOSE_REQUESTED };
}

/**
 * Type guard for {@link ICloseAiAssistantRequestedEvent}.
 *
 * @alpha
 */
export function isCloseAiAssistantRequestedEvent(obj: unknown): obj is ICloseAiAssistantRequestedEvent {
    return (
        typeof obj === "object" &&
        (obj as { type?: unknown })?.type === PluggableAppEventType.AI_ASSISTANT_CLOSE_REQUESTED
    );
}

/**
 * Event requesting the host to open its pricing (plan upgrade) dialog.
 *
 * @remarks
 * A pluggable application emits this from an in-content upsell control (e.g. an "Upgrade" button).
 * The pricing dialog is owned by the host UI. The default host UI opens it only for trial
 * organizations; outside a trial, or with a host UI that has no pricing dialog, the event is a no-op.
 *
 * @alpha
 */
export interface IOpenPricingDialogRequestedEvent extends IPluggableAppEvent {
    readonly type: "GDC.PLUGGABLE_APP/EVT.PRICING_DIALOG.OPEN_REQUESTED";
}

/**
 * Creates an {@link IOpenPricingDialogRequestedEvent}.
 *
 * @alpha
 */
export function openPricingDialogRequested(): IOpenPricingDialogRequestedEvent {
    return { type: PluggableAppEventType.PRICING_DIALOG_OPEN_REQUESTED };
}

/**
 * Type guard for {@link IOpenPricingDialogRequestedEvent}.
 *
 * @alpha
 */
export function isOpenPricingDialogRequestedEvent(obj: unknown): obj is IOpenPricingDialogRequestedEvent {
    return (
        typeof obj === "object" &&
        (obj as { type?: unknown })?.type === PluggableAppEventType.PRICING_DIALOG_OPEN_REQUESTED
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
         * Whether the application wants the host chat disabled. The host uses this to disable the
         * chat.
         */
        readonly disabled?: boolean;
        /**
         * Ambient user context reflecting the application's current view (e.g. the open dashboard,
         * its live filter state and widgets). The host keeps the latest reported context and passes
         * it to the assistant with every message, so answers stay grounded in what the user sees.
         * Omitted/undefined clears the context (e.g. the user left the dashboard).
         */
        readonly userContext?: IGenAIUserContext;
        /**
         * Whether user context is loading.
         */
        readonly userContextLoading?: boolean;
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
    disabled?: boolean;
    userContext?: IGenAIUserContext;
    userContextLoading?: boolean;
}): IAiAssistantContextChangedEvent {
    return { type: PluggableAppEventType.AI_ASSISTANT_CONTEXT_CHANGED, payload: payload ?? {} };
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
        (obj as { type?: unknown }).type !== PluggableAppEventType.AI_ASSISTANT_CONTEXT_CHANGED
    ) {
        return false;
    }
    const payload = (obj as { payload?: unknown }).payload;
    if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
        return false;
    }
    const { includeTags, excludeTags, dialogPosition, embedded, userContext, disabled } = payload as {
        includeTags?: unknown;
        excludeTags?: unknown;
        dialogPosition?: unknown;
        embedded?: unknown;
        userContext?: unknown;
        disabled?: unknown;
    };
    const isStringArrayOrUndefined = (value: unknown): boolean =>
        value === undefined || (Array.isArray(value) && value.every((item) => typeof item === "string"));
    return (
        isStringArrayOrUndefined(includeTags) &&
        isStringArrayOrUndefined(excludeTags) &&
        (dialogPosition === undefined || dialogPosition === "left" || dialogPosition === "right") &&
        (embedded === undefined || typeof embedded === "boolean") &&
        (disabled === undefined || typeof disabled === "boolean") &&
        // userContext is an opaque structured object; validate only that it is an object when
        // present so a later property read on the host side cannot throw. It must stay optional —
        // host and application deploy independently.
        (userContext === undefined || (typeof userContext === "object" && userContext !== null))
    );
}

/**
 * Known events the host-owned AI assistant chat sends to the active application.
 *
 * @remarks
 * The host forwards every chat event to the active application through
 * {@link IPluggableApplicationMountHandle.onAiAssistantEventReceive} without reading it. The
 * application picks the events it acts on by `name`.
 *
 * @alpha
 */
export const AiAssistantChatEventName = {
    OPENED: "chat.opened",
    CLOSED: "chat.closed",
    RESET: "chat.reset",
    CONVERSATION_CHANGED: "chat.conversation-changed",
    FEEDBACK: "chat.feedback",
    FEEDBACK_ERROR: "chat.feedback-error",
    USER_MESSAGE: "chat.user-message",
    USER_ANSWERS: "chat.user-answers",
    ASSISTANT_MESSAGE: "chat.assistant-message",
    REASONING: "chat.reasoning",
    MODE_CHANGED: "chat.mode-changed",
    DEFINITION_RECEIVED: "chat.definition-received",
    CLARIFICATION_QUESTIONS: "chat.clarification-questions",
    SAVE_VISUALIZATION_SUCCESS: "chat.save-visualization-success",
    SAVE_VISUALIZATION_ERROR: "chat.save-visualization-error",
    COPY_TO_CLIPBOARD: "chat.copy-to-clipboard",
} as const;

/**
 * Union of known chat event names.
 *
 * @alpha
 */
export type KnownAiAssistantChatEventName =
    (typeof AiAssistantChatEventName)[keyof typeof AiAssistantChatEventName];

/**
 * Name of an event the host-owned chat sends to the active application.
 *
 * @remarks
 * Open for extension (`string & {}`) so that a chat newer than the application can send events the
 * application does not know yet. For known events, prefer values from {@link (AiAssistantChatEventName:variable)}.
 *
 * @alpha
 */
export type AiAssistantChatEventName = KnownAiAssistantChatEventName | (string & {});

/**
 * An event of the host-owned AI assistant chat, as the host relays it to the active application.
 *
 * @alpha
 */
export interface IAiAssistantChatEvent {
    readonly name: AiAssistantChatEventName;
    readonly payload: Record<string, unknown>;
}

/**
 * A document version the host assistant drafted, carried by a {@link (AiAssistantChatEventName:variable).DEFINITION_RECEIVED}
 * event whose `definitionType` is `"publisherDocument"`.
 *
 * @remarks
 * The assistant writes these fields and the editor applies the version from them, so both type them
 * from here.
 *
 * @alpha
 */
export interface IAiAssistantPublisherDocumentDefinition {
    /**
     * The whole document version.
     */
    readonly publisherDocument: IPublisherDocumentDefinition;

    /**
     * Name of the document version in the conversation, the one its save is recorded under.
     */
    readonly documentRef?: string;

    /**
     * Name of the document version this one reworks.
     */
    readonly refines?: string;

    /**
     * Whether the version was written from the document open in the editor.
     */
    readonly reworksOpenDocument?: boolean;

    /**
     * Identifier of the saved document this version edits.
     */
    readonly baseDocumentId?: string;
}

/**
 * Type guard for the fields of {@link IAiAssistantPublisherDocumentDefinition}.
 *
 * @remarks
 * The document itself stays `unknown`: whoever applies it validates it.
 *
 * @alpha
 */
export function isAiAssistantPublisherDocumentDefinition(obj: unknown): obj is Omit<
    IAiAssistantPublisherDocumentDefinition,
    "publisherDocument"
> & {
    readonly publisherDocument: unknown;
} {
    if (typeof obj !== "object" || obj === null) {
        return false;
    }
    const { publisherDocument, documentRef, refines, reworksOpenDocument, baseDocumentId } = obj as {
        [key in keyof IAiAssistantPublisherDocumentDefinition]?: unknown;
    };
    return (
        typeof publisherDocument === "object" &&
        publisherDocument !== null &&
        !Array.isArray(publisherDocument) &&
        (documentRef === undefined || typeof documentRef === "string") &&
        (refines === undefined || typeof refines === "string") &&
        (reworksOpenDocument === undefined || typeof reworksOpenDocument === "boolean") &&
        (baseDocumentId === undefined || typeof baseDocumentId === "string")
    );
}

/**
 * A document version of Publisher content v2 the host assistant drafted, carried by a
 * {@link (AiAssistantChatEventName:variable).DEFINITION_RECEIVED} event whose `definitionType` is
 * `"publisherDocumentV2"`.
 *
 * @remarks
 * The document is in `publisherDocumentV2`, not `publisherDocument`, so one event can type both
 * versions' fields.
 *
 * @alpha
 */
export interface IAiAssistantPublisherDocumentDefinitionV2 {
    /**
     * The whole document version.
     */
    readonly publisherDocumentV2: IPublisherDocumentDefinitionV2;

    /**
     * Name of the document version in the conversation, the one its save is recorded under.
     */
    readonly documentRef?: string;

    /**
     * Name of the document version this one reworks.
     */
    readonly refines?: string;

    /**
     * Whether the version was written from the document open in the editor.
     */
    readonly reworksOpenDocument?: boolean;

    /**
     * Identifier of the saved document this version edits.
     */
    readonly baseDocumentId?: string;
}

/**
 * Type guard for the fields of {@link IAiAssistantPublisherDocumentDefinitionV2}.
 *
 * @remarks
 * The document itself stays `unknown`: whoever applies it validates it.
 *
 * @alpha
 */
export function isAiAssistantPublisherDocumentDefinitionV2(obj: unknown): obj is Omit<
    IAiAssistantPublisherDocumentDefinitionV2,
    "publisherDocumentV2"
> & {
    readonly publisherDocumentV2: unknown;
} {
    if (typeof obj !== "object" || obj === null) {
        return false;
    }
    const { publisherDocumentV2, documentRef, refines, reworksOpenDocument, baseDocumentId } = obj as {
        [key in keyof IAiAssistantPublisherDocumentDefinitionV2]?: unknown;
    };
    return (
        typeof publisherDocumentV2 === "object" &&
        publisherDocumentV2 !== null &&
        !Array.isArray(publisherDocumentV2) &&
        (documentRef === undefined || typeof documentRef === "string") &&
        (refines === undefined || typeof refines === "string") &&
        (reworksOpenDocument === undefined || typeof reworksOpenDocument === "boolean") &&
        (baseDocumentId === undefined || typeof baseDocumentId === "string")
    );
}

/**
 * Payload of a {@link (AiAssistantChatEventName:variable).DEFINITION_RECEIVED} event: an object the assistant
 * drafted in a conversation.
 *
 * @remarks
 * `definitionType` says which of the optional members carries the draft: `dashboard` (with its
 * `insights`) for `"dashboard"`, the {@link IAiAssistantPublisherDocumentDefinition} fields for
 * `"publisherDocument"`, the {@link IAiAssistantPublisherDocumentDefinitionV2} fields for
 * `"publisherDocumentV2"`. A `"visualization"` or `"alert"` draft is carried in the chat's own
 * members beyond this type.
 *
 * @alpha
 */
export type IAiAssistantDefinitionReceivedPayload = {
    readonly definitionType:
        | "dashboard"
        | "visualization"
        | "publisherDocument"
        | "publisherDocumentV2"
        | "alert";
    /**
     * Identifier of the item that holds the draft: the streamed interaction id for a live response,
     * or the stored conversation item id for a history replay.
     */
    readonly itemId: string;
    /**
     * Local identifier of the conversation that holds the draft, not the backend thread id.
     */
    readonly conversationId: string;
    /**
     * Backend thread id of the conversation, when known.
     */
    readonly threadId?: string;
    /**
     * Stored response id of a draft replayed from chat history.
     * A live draft leaves this unset or empty, which tells a replay from a live response.
     */
    readonly interactionId?: string;
    /**
     * Dashboard draft, populated when `definitionType` is `"dashboard"`.
     */
    readonly dashboard?: IDashboard;
    /**
     * Insights the dashboard draft references, populated when `definitionType` is `"dashboard"`.
     * An empty array means the dashboard content references no insights.
     */
    readonly insights?: IInsight[];
} & Partial<IAiAssistantPublisherDocumentDefinition> &
    Partial<Pick<IAiAssistantPublisherDocumentDefinitionV2, "publisherDocumentV2">>;

/**
 * Chat event carrying an object the assistant drafted.
 *
 * @alpha
 */
export interface IAiAssistantDefinitionReceivedChatEvent extends IAiAssistantChatEvent {
    readonly name: "chat.definition-received";
    readonly payload: IAiAssistantDefinitionReceivedPayload;
}

/**
 * Type guard for {@link IAiAssistantDefinitionReceivedChatEvent}.
 *
 * @remarks
 * Validates the discriminator and the ids, so a malformed event is rejected rather than narrowed to a
 * type whose later `payload.conversationId` access would be wrong. The draft itself stays as the chat
 * sent it: whoever applies it validates it.
 *
 * @alpha
 */
export function isAiAssistantDefinitionReceivedChatEvent(
    event: IAiAssistantChatEvent,
): event is IAiAssistantDefinitionReceivedChatEvent {
    if (event.name !== AiAssistantChatEventName.DEFINITION_RECEIVED) {
        return false;
    }
    const { definitionType, itemId, conversationId, threadId, interactionId } = event.payload;
    return (
        (definitionType === "dashboard" ||
            definitionType === "visualization" ||
            definitionType === "publisherDocument" ||
            definitionType === "publisherDocumentV2" ||
            definitionType === "alert") &&
        typeof itemId === "string" &&
        typeof conversationId === "string" &&
        (threadId === undefined || typeof threadId === "string") &&
        (interactionId === undefined || typeof interactionId === "string")
    );
}

/**
 * Known events the active application sends to the host-owned AI assistant chat.
 *
 * @remarks
 * The application wraps one in {@link aiAssistantEventSent} and emits it through the `onEvent`
 * mount option. The host hands it to its chat without reading it; the chat picks the events it
 * acts on by `name`.
 *
 * @alpha
 */
export const AiAssistantAppEventName = {
    PUBLISHER_DOCUMENT_SAVED: "app.publisher-document-saved",
    DASHBOARD_SAVED: "app.dashboard-saved",
} as const;

/**
 * Union of known application event names.
 *
 * @alpha
 */
export type KnownAiAssistantAppEventName =
    (typeof AiAssistantAppEventName)[keyof typeof AiAssistantAppEventName];

/**
 * Name of an event the active application sends to the host-owned chat.
 *
 * @remarks
 * Open for extension (`string & {}`) so that an application newer than the chat can send events the
 * chat does not know yet. For known events, prefer values from {@link (AiAssistantAppEventName:variable)}.
 *
 * @alpha
 */
export type AiAssistantAppEventName = KnownAiAssistantAppEventName | (string & {});

/**
 * An event of the active application, as the host relays it to its AI assistant chat.
 *
 * @alpha
 */
export interface IAiAssistantAppEvent {
    readonly name: AiAssistantAppEventName;
    readonly payload: Record<string, unknown>;
}

/**
 * Application event telling the chat that a document it drafted was saved.
 *
 * @remarks
 * The chat keeps its own copy of the conversation, which only learns about a save when the thread is
 * loaded again. The application that saved the document sends this once per save, so the document in
 * the chat reads as saved and links to the saved document right away.
 *
 * @alpha
 */
export interface IAiAssistantPublisherDocumentSavedAppEvent extends IAiAssistantAppEvent {
    readonly name: "app.publisher-document-saved";
    readonly payload: {
        /**
         * Conversation the document was drafted in.
         */
        readonly conversationId: string;
        /**
         * Conversation item that holds the drafted document.
         */
        readonly itemId: string;
        /**
         * Name of the document within the item. Omitted when the draft carries none; the item's only
         * document is meant then.
         */
        readonly documentRef?: string;
        /**
         * Identifier of the document the draft was saved as.
         */
        readonly savedDocumentId: string;
        /**
         * Publisher content version of the saved draft, which decides where the conversation records the
         * save. Omitted by applications that predate it.
         */
        readonly format?: "aac-v1" | "aac-v2";
    };
}

/**
 * Type guard for {@link IAiAssistantPublisherDocumentSavedAppEvent}.
 *
 * @alpha
 */
export function isAiAssistantPublisherDocumentSavedAppEvent(
    event: IAiAssistantAppEvent,
): event is IAiAssistantPublisherDocumentSavedAppEvent {
    if (event.name !== AiAssistantAppEventName.PUBLISHER_DOCUMENT_SAVED) {
        return false;
    }
    const { conversationId, itemId, documentRef, savedDocumentId, format } = event.payload;
    return (
        typeof conversationId === "string" &&
        typeof itemId === "string" &&
        (documentRef === undefined || typeof documentRef === "string") &&
        typeof savedDocumentId === "string" &&
        (format === undefined || format === "aac-v1" || format === "aac-v2")
    );
}

/**
 * Application event telling the chat that a dashboard it drafted was saved, with its draft insights.
 *
 * @alpha
 */
export interface IAiAssistantDashboardSavedAppEvent extends IAiAssistantAppEvent {
    readonly name: "app.dashboard-saved";
    readonly payload: {
        readonly conversationId: string;
        readonly originalDashboardId: string;
        readonly savedDashboardId: string;
        readonly savedInsights: ReadonlyArray<{
            readonly originalInsightId: string;
            readonly savedInsightId: string;
        }>;
    };
}

/**
 * Type guard for {@link IAiAssistantDashboardSavedAppEvent}.
 *
 * @alpha
 */
export function isAiAssistantDashboardSavedAppEvent(
    event: IAiAssistantAppEvent,
): event is IAiAssistantDashboardSavedAppEvent {
    if (event.name !== AiAssistantAppEventName.DASHBOARD_SAVED) {
        return false;
    }
    const { conversationId, originalDashboardId, savedDashboardId, savedInsights } = event.payload;
    return (
        typeof conversationId === "string" &&
        typeof originalDashboardId === "string" &&
        typeof savedDashboardId === "string" &&
        Array.isArray(savedInsights) &&
        savedInsights.every(
            (insight) =>
                typeof insight === "object" &&
                insight !== null &&
                typeof (insight as { originalInsightId?: unknown }).originalInsightId === "string" &&
                typeof (insight as { savedInsightId?: unknown }).savedInsightId === "string",
        )
    );
}

/**
 * Event carrying an {@link IAiAssistantAppEvent} from the application to the host-owned chat.
 *
 * @remarks
 * Counterpart of {@link IPluggableApplicationMountHandle.onAiAssistantEventReceive}. The host checks
 * only the envelope and hands the application event to its chat as is.
 *
 * @alpha
 */
export interface IAiAssistantEventSentEvent extends IPluggableAppEvent {
    readonly type: "GDC.PLUGGABLE_APP/EVT.AI_ASSISTANT.EVENT_SENT";
    readonly payload: IAiAssistantAppEvent;
}

/**
 * Creates an {@link IAiAssistantEventSentEvent}.
 *
 * @alpha
 */
export function aiAssistantEventSent(event: IAiAssistantAppEvent): IAiAssistantEventSentEvent {
    return { type: PluggableAppEventType.AI_ASSISTANT_EVENT_SENT, payload: event };
}

/**
 * Creates an {@link IAiAssistantEventSentEvent} carrying an {@link IAiAssistantPublisherDocumentSavedAppEvent}.
 *
 * @alpha
 */
export function aiAssistantPublisherDocumentSaved(
    payload: IAiAssistantPublisherDocumentSavedAppEvent["payload"],
): IAiAssistantEventSentEvent {
    return aiAssistantEventSent({ name: AiAssistantAppEventName.PUBLISHER_DOCUMENT_SAVED, payload });
}

/**
 * Creates an {@link IAiAssistantEventSentEvent} carrying an {@link IAiAssistantDashboardSavedAppEvent}.
 *
 * @alpha
 */
export function aiAssistantDashboardSaved(
    payload: IAiAssistantDashboardSavedAppEvent["payload"],
): IAiAssistantEventSentEvent {
    return aiAssistantEventSent({ name: AiAssistantAppEventName.DASHBOARD_SAVED, payload });
}

/**
 * Type guard for {@link IAiAssistantEventSentEvent}.
 *
 * @remarks
 * Validates the envelope only (a string `name` and an object `payload`), so a malformed event is
 * rejected before it reaches the chat. The chat validates the application event it acts on.
 *
 * @alpha
 */
export function isAiAssistantEventSentEvent(obj: unknown): obj is IAiAssistantEventSentEvent {
    if (
        typeof obj !== "object" ||
        obj === null ||
        (obj as { type?: unknown }).type !== PluggableAppEventType.AI_ASSISTANT_EVENT_SENT
    ) {
        return false;
    }
    const event = (obj as { payload?: unknown }).payload;
    if (typeof event !== "object" || event === null || Array.isArray(event)) {
        return false;
    }
    const { name, payload } = event as { name?: unknown; payload?: unknown };
    return (
        typeof name === "string" && typeof payload === "object" && payload !== null && !Array.isArray(payload)
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
 * analytics backend (Matomo, …) — the host shell decides how to record them. `identifiers` are
 * sensitive entity ids (workspace, dashboard, document, …) the shell may hash and aggregate; `stats` are
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
     * trackers — Matomo), this targets the host's OpenTelemetry logging pipeline (OTLP
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
 * @remarks
 * Do not add a callback here for a message the host only hands on between the application and the
 * chat. Send it as an {@link IAiAssistantAppEvent} through `onEvent` instead and name it in
 * {@link (AiAssistantAppEventName:variable)}; the host must stay unaware of the chat vocabulary.
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
 * A chrome-initiated navigation the host is about to perform, handed to the active application for
 * confirmation via {@link IPluggableApplicationMountHandle.onHostNavigationRequested}.
 *
 * @alpha
 */
export interface IHostNavigationRequest {
    /**
     * Target URL of the pending navigation.
     */
    readonly url: string;

    /**
     * Performs the navigation the host originally intended.
     *
     * @remarks
     * Only the first call takes effect, and only for the mount that received the request: a call made
     * once that mount is gone — unmounted, or remounted for a new workspace — is ignored.
     */
    readonly proceed: () => void;
}

/**
 * Handle returned from mount for lifecycle management and host -\> module interaction.
 *
 * @remarks
 * Do not add a callback here for a message the host only hands on from the chat to the application.
 * The chat's events all arrive through `onAiAssistantEventReceive`; name a new one in
 * {@link (AiAssistantChatEventName:variable)} and decode it in the application.
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
     * Asks the application whether the host may navigate away from it.
     *
     * @remarks
     * The host chrome owns navigation (workspace picker, application menu, logo), so an application
     * holding unsaved user work cannot intercept it on its own — its own header is not rendered and its
     * router does not observe host navigation. The host asks before a chrome-initiated push whose target
     * pathname differs from the current one; programmatic redirects (replace) and navigations staying on
     * the same pathname are not offered.
     *
     * Return `true` to take over: the host does not navigate, and the application calls `proceed` once
     * the user confirms — or never, if the user cancels. Return `false` to let the host navigate
     * immediately. Applications without unsaved state may omit it.
     *
     * `proceed` performs the host's original navigation, so the application does not need to know how
     * host routing works.
     */
    onHostNavigationRequested?: (request: IHostNavigationRequest) => boolean;

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
     * Return `true` if the application handled it (the host suppresses its own navigation in this
     * tab; a request for a new tab is still opened by the host); return `false` to let the host
     * perform default link handling.
     */
    onAiAssistantLinkClicked?: (link: {
        type?: string;
        id?: string;
        itemUrl?: string;
        newTab?: boolean;
    }) => boolean;

    /**
     * Hands an event of the host-owned AI assistant chat to the application.
     *
     * @remarks
     * On hosted routes the host owns the single chat instance, so the application only learns what
     * happens in the chat (an answer with a drafted object, a reset, clarification questions, …)
     * through this callback. The host calls it with every chat event without reading it; the
     * application picks the events it acts on by `name` — see {@link (AiAssistantChatEventName:variable)} and
     * the typed guards such as {@link isAiAssistantDefinitionReceivedChatEvent}. Applications that
     * do not react to the chat may omit it. The opposite direction is
     * {@link IAiAssistantEventSentEvent}.
     */
    onAiAssistantEventReceive?: (event: IAiAssistantChatEvent) => void;
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
