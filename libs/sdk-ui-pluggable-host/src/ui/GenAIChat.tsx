// (C) 2026 GoodData Corporation

import { useCallback } from "react";

import { defineMessage, useIntl } from "react-intl";

import { type IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import type { GenAIChatEffort, IGenAIUserContext } from "@gooddata/sdk-model";
import { useBackendStrict } from "@gooddata/sdk-ui";
import { type LinkHandlerEvent } from "@gooddata/sdk-ui-gen-ai";
import {
    GenAIChatDialogConnected,
    type GenAIChatConnectedEvent,
    type ISequencedAppEvent,
} from "@gooddata/sdk-ui-gen-ai/internal";
import { HEADER_CHAT_BUTTON_ID, useToastMessage } from "@gooddata/sdk-ui-kit";

import { handleChatLinkClick } from "./chatLinks.js";
import { useGenAiRightPanel } from "./useGenAiRightPanel.js";

// DOM id of the embedded dashboard's AI trigger button (defined in gdc-dashboards-runtime as
// EMBED_AI_TRIGGER_ID). Used as the chat's focus-return target when running embedded, where the host
// header chat button does not exist. Kept as a literal to avoid a host→app package dependency.
const EMBEDDED_AI_TRIGGER_ID = "embed-ai-trigger";
const EMBEDDED_CHAT_CLASS = "gd-gen-ai-chat-embedded";

/**
 * A chat event as the host hands it to the active application: the gen-ai event under its contract
 * name. Every event the connected chat emits maps to exactly one member, so a new chat event is
 * forwarded without the host learning about it. The payload types keep the host's own handling
 * (telemetry, chat mode) typed.
 */
export type GenAIChatEvent = {
    [K in GenAIChatConnectedEvent["name"]]: {
        name: `chat.${K}`;
        payload: Extract<GenAIChatConnectedEvent, { name: K }>["payload"];
    };
}[GenAIChatConnectedEvent["name"]];

export function toHostGenAIChatEvent(event: GenAIChatConnectedEvent): GenAIChatEvent {
    // Sound: name and payload are read from the same member of the union.
    return { name: `chat.${event.name}`, payload: event.payload } as GenAIChatEvent;
}

export interface IGenAIChatProps {
    workspaceId: string;
    open: boolean;
    disabled?: boolean;
    onOpen: () => void;
    onClose: () => void;
    askedQuestion?: string | null;
    /**
     * Monotonic counter bumped on every ask or conversation selection request. Repeated identical
     * requests still re-seed the chat or select the requested conversation.
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
    /** Existing conversation to select for the explicit request identified by `askSeq`. */
    conversationId?: string;
    /**
     * Reasoning effort for the conversation the seeded question starts. If not provided, the default is used.
     */
    effort?: GenAIChatEffort;
    /**
     * Ambient user context kept in sync by the active hosted application (e.g. the open dashboard
     * and its live filter state). Persists across messages and drives the chat's context indicator.
     */
    ambientUserContext?: IGenAIUserContext;
    /**
     * Whether the ambient user context is currently loading.
     */
    ambientUserContextLoading?: boolean;
    /** Recent events the active application sent to the chat, oldest first, e.g. a save of an object the chat drafted. */
    appEvents: ReadonlyArray<ISequencedAppEvent>;
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
    conversationId,
    effort,
    userContext,
    replaceUserContext,
    ambientUserContext,
    ambientUserContextLoading,
    appEvents,
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

    // The active app gets the click first (an embedded dashboard opens a visualization as an in-place
    // overlay). An embedded chat never navigates its iframe away, whatever the link type; otherwise a
    // click the app did not handle opens the link.
    const onLinkClick = useCallback(
        (link: LinkHandlerEvent) => handleChatLinkClick(link, { embedded, onAppLinkClick }),
        [onAppLinkClick, embedded],
    );

    const handleEvent = useCallback(
        (event: GenAIChatConnectedEvent) => {
            onEvent?.(toHostGenAIChatEvent(event));
            switch (event.name) {
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
                default:
                    break;
            }
        },
        [addError, addSuccess, intl, onEvent],
    );

    const enableRightPanel = useGenAiRightPanel(settings?.["enableGenAiRightPanel"] as boolean, embedded);

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
            conversationId={conversationId}
            effort={effort}
            replaceUserContext={replaceUserContext}
            ambientUserContext={ambientUserContext}
            appEvents={appEvents}
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
            displayMode={enableRightPanel ? "inline" : "modal"}
            returnFocusTo={embedded ? EMBEDDED_AI_TRIGGER_ID : HEADER_CHAT_BUTTON_ID}
        />
    );
}
