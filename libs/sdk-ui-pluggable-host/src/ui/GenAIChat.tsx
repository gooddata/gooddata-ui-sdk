// (C) 2026 GoodData Corporation

import { useCallback } from "react";

import { defineMessage, useIntl } from "react-intl";

import { type IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import type { IGenAIUserContext } from "@gooddata/sdk-model";
import { useBackendStrict } from "@gooddata/sdk-ui";
import {
    type ChatDefinitionReceivedEvent,
    type ChatAssistantMessageEvent,
    type ChatClosedEvent,
    type ChatFeedbackEvent,
    type ChatOpenedEvent,
    type ChatResetEvent,
    type ChatUserMessageEvent,
    type LinkHandlerEvent,
} from "@gooddata/sdk-ui-gen-ai";
import { GenAIChatDialogConnected, type GenAIChatConnectedEvent } from "@gooddata/sdk-ui-gen-ai/internal";
import { HEADER_CHAT_BUTTON_ID, useToastMessage } from "@gooddata/sdk-ui-kit";

// DOM id of the embedded dashboard's AI trigger button (defined in gdc-dashboards-runtime as
// EMBED_AI_TRIGGER_ID). Used as the chat's focus-return target when running embedded, where the host
// header chat button does not exist. Kept as a literal to avoid a host→app package dependency.
const EMBEDDED_AI_TRIGGER_ID = "embed-ai-trigger";
const EMBEDDED_CHAT_CLASS = "gd-gen-ai-chat-embedded";

/**
 * Discriminated union of GenAI chat events that are forwarded to the host
 * caller via the `onEvent` callback.
 *
 * @remarks
 * The standalone home-ui `GenAIChat` component called gdc-home-ui-specific
 * `trackGenAIChat*` telemetry helpers directly. To keep the host runtime free
 * of those deps, the host caller wires this through `onEvent`.
 */
export type GenAIChatEvent =
    | { name: "chat.opened"; payload: ChatOpenedEvent }
    | { name: "chat.closed"; payload: ChatClosedEvent }
    | { name: "chat.reset"; payload: ChatResetEvent }
    | { name: "chat.feedback"; payload: ChatFeedbackEvent }
    | { name: "chat.user-message"; payload: ChatUserMessageEvent }
    | { name: "chat.definition-received"; payload: ChatDefinitionReceivedEvent }
    | { name: "chat.assistant-message"; payload: ChatAssistantMessageEvent };

export interface IGenAIChatProps {
    workspaceId: string;
    open: boolean;
    disabled?: boolean;
    onOpen: () => void;
    onClose: () => void;
    askedQuestion?: string | null;
    /**
     * Monotonic counter bumped on every ask. Keying the seeding effect on it re-seeds the chat
     * (clear thread + send message) even when `askedQuestion` is identical to the previous ask.
     */
    askSeq?: number;
    /**
     * Context of the user's location when the question was asked (e.g. the active dashboard
     * of a hosted application), passed to the assistant alongside the seeded question.
     */
    userContext?: IGenAIUserContext;
    /**
     * When true, the user context is replaced instead of merged with the existing one.
     */
    replaceUserContext?: boolean;
    /**
     * When true, the seeded question is appended to the existing thread instead of clearing it first.
     */
    appendToChat?: boolean;
    /**
     * Agent ID to use for the seeded question. If not provided, the default agent will be used.
     */
    agentId?: string;
    /**
     * Ambient user context kept in sync by the active hosted application (e.g. the open dashboard
     * and its live filter state). Persists across messages and drives the chat's context indicator.
     */
    ambientUserContext?: IGenAIUserContext;
    /**
     * Whether the ambient user context is currently loading.
     */
    ambientUserContextLoading?: boolean;
    /**
     * Tag identifiers the assistant's object search/autocomplete should be restricted to,
     * reflecting the active hosted application's current view.
     */
    includeTags?: string[];
    /**
     * Tag identifiers the assistant's object search/autocomplete should exclude.
     */
    excludeTags?: string[];
    canManageProject?: boolean;
    canAnalyzeProject?: boolean;
    canFullControl?: boolean;
    settings?: IUserWorkspaceSettings;
    /** Where to place the chat (e.g. an embedded dashboard's left/right `showassistant` param). */
    dialogPosition?: "left" | "right";
    /** Whether the active app is embedded; switches the chat to the embedded presentation. */
    embedded?: boolean;
    /** Delegates a chat link click to the active app; returns true if the app handled it. */
    onAppLinkClick?: (link: { type?: string; id?: string; itemUrl?: string; newTab?: boolean }) => boolean;
    onEvent?: (event: GenAIChatEvent) => void;
}

/**
 * Host chrome's chat adapter. The generic chat wiring (object types, the seeded-question dispatch flow,
 * default link handling, event normalization) lives in `GenAIChatDialogConnected`
 * (`@gooddata/sdk-ui-gen-ai/internal`); this adapter only supplies the host's data sources, renders the
 * host's own save-visualization / copy toasts, and forwards telemetry events through `onEvent`.
 */
export function GenAIChat({
    workspaceId,
    open,
    disabled,
    onOpen,
    onClose,
    askedQuestion,
    askSeq,
    appendToChat,
    agentId,
    userContext,
    replaceUserContext,
    ambientUserContext,
    ambientUserContextLoading,
    includeTags,
    excludeTags,
    canManageProject,
    canAnalyzeProject,
    canFullControl,
    settings,
    dialogPosition,
    embedded,
    onAppLinkClick,
    onEvent,
}: IGenAIChatProps) {
    const { addSuccess, addError } = useToastMessage();
    const intl = useIntl();
    const backend = useBackendStrict();

    // Embedded link handling (this handler is only wired when `embedded`). Delegate to the active app —
    // it opens visualization links as an in-place overlay — and never let a link navigate the embedded
    // iframe away, matching the previous embedded dashboard chat which prevented default for every link
    // type (only visualizations did anything). Non-embedded mode uses the connected wrapper's default
    // open/navigate handler instead.
    const onLinkClick = useCallback(
        (link: LinkHandlerEvent): string | undefined => {
            if (!embedded && link.action === "open") {
                const currentUrl = window.location.pathname + window.location.hash;
                const areUrlsEqual = currentUrl === link.itemUrl;
                if (link.newTab) {
                    window.open(link.itemUrl, "_blank");
                } else if (!areUrlsEqual) {
                    window.location.assign(link.itemUrl);
                }
            }

            onAppLinkClick?.(link);
            link.preventDefault();

            return link.itemUrl;
        },
        [onAppLinkClick, embedded],
    );

    const handleEvent = useCallback(
        (event: GenAIChatConnectedEvent) => {
            switch (event.name) {
                case "opened":
                    onEvent?.({ name: "chat.opened", payload: event.payload });
                    break;
                case "closed":
                    onEvent?.({ name: "chat.closed", payload: event.payload });
                    break;
                case "reset":
                    onEvent?.({ name: "chat.reset", payload: event.payload });
                    break;
                case "feedback":
                    onEvent?.({ name: "chat.feedback", payload: event.payload });
                    break;
                case "user-message":
                    onEvent?.({ name: "chat.user-message", payload: event.payload });
                    break;
                case "assistant-message":
                    onEvent?.({ name: "chat.assistant-message", payload: event.payload });
                    break;
                case "save-visualization-success":
                    addSuccess(defineMessage({ id: "messages.genAi.visualisation.saved.success" }));
                    break;
                case "save-visualization-error":
                    addError(defineMessage({ id: "messages.genAi.visualisation.saved.error" }), {
                        showMore: intl.formatMessage({ id: "messages.showMore" }),
                        showLess: intl.formatMessage({ id: "messages.showLess" }),
                        errorDetail: intl.formatMessage(
                            { id: "messages.genAi.visualisation.saved.error.detail" },
                            {
                                errorType: event.payload.errorType,
                                errorMessage: event.payload.errorMessage,
                            },
                        ),
                        duration: 0,
                    });
                    break;
                case "copy-to-clipboard":
                    addSuccess(defineMessage({ id: "messages.genAi.visualisation.link.copied" }));
                    break;
                case "definition-received":
                    onEvent?.({ name: "chat.definition-received", payload: event.payload });
                    break;
                default:
                    break;
            }
        },
        [addError, addSuccess, intl, onEvent],
    );

    const enableGenAiRightPanel = settings?.["enableGenAiRightPanel"];

    return (
        <GenAIChatDialogConnected
            backend={backend}
            workspace={workspaceId}
            locale={intl.locale}
            isOpen={open}
            isDisabled={disabled}
            onOpen={onOpen}
            onClose={onClose}
            askedQuestion={askedQuestion}
            askSeq={askSeq}
            userContext={userContext}
            appendToChat={appendToChat}
            agentId={agentId}
            replaceUserContext={replaceUserContext}
            ambientUserContext={ambientUserContext}
            ambientUserContextLoading={ambientUserContextLoading}
            includeTags={includeTags}
            excludeTags={excludeTags}
            canManage={canManageProject}
            canAnalyze={canAnalyzeProject}
            canFullControl={canFullControl}
            settings={settings}
            dialogPosition={dialogPosition}
            className={embedded ? EMBEDDED_CHAT_CLASS : undefined}
            allowNativeLinks={false}
            onLinkClick={onLinkClick}
            onEvent={handleEvent}
            displayMode={embedded || !enableGenAiRightPanel ? "modal" : "inline"}
            returnFocusTo={embedded ? EMBEDDED_AI_TRIGGER_ID : HEADER_CHAT_BUTTON_ID}
        />
    );
}
