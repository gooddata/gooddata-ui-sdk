// (C) 2026 GoodData Corporation

import { type RefObject, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { type IAnalyticalBackend, type IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import type { GenAIObjectType, IColorPalette, IGenAIUserContext } from "@gooddata/sdk-model";

import { makeTextContents, makeUserItem, makeUserMessage } from "../model.js";
import { setAmbientUserContextAction, setUserContextAction } from "../store/chatWindow/chatWindowSlice.js";
import {
    type ChatAssistantMessageEvent,
    type ChatClosedEvent,
    type ChatCopyToClipboardEvent,
    type ChatEvent,
    type ChatFeedbackErrorEvent,
    type ChatFeedbackEvent,
    type ChatOpenedEvent,
    type ChatResetEvent,
    type ChatSaveVisualizationErrorEvent,
    type ChatSaveVisualizationSuccessEvent,
    type ChatUserMessageEvent,
    isChatAssistantMessageEvent,
    isChatClosedEvent,
    isChatCopyToClipboardEvent,
    isChatFeedbackErrorEvent,
    isChatFeedbackEvent,
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
} from "../store/messages/messagesSlice.js";

import { type LinkHandlerEvent } from "./ConfigContext.js";
import { GenAIChatDialog, type GenAIChatDialogProps } from "./GenAIChatDialog.js";

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
    | { name: "save-visualization-success"; payload: ChatSaveVisualizationSuccessEvent }
    | { name: "save-visualization-error"; payload: ChatSaveVisualizationErrorEvent }
    | { name: "copy-to-clipboard"; payload: ChatCopyToClipboardEvent };

type Dispatch = Parameters<Required<GenAIChatDialogProps>["onDispatcher"]>[0];

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
    onOpen: () => void;
    onClose: () => void;

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
     * Agent ID to use for the seeded question. If not provided, the default agent will be used.
     */
    agentId?: string;
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
 * duplicates: object-type derivation, the dispatcher-based seeding flow (clear thread / set user context /
 * agentic-vs-classic message keyed on `enableAiAgenticConversations`), default link handling, and normalizing
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
    isOpen,
    onOpen,
    onClose,
    askedQuestion,
    askSeq,
    userContext,
    ambientUserContext,
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
        ({ itemUrl, newTab, preventDefault }: LinkHandlerEvent): string | undefined => {
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
                    if (!onEvent) {
                        return;
                    }
                    if (isChatOpenedEvent(event)) {
                        onEvent({ name: "opened", payload: event });
                    } else if (isChatClosedEvent(event)) {
                        onEvent({ name: "closed", payload: event });
                    } else if (isChatResetEvent(event)) {
                        onEvent({ name: "reset", payload: event });
                    } else if (isChatUserMessageEvent(event)) {
                        onEvent({ name: "user-message", payload: event });
                    } else if (isChatAssistantMessageEvent(event)) {
                        onEvent({ name: "assistant-message", payload: event });
                    } else if (isChatFeedbackEvent(event)) {
                        onEvent({ name: "feedback", payload: event });
                    } else if (isChatFeedbackErrorEvent(event)) {
                        onEvent({ name: "feedback-error", payload: event });
                    } else if (isChatSaveVisualizationSuccessEvent(event)) {
                        onEvent({ name: "save-visualization-success", payload: event });
                    } else if (isChatSaveVisualizationErrorEvent(event)) {
                        onEvent({ name: "save-visualization-error", payload: event });
                    } else if (isChatCopyToClipboardEvent(event)) {
                        onEvent({ name: "copy-to-clipboard", payload: event });
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
        chatDispatcher(setAmbientUserContextAction({ userContext: ambientUserContext }));
    }, [chatDispatcher, ambientUserContext]);

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

        // Check clean
        const clear = (askedQuestion || userContext) && !appendToChat;
        if (clear) {
            chatDispatcher(clearThreadAction());
        }
        // Agent id override
        if (userContext || askedQuestion) {
            chatDispatcher(setSelectedAgentAction({ agentId }));
        }
        // Always set (and thereby clear when undefined) so a follow-up ask without context does not
        // inherit the previous ask's user context (LX-2544).
        chatDispatcher(setUserContextAction({ userContext, replaceUserContext }));
        // Ask question
        if (askedQuestion) {
            if (settings.enableAiAgenticConversations) {
                chatDispatcher(newMessageAction(makeUserItem({ type: "text", text: askedQuestion })));
            } else {
                chatDispatcher(newMessageAction(makeUserMessage([makeTextContents(askedQuestion, [])])));
            }
        }
    }, [
        isOpen,
        agentId,
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
            locale={locale}
            backend={backend}
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
