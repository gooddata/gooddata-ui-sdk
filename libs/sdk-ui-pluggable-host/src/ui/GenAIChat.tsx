// (C) 2026 GoodData Corporation

import { useCallback, useEffect, useMemo, useState } from "react";

import { defineMessage, useIntl } from "react-intl";

import { type IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import type { GenAIObjectType } from "@gooddata/sdk-model";
import { useBackendStrict } from "@gooddata/sdk-ui";
import {
    type ChatAssistantMessageEvent,
    type ChatClosedEvent,
    type ChatFeedbackEvent,
    type ChatOpenedEvent,
    type ChatResetEvent,
    type ChatSaveVisualizationErrorEvent,
    type ChatUserMessageEvent,
    type LinkHandlerEvent,
    isChatAssistantMessageEvent,
    isChatClosedEvent,
    isChatCopyToClipboardEvent,
    isChatFeedbackEvent,
    isChatOpenedEvent,
    isChatResetEvent,
    isChatSaveVisualizationErrorEvent,
    isChatSaveVisualizationSuccessEvent,
    isChatUserMessageEvent,
    makeUserItem,
} from "@gooddata/sdk-ui-gen-ai";
import {
    GenAIChatDialog,
    type GenAIChatDialogProps,
    clearThreadAction,
    makeTextContents,
    makeUserMessage,
    newMessageAction,
} from "@gooddata/sdk-ui-gen-ai/internal";
import { HEADER_CHAT_BUTTON_ID, useToastMessage } from "@gooddata/sdk-ui-kit";

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
    | { name: "chat.assistant-message"; payload: ChatAssistantMessageEvent };

type Dispatch = Parameters<Required<GenAIChatDialogProps>["onDispatcher"]>[0];

export interface IGenAIChatProps {
    workspaceId: string;
    open: boolean;
    onOpen: () => void;
    onClose: () => void;
    askedQuestion?: string | null;
    canManageProject?: boolean;
    canAnalyzeProject?: boolean;
    canFullControl?: boolean;
    settings?: IUserWorkspaceSettings;
    onEvent?: (event: GenAIChatEvent) => void;
}

export function GenAIChat({
    workspaceId,
    open,
    onOpen,
    onClose,
    askedQuestion,
    canManageProject,
    canAnalyzeProject,
    canFullControl,
    settings,
    onEvent,
}: IGenAIChatProps) {
    const { addSuccess, addError } = useToastMessage();
    const intl = useIntl();
    const backend = useBackendStrict();

    const onLinkClick = useCallback(({ itemUrl, newTab, preventDefault }: LinkHandlerEvent) => {
        if (itemUrl) {
            preventDefault();
            if (newTab) {
                window.open(itemUrl, "_blank");
            } else {
                window.location.assign(itemUrl);
            }
        }
    }, []);

    const events = useMemo(() => {
        return [
            {
                eval: isChatOpenedEvent,
                handler: (data: ChatOpenedEvent) => onEvent?.({ name: "chat.opened", payload: data }),
            },
            {
                eval: isChatClosedEvent,
                handler: (data: ChatClosedEvent) => onEvent?.({ name: "chat.closed", payload: data }),
            },
            {
                eval: isChatResetEvent,
                handler: (data: ChatResetEvent) => onEvent?.({ name: "chat.reset", payload: data }),
            },
            {
                eval: isChatFeedbackEvent,
                handler: (data: ChatFeedbackEvent) => onEvent?.({ name: "chat.feedback", payload: data }),
            },
            {
                eval: isChatUserMessageEvent,
                handler: (data: ChatUserMessageEvent) =>
                    onEvent?.({ name: "chat.user-message", payload: data }),
            },
            {
                eval: isChatAssistantMessageEvent,
                handler: (data: ChatAssistantMessageEvent) =>
                    onEvent?.({ name: "chat.assistant-message", payload: data }),
            },
            {
                eval: isChatSaveVisualizationSuccessEvent,
                handler: () => {
                    addSuccess(defineMessage({ id: "messages.genAi.visualisation.saved.success" }));
                },
            },
            {
                eval: isChatSaveVisualizationErrorEvent,
                handler: ({ errorType, errorMessage }: ChatSaveVisualizationErrorEvent) => {
                    addError(defineMessage({ id: "messages.genAi.visualisation.saved.error" }), {
                        showMore: intl.formatMessage({ id: "messages.showMore" }),
                        showLess: intl.formatMessage({ id: "messages.showLess" }),
                        errorDetail: intl.formatMessage(
                            { id: "messages.genAi.visualisation.saved.error.detail" },
                            {
                                errorType,
                                errorMessage,
                            },
                        ),
                        duration: 0,
                    });
                },
            },
            {
                eval: isChatCopyToClipboardEvent,
                handler: () => {
                    addSuccess(defineMessage({ id: "messages.genAi.visualisation.link.copied" }));
                },
            },
        ];
    }, [addError, addSuccess, intl, onEvent]);

    const objectTypes = useMemo<GenAIObjectType[]>(() => {
        const types: GenAIObjectType[] = ["dashboard", "visualization"];
        if (canManageProject) {
            types.push("metric");
        }
        return types;
    }, [canManageProject]);

    const [chatDispatcher, setDispatcher] = useState<Dispatch | null>(null);
    const onDispatcher = useCallback((dispatcher: Dispatch) => {
        setDispatcher(() => dispatcher);
    }, []);

    useEffect(() => {
        if (!chatDispatcher || !askedQuestion || !settings) {
            return;
        }

        chatDispatcher(clearThreadAction());
        if (settings.enableAiAgenticConversations) {
            chatDispatcher(newMessageAction(makeUserItem({ type: "text", text: askedQuestion })));
        } else {
            chatDispatcher(newMessageAction(makeUserMessage([makeTextContents(askedQuestion, [])])));
        }
    }, [chatDispatcher, askedQuestion, settings]);

    return (
        <GenAIChatDialog
            isOpen={open}
            locale={intl.locale}
            canManage={canManageProject}
            canAnalyze={canAnalyzeProject}
            canFullControl={canFullControl}
            objectTypes={objectTypes}
            onLinkClick={onLinkClick}
            onClose={onClose}
            onOpen={onOpen}
            workspace={workspaceId}
            backend={backend}
            settings={settings}
            eventHandlers={events}
            onDispatcher={onDispatcher}
            returnFocusTo={HEADER_CHAT_BUTTON_ID}
        />
    );
}
