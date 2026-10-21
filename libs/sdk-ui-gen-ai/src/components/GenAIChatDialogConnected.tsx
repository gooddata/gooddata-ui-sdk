// (C) 2026 GoodData Corporation

import { type RefObject, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { type IAnalyticalBackend, type IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import type { GenAIChatEffort, GenAIObjectType, IColorPalette, IGenAIUserContext } from "@gooddata/sdk-model";

import { makeUserItem } from "../model.js";
import { setAmbientUserContextAction, setUserContextAction } from "../store/chatWindow/chatWindowSlice.js";
import {
    type ChatAssistantMessageEvent,
    type ChatClarificationQuestionsEvent,
    type ChatClosedEvent,
    type ChatCopyToClipboardEvent,
    type ChatDefinitionReceivedEvent,
    type ChatEvent,
    type ChatFeedbackErrorEvent,
    type ChatFeedbackEvent,
    type ChatModeChangeEvent,
    type ChatOpenedEvent,
    type ChatResetEvent,
    type ChatSaveVisualizationErrorEvent,
    type ChatSaveVisualizationSuccessEvent,
    type ChatUserMessageEvent,
    isChatAssistantMessageEvent,
    isChatClarificationQuestionsEvent,
    isChatClosedEvent,
    isChatCopyToClipboardEvent,
    isChatDefinitionReceivedEvent,
    isChatFeedbackErrorEvent,
    isChatFeedbackEvent,
    isChatModeChangeEvent,
    isChatOpenedEvent,
    isChatResetEvent,
    isChatSaveVisualizationErrorEvent,
    isChatSaveVisualizationSuccessEvent,
    isChatUserMessageEvent,
} from "../store/events.js";
import {
    clearThreadAction,
    newMessageAction,
    setSelectedAgentAction,
    setSelectedEffortAction,
} from "../store/messages/messagesSlice.js";

import { type GenAIAssistantDisplayMode, type LinkHandlerEvent } from "./ConfigContext.js";
import { GenAIChatDialog, type GenAIChatDialogProps } from "./GenAIChatDialog.js";
import { type IDashboardSaved, useDashboardSavedSync } from "./hooks/useDashboardSavedSync.js";
import {
    type IPublisherDocumentSaved,
    usePublisherDocumentSavedSync,
} from "./hooks/usePublisherDocumentSavedSync.js";
import { sanitizeEffort } from "./utils/effortSelection.js";

/**
 * Discriminated union of GenAI chat events surfaced to a caller via {@link IGenAIChatDialogConnectedProps.onEvent}.
 *
 * @remarks
 * Each consuming application maps these to its own telemetry sink and toast strings (the message ids differ
 * per app — e.g. the host's `messages.genAi.*` vs KD's `gd.gen-ai.feedback.*`), so this connected wrapper
 * deliberately does NOT render toasts itself; it only normalizes the raw chat events into this union.
 *
 * @internal
 */
export type GenAIChatConnectedEvent =
    | { name: "opened"; payload: ChatOpenedEvent }
    | { name: "closed"; payload: ChatClosedEvent }
    | { name: "reset"; payload: ChatResetEvent }
    | { name: "user-message"; payload: ChatUserMessageEvent }
    | { name: "assistant-message"; payload: ChatAssistantMessageEvent }
    | { name: "feedback"; payload: ChatFeedbackEvent }
    | { name: "feedback-error"; payload: ChatFeedbackErrorEvent }
    | { name: "mode-changed"; payload: ChatModeChangeEvent }
    | { name: "save-visualization-success"; payload: ChatSaveVisualizationSuccessEvent }
    | { name: "save-visualization-error"; payload: ChatSaveVisualizationErrorEvent }
    | { name: "copy-to-clipboard"; payload: ChatCopyToClipboardEvent }
    | { name: "definition-received"; payload: ChatDefinitionReceivedEvent }
    | { name: "clarification-questions"; payload: ChatClarificationQuestionsEvent };

export function toGenAIChatConnectedEvent(event: ChatEvent): GenAIChatConnectedEvent | undefined {
    if (isChatOpenedEvent(event)) {
        return { name: "opened", payload: event };
    } else if (isChatClosedEvent(event)) {
        return { name: "closed", payload: event };
    } else if (isChatResetEvent(event)) {
        return { name: "reset", payload: event };
    } else if (isChatUserMessageEvent(event)) {
        return { name: "user-message", payload: event };
    } else if (isChatAssistantMessageEvent(event)) {
        return { name: "assistant-message", payload: event };
    } else if (isChatFeedbackEvent(event)) {
        return { name: "feedback", payload: event };
    } else if (isChatFeedbackErrorEvent(event)) {
        return { name: "feedback-error", payload: event };
    } else if (isChatSaveVisualizationSuccessEvent(event)) {
        return { name: "save-visualization-success", payload: event };
    } else if (isChatSaveVisualizationErrorEvent(event)) {
        return { name: "save-visualization-error", payload: event };
    } else if (isChatCopyToClipboardEvent(event)) {
        return { name: "copy-to-clipboard", payload: event };
    } else if (isChatDefinitionReceivedEvent(event)) {
        return { name: "definition-received", payload: event };
    } else if (isChatClarificationQuestionsEvent(event)) {
        return { name: "clarification-questions", payload: event };
    } else if (isChatModeChangeEvent(event)) {
        return { name: "mode-changed", payload: event };
    }
    return undefined;
}

type Dispatch = Parameters<Required<GenAIChatDialogProps>["onDispatcher"]>[0];
type SeedAction = Parameters<Dispatch>[0];

/**
 * What one ask seeds into the chat.
 *
 * @internal
 */
export type SeedInput = {
    agentId?: string;
    effort?: GenAIChatEffort;
    askedQuestion?: string | null;
    userContext?: IGenAIUserContext;
    replaceUserContext?: boolean;
    appendToChat?: boolean;
};

/**
 * Actions that seed the chat for one ask, in dispatch order.
 *
 * @remarks
 * The agent precedes the clear, because the clear saga reads the selection synchronously when it creates
 * the new conversation. The effort applies only to that fresh conversation: it follows the clear and
 * precedes the message, which reads it. Appending to an existing conversation keeps that conversation's
 * own effort.
 *
 * @internal
 */
export function buildSeedActions({
    agentId,
    effort,
    askedQuestion,
    userContext,
    replaceUserContext,
    appendToChat,
}: SeedInput): SeedAction[] {
    const actions: SeedAction[] = [];
    const seeding = Boolean(askedQuestion || userContext);
    if (seeding) {
        actions.push(setSelectedAgentAction({ agentId }));
    }
    if (seeding && !appendToChat) {
        actions.push(clearThreadAction());
        const supported = sanitizeEffort(effort);
        if (supported) {
            actions.push(setSelectedEffortAction({ effort: supported }));
        }
    }
    // Always set (and thereby clear when undefined) so a follow-up ask without context does not
    // inherit the previous ask's user context (LX-2544).
    actions.push(setUserContextAction({ userContext, replaceUserContext }));
    if (askedQuestion) {
        actions.push(newMessageAction(makeUserItem({ type: "text", text: askedQuestion })));
    }
    return actions;
}

/**
 * Props for {@link GenAIChatDialogConnected}.
 *
 * @internal
 */
export interface IGenAIChatDialogConnectedProps {
    /** Backend; defaults to the ambient `BackendProvider` when omitted. */
    backend?: IAnalyticalBackend;
    /** Workspace; defaults to the ambient `WorkspaceProvider` when omitted. */
    workspace?: string;
    locale?: string;

    canManage?: boolean;
    canAnalyze?: boolean;
    canFullControl?: boolean;
    settings?: IUserWorkspaceSettings;

    /** Open-state is fully controlled by the caller (props, not redux). */
    isOpen: boolean;
    /**
     * Whether the Gen AI chat dialog is disabled.
     *
     * @remarks
     * Defaults to true. The shell application is expected to explicitly enable the dialog by setting this to false.
     * This default prevents the dialog from briefly appearing (blinking) before the application state is fully
     * initialized.
     */
    isDisabled?: boolean;
    onOpen: () => void;
    onClose: () => void;

    /**
     * Display mode of the Gen AI chat.
     *
     * @remarks
     * Defaults to "modal". The "inline" mode is used when the chat is embedded within another component.
     */
    displayMode?: GenAIAssistantDisplayMode;

    /** A question to seed into the chat when it opens. */
    askedQuestion?: string | null;
    /**
     * Monotonic counter bumped on every ask. Keying the seeding effect on it re-seeds the chat
     * (clear thread + send message) even when `askedQuestion` is identical to the previous ask.
     */
    askSeq?: number;
    /** Context of the user's location when the question was asked, sent alongside the seeded question. */
    userContext?: IGenAIUserContext;
    /**
     * Ambient user context kept in sync by the host (e.g. the open dashboard and its live filter
     * state). Unlike the one-shot `userContext` it persists across messages: it is attached to
     * every message that carries no one-shot context and drives the context indicator in the chat.
     * Pass `undefined` to clear it (e.g. when the user leaves the dashboard).
     */
    ambientUserContext?: IGenAIUserContext;
    /**
     * Whether the ambient user context is currently loading.
     */
    ambientUserContextLoading?: boolean;
    /**
     * A document of the conversation that an application saved. The document in the chat then reads as
     * saved without the conversation being loaded again. Each save carries a new `seq`.
     */
    publisherDocumentSaved?: IPublisherDocumentSaved;
    /** A dashboard save reported by an application. Each save carries a new `seq`. */
    dashboardSaved?: IDashboardSaved;
    /**
     * Agent ID to use for the seeded question. If not provided, the default agent will be used.
     */
    agentId?: string;
    /**
     * Reasoning effort for the conversation the seeded question starts. Ignored when appending to the chat.
     */
    effort?: GenAIChatEffort;
    /** When true, the seeded question is appended to the existing thread instead of clearing it first. */
    appendToChat?: boolean;
    /** When true, the user context is replaced instead of merged with the existing one. */
    replaceUserContext?: boolean;
    /** Object-search tag scope reflecting the caller's current view. */
    includeTags?: string[];
    excludeTags?: string[];
    /** Override the derived object types (default: dashboard, visualization, + metric when `canManage`). */
    objectTypes?: GenAIObjectType[];

    /** Normalized chat events for telemetry/toasts; mapped per-consumer. */
    onEvent?: (event: GenAIChatConnectedEvent) => void;
    /** Escape hatch firing for every raw chat event (e.g. a catch-all telemetry sink). */
    onAnyEvent?: (event: ChatEvent) => void;

    dialogPosition?: "left" | "right";
    className?: string;
    colorPalette?: IColorPalette;
    /** Defaults to `true`; embedded callers pass `false` to intercept link clicks. */
    allowNativeLinks?: boolean;
    /** Override the default open-in-tab / same-tab navigation link handling. */
    onLinkClick?: (linkClickEvent: LinkHandlerEvent) => string | undefined;
    /** Element (or id) focus returns to on close. */
    returnFocusTo?: RefObject<HTMLElement | null> | string;
}

/**
 * A "connected" wrapper over {@link GenAIChatDialog} that centralizes the wiring every consumer otherwise
 * duplicates: object-type derivation, the dispatcher-based seeding flow (clear thread / set user context), default link handling, and normalizing
 * raw chat events into the {@link GenAIChatConnectedEvent} union.
 *
 * Consumers supply their own data sources (backend/workspace/permissions), open-state, telemetry sink and
 * toast strings — keeping per-app i18n out of this shared component.
 *
 * @internal
 */
export function GenAIChatDialogConnected({
    backend,
    workspace,
    locale,
    canManage,
    canAnalyze,
    canFullControl,
    settings,
    agentId,
    effort,
    isOpen,
    isDisabled = true,
    displayMode,
    onOpen,
    onClose,
    askedQuestion,
    askSeq,
    userContext,
    ambientUserContext,
    ambientUserContextLoading,
    publisherDocumentSaved,
    dashboardSaved,
    appendToChat,
    replaceUserContext,
    includeTags,
    excludeTags,
    objectTypes: objectTypesOverride,
    onEvent,
    onAnyEvent,
    dialogPosition,
    className,
    colorPalette,
    allowNativeLinks = true,
    onLinkClick,
    returnFocusTo,
}: IGenAIChatDialogConnectedProps) {
    const defaultLinkClick = useCallback(
        ({
            itemUrl,
            newTab,
            preventDefault,
            type,
            dashboardStatus,
        }: LinkHandlerEvent): string | undefined => {
            // NOTE: If dashboard is draft, do nothing for now
            if (type === "dashboard" && dashboardStatus === "draft") {
                return;
            }

            if (itemUrl) {
                preventDefault();
                if (newTab) {
                    window.open(itemUrl, "_blank");
                } else {
                    window.location.assign(itemUrl);
                }
            }
            return itemUrl;
        },
        [],
    );

    const eventHandlers = useMemo(
        () => [
            {
                // Single catch-all that both fans out to `onEvent` (named) and `onAnyEvent` (raw).
                eval: (_e: ChatEvent): _e is ChatEvent => true,
                handler: (event: ChatEvent) => {
                    onAnyEvent?.(event);
                    const connectedEvent = toGenAIChatConnectedEvent(event);
                    if (connectedEvent) {
                        onEvent?.(connectedEvent);
                    }
                },
            },
        ],
        [onEvent, onAnyEvent],
    );

    const objectTypes = useMemo<GenAIObjectType[]>(() => {
        if (objectTypesOverride) {
            return objectTypesOverride;
        }
        const types: GenAIObjectType[] = ["dashboard", "visualization"];
        if (canManage) {
            types.push("metric");
        }
        return types;
    }, [objectTypesOverride, canManage]);

    const [chatDispatcher, setDispatcher] = useState<Dispatch | null>(null);
    const onDispatcher = useCallback((dispatcher: Dispatch) => {
        setDispatcher(() => dispatcher);
    }, []);

    // Mirror the host-provided ambient context into the chat store whenever it changes,
    // including `undefined` to clear it when the user leaves the context (e.g. the dashboard).
    useEffect(() => {
        if (!chatDispatcher) {
            return;
        }
        chatDispatcher(
            setAmbientUserContextAction({
                userContext: ambientUserContext,
                loading: ambientUserContextLoading,
            }),
        );
    }, [chatDispatcher, ambientUserContext, ambientUserContextLoading]);

    usePublisherDocumentSavedSync(chatDispatcher, publisherDocumentSaved);
    useDashboardSavedSync(chatDispatcher, dashboardSaved);

    // The token of the last seed we applied. Each ask is identified by `askSeq` (bumped on every ask,
    // so even a repeated identical question re-seeds); we seed once per token. Without this guard the
    // effect would replay the question whenever `settings`/`userContext` merely change object identity.
    const lastSeedTokenRef = useRef<string | number | null>(null);

    useEffect(() => {
        // Only seed while the chat is open, and only once per ask (LX-2544).
        if (!isOpen || !chatDispatcher || !settings) {
            return;
        }

        const seedToken = askSeq ?? askedQuestion ?? JSON.stringify(userContext ?? {});
        if (lastSeedTokenRef.current === seedToken) {
            return;
        }
        lastSeedTokenRef.current = seedToken;

        buildSeedActions({
            agentId,
            effort,
            askedQuestion,
            userContext,
            replaceUserContext,
            appendToChat,
        }).forEach((action) => chatDispatcher(action));
    }, [
        isOpen,
        agentId,
        effort,
        chatDispatcher,
        askedQuestion,
        askSeq,
        userContext,
        appendToChat,
        settings,
        replaceUserContext,
    ]);

    return (
        <GenAIChatDialog
            isOpen={isOpen}
            disabled={isDisabled}
            locale={locale}
            backend={backend}
            displayMode={displayMode}
            workspace={workspace}
            canManage={canManage}
            canAnalyze={canAnalyze}
            canFullControl={canFullControl}
            settings={settings}
            objectTypes={objectTypes}
            includeTags={includeTags}
            excludeTags={excludeTags}
            className={className}
            dialogPosition={dialogPosition}
            colorPalette={colorPalette}
            allowNativeLinks={allowNativeLinks}
            onLinkClick={onLinkClick ?? defaultLinkClick}
            onOpen={onOpen}
            onClose={onClose}
            eventHandlers={eventHandlers}
            onDispatcher={onDispatcher}
            returnFocusTo={returnFocusTo}
        />
    );
}
