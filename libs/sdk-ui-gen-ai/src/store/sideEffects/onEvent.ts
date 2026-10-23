// (C) 2024-2026 GoodData Corporation

import { call, getContext, select, takeEvery } from "redux-saga/effects";

import { type GenAIChatRoutingUseCase } from "@gooddata/sdk-model";

import {
    type IChatConversationErrorContent,
    type IChatConversationLocal,
    type IChatConversationLocalContent,
    type IChatConversationLocalItem,
    type IChatConversationMultipartLocalPart,
} from "../../model.js";
import {
    copyToClipboardAction,
    onDefinitionReceivedAction,
    setAmbientUserContextAction,
    setFullscreenAction,
    setOpenAction,
    setUserContextAction,
} from "../chatWindow/chatWindowSlice.js";
import {
    type ChatAssistantMessageEvent,
    type ChatClarificationQuestion,
    type EventDispatcher,
} from "../events.js";
import { setIsOpened } from "../localStorage.js";
import {
    conversationByIdOrLocalIdSelector,
    conversationMessagesByIdSelector,
    conversationMessagesSelector,
    threadIdSelector,
} from "../messages/messagesSelectors.js";
import {
    clearThreadAction,
    deleteConversationAction,
    deleteConversationFailureAction,
    deleteConversationSuccessAction,
    evaluateMessageCompleteAction,
    evaluateMessageStreamingAction,
    filledFormAction,
    loadConversationSuccessAction,
    newMessageAction,
    pinConversationFailureAction,
    pinConversationSuccessAction,
    renameConversationAction,
    renameConversationFailureAction,
    renameConversationSuccessAction,
    saveVisualizationErrorAction,
    saveVisualizationSuccessAction,
    setCurrentConversationAction,
    setSelectedAgentAction,
    setUserFeedback,
    setUserFeedbackError,
    visualizationErrorAction,
} from "../messages/messagesSlice.js";

import { convertToChatClarificationAnswers } from "./converters/toChatClarificationAnswers.js";
import { convertToChatClarificationQuestions } from "./converters/toChatClarificationQuestions.js";

export function* onEvent() {
    yield takeEvery(setOpenAction.type, onSetOpen);
    yield takeEvery(setFullscreenAction.type, onFullscreenChanged);
    yield takeEvery(setSelectedAgentAction.type, onSelectedAgentChanged);
    yield takeEvery(loadConversationSuccessAction.type, onThreadLoaded);
    yield takeEvery(clearThreadAction.type, onClearThread);
    yield takeEvery(newMessageAction.type, onNewMessage);
    yield takeEvery(evaluateMessageStreamingAction.type, onEvaluateMessageStreaming);
    yield takeEvery(evaluateMessageCompleteAction.type, onEvaluateMessageComplete);
    yield takeEvery(filledFormAction.type, onClarificationQuestionsAnswered);
    yield takeEvery(setUserFeedback.type, onUserFeedback);
    yield takeEvery(setUserFeedbackError.type, onUserFeedbackError);
    yield takeEvery(visualizationErrorAction.type, onVisualizationError);
    yield takeEvery(saveVisualizationErrorAction.type, onSaveVisualizationError);
    yield takeEvery(saveVisualizationSuccessAction.type, onSaveVisualizationSuccess);
    yield takeEvery(onDefinitionReceivedAction.type, onDefinitionReceived);
    yield takeEvery(copyToClipboardAction.type, onCopyToClipboard);
    yield takeEvery(pinConversationSuccessAction.type, onConversationPinUpdated);
    yield takeEvery(pinConversationFailureAction.type, onConversationPinError);
    yield takeEvery(deleteConversationAction.type, onConversationDelete);
    yield takeEvery(deleteConversationSuccessAction.type, onConversationDeletedSuccess);
    yield takeEvery(deleteConversationFailureAction.type, onConversationDeletedError);
    yield takeEvery(renameConversationAction.type, onConversationRename);
    yield takeEvery(renameConversationSuccessAction.type, onConversationRenamedSuccess);
    yield takeEvery(renameConversationFailureAction.type, onConversationRenamedError);
    yield takeEvery(setCurrentConversationAction.type, onConversationChanged);
    yield takeEvery(loadConversationSuccessAction.type, onConversationLoaded);
    yield takeEvery(setAmbientUserContextAction.type, onAmbientUserContextChanged);
    yield takeEvery(setUserContextAction.type, onUserContextChanged);
}

function* onConversationPinUpdated({
    payload: { conversation, pinned },
}: ReturnType<typeof pinConversationSuccessAction>) {
    const eventDispatcher: EventDispatcher = yield getContext("eventDispatcher");
    const threadId: string | undefined = yield select(threadIdSelector);

    eventDispatcher.dispatch({
        type: "chatConversationPinned",
        threadId,
        conversation,
        pinned,
    });
}

function* onConversationPinError({
    payload: { conversation, error },
}: ReturnType<typeof pinConversationFailureAction>) {
    const eventDispatcher: EventDispatcher = yield getContext("eventDispatcher");
    const threadId: string | undefined = yield select(threadIdSelector);

    eventDispatcher.dispatch({
        type: "chatConversationPinError",
        threadId,
        conversation,
        error,
    });
}

function* onConversationDelete({ payload: { conversation } }: ReturnType<typeof deleteConversationAction>) {
    const eventDispatcher: EventDispatcher = yield getContext("eventDispatcher");
    const threadId: string | undefined = yield select(threadIdSelector);

    eventDispatcher.dispatch({
        type: "chatConversationDelete",
        threadId,
        conversation,
    });
}

function* onConversationDeletedSuccess({
    payload: { conversation },
}: ReturnType<typeof deleteConversationSuccessAction>) {
    const eventDispatcher: EventDispatcher = yield getContext("eventDispatcher");
    const threadId: string | undefined = yield select(threadIdSelector);

    eventDispatcher.dispatch({
        type: "chatConversationDeletedSuccess",
        threadId,
        conversation,
    });
}

function* onConversationDeletedError({
    payload: { conversation, error },
}: ReturnType<typeof deleteConversationFailureAction>) {
    const eventDispatcher: EventDispatcher = yield getContext("eventDispatcher");
    const threadId: string | undefined = yield select(threadIdSelector);

    eventDispatcher.dispatch({
        type: "chatConversationDeletedError",
        threadId,
        conversation,
        error,
    });
}

function* onConversationRename({
    payload: { conversation, title },
}: ReturnType<typeof renameConversationAction>) {
    const eventDispatcher: EventDispatcher = yield getContext("eventDispatcher");
    const threadId: string | undefined = yield select(threadIdSelector);

    eventDispatcher.dispatch({
        type: "chatConversationRename",
        threadId,
        conversation,
        title,
    });
}

function* onConversationRenamedSuccess({
    payload: { conversation, title },
}: ReturnType<typeof renameConversationSuccessAction>) {
    const eventDispatcher: EventDispatcher = yield getContext("eventDispatcher");
    const threadId: string | undefined = yield select(threadIdSelector);

    eventDispatcher.dispatch({
        type: "chatConversationRenamedSuccess",
        threadId,
        conversation,
        title,
    });
}

function* onConversationRenamedError({
    payload: { conversation, title, error },
}: ReturnType<typeof renameConversationFailureAction>) {
    const eventDispatcher: EventDispatcher = yield getContext("eventDispatcher");
    const threadId: string | undefined = yield select(threadIdSelector);

    eventDispatcher.dispatch({
        type: "chatConversationRenamedError",
        title: title ?? "",
        threadId,
        conversation,
        error,
    });
}

function* onConversationChanged({
    payload: { conversation },
}: ReturnType<typeof setCurrentConversationAction>) {
    const eventDispatcher: EventDispatcher = yield getContext("eventDispatcher");
    const threadId: string | undefined = yield select(threadIdSelector);

    eventDispatcher.dispatch({
        type: "chatConversationChanged",
        threadId,
        conversation,
    });
}

function* onConversationLoaded({
    payload: { currentConversation },
}: ReturnType<typeof loadConversationSuccessAction>) {
    const eventDispatcher: EventDispatcher = yield getContext("eventDispatcher");
    const threadId: string | undefined = yield select(threadIdSelector);

    eventDispatcher.dispatch({
        type: "chatConversationChanged",
        threadId,
        conversation: currentConversation,
    });
}

function* onSetOpen({ payload: { isOpen } }: ReturnType<typeof setOpenAction>) {
    setIsOpened(isOpen);

    if (isOpen) {
        // Open event is handled once the chat thread is loaded, so that we have the threadId
        return;
    }

    const eventDispatcher: EventDispatcher = yield getContext("eventDispatcher");
    const threadId: string | undefined = yield select(threadIdSelector);

    eventDispatcher.dispatch({
        type: "chatClosed",
        threadId,
    });
}

function* onFullscreenChanged({ payload: { isFullscreen } }: ReturnType<typeof setFullscreenAction>) {
    const eventDispatcher: EventDispatcher = yield getContext("eventDispatcher");
    const threadId: string | undefined = yield select(threadIdSelector);

    eventDispatcher.dispatch({
        type: "onModeChange",
        threadId,
        mode: isFullscreen ? "fullscreen" : "docked",
    });
}

function* onSelectedAgentChanged({
    payload: { previousAgentId, agentId },
}: ReturnType<typeof setSelectedAgentAction>) {
    const eventDispatcher: EventDispatcher = yield getContext("eventDispatcher");
    const threadId: string | undefined = yield select(threadIdSelector);

    eventDispatcher.dispatch({
        type: "onSelectedAgentAction",
        threadId,
        previousAgentId,
        agentId,
    });
}

function* onThreadLoaded({ payload: { threadId } }: ReturnType<typeof loadConversationSuccessAction>) {
    // Only emit the chatOpened event when we have a real server-side threadId.
    // The cache-restore dispatch uses an empty threadId and should not trigger telemetry.
    if (!threadId) {
        return;
    }
    const eventDispatcher: EventDispatcher = yield getContext("eventDispatcher");

    eventDispatcher.dispatch({
        type: "chatOpened",
        threadId,
    });
}

function* onClearThread(_action: ReturnType<typeof clearThreadAction>) {
    const eventDispatcher: EventDispatcher = yield getContext("eventDispatcher");
    const threadId: string | undefined = yield select(threadIdSelector);

    eventDispatcher.dispatch({
        type: "chatReset",
        threadId,
    });
}

export function* onNewMessage({ payload: message }: ReturnType<typeof newMessageAction>) {
    if (message.role !== "user") {
        return;
    }

    const messageContent = message.content as IChatConversationLocalContent;
    if (messageContent.type !== "text" && messageContent.type !== "clarifyingAnswers") {
        return;
    }

    const eventDispatcher: EventDispatcher = yield getContext("eventDispatcher");
    const threadId: string | undefined = yield select(threadIdSelector);

    switch (messageContent.type) {
        case "text":
            eventDispatcher.dispatch({
                type: "chatUserMessage",
                threadId,
                question: messageContent.text,
                objects: messageContent.objects ?? [],
            });
            break;
        case "clarifyingAnswers":
            eventDispatcher.dispatch({
                type: "chatUserAnswers",
                threadId,
                interactionId: messageContent.questionsItemId,
                answers: convertToChatClarificationAnswers(messageContent.answers),
            });
            break;
    }
}

export function* onEvaluateMessageComplete({
    payload: { assistantMessageId, cancelled, conversationId },
}: ReturnType<typeof evaluateMessageCompleteAction>) {
    const message: MessageInfo | null = yield call(loadMessage, assistantMessageId, conversationId);

    if (!message?.useCase) {
        return;
    }

    const eventDispatcher: EventDispatcher = yield getContext("eventDispatcher");
    const conversation: IChatConversationLocal | undefined = conversationId
        ? yield select(conversationByIdOrLocalIdSelector, conversationId)
        : undefined;
    const threadId: string | undefined = conversation?.id || conversationId;

    eventDispatcher.dispatch({
        type: "chatAssistantMessage",
        interactionId: message.id,
        useCase: message.useCase,
        skills: message.skills,
        threadId,
        ...(cancelled ? { cancelled: true } : {}),
    });
}

export function* onEvaluateMessageStreaming({
    payload: { assistantMessageId, conversationId },
}: ReturnType<typeof evaluateMessageStreamingAction>) {
    const message: MessageInfo | null = yield call(loadMessage, assistantMessageId, conversationId);

    if (!message?.clarificationQuestions?.length || message.filled) {
        return;
    }

    const eventDispatcher: EventDispatcher = yield getContext("eventDispatcher");
    const conversation: IChatConversationLocal | undefined = conversationId
        ? yield select(conversationByIdOrLocalIdSelector, conversationId)
        : undefined;
    const threadId: string | undefined = conversation?.id || conversationId;

    eventDispatcher.dispatch({
        type: "chatClarificationQuestions",
        interactionId: message.id,
        threadId,
        questions: message.clarificationQuestions,
    });
}

export function* onClarificationQuestionsAnswered({
    payload: { assistantMessageId, responses },
}: ReturnType<typeof filledFormAction>) {
    const message: MessageInfo | null = yield call(loadMessage, assistantMessageId);

    if (!message?.clarificationQuestions?.length) {
        return;
    }

    const eventDispatcher: EventDispatcher = yield getContext("eventDispatcher");
    const threadId: string | undefined = yield select(threadIdSelector);

    eventDispatcher.dispatch({
        type: "chatClarificationQuestions",
        interactionId: message.id,
        threadId,
        questions: message.clarificationQuestions,
        responses,
    });
}

function* onUserFeedback({
    payload: { assistantMessageId, feedback, userTextFeedback },
}: ReturnType<typeof setUserFeedback>) {
    const message: MessageInfo | null = yield call(loadMessage, assistantMessageId);

    if (!message) {
        return;
    }

    const eventDispatcher: EventDispatcher = yield getContext("eventDispatcher");
    const threadId: string | undefined = yield select(threadIdSelector);

    eventDispatcher.dispatch({
        type: "chatFeedback",
        interactionId: message.id,
        threadId,
        feedback,
        userTextFeedback,
    });
}

function* onUserFeedbackError({
    payload: { assistantMessageId, error },
}: ReturnType<typeof setUserFeedbackError>) {
    const message: MessageInfo | null = yield call(loadMessage, assistantMessageId);

    if (!message) {
        return;
    }

    const eventDispatcher: EventDispatcher = yield getContext("eventDispatcher");
    const threadId: string | undefined = yield select(threadIdSelector);

    eventDispatcher.dispatch({
        type: "chatFeedbackError",
        interactionId: message.id,
        threadId,
        errorMessage: error,
    });
}

function* onVisualizationError({
    payload: { errorMessage, errorType },
}: ReturnType<typeof visualizationErrorAction>) {
    const eventDispatcher: EventDispatcher = yield getContext("eventDispatcher");
    const threadId: string | undefined = yield select(threadIdSelector);

    eventDispatcher.dispatch({
        type: "chatVisualizationError",
        threadId,
        errorMessage,
        errorType,
    });
}

function* onSaveVisualizationError({ payload: { error } }: ReturnType<typeof saveVisualizationErrorAction>) {
    const eventDispatcher: EventDispatcher = yield getContext("eventDispatcher");
    const threadId: string | undefined = yield select(threadIdSelector);

    eventDispatcher.dispatch({
        type: "chatSaveVisualizationError",
        threadId,
        errorMessage: error.message,
        errorType: error.name,
    });
}

function* onSaveVisualizationSuccess({
    payload: { savedVisualizationId },
}: ReturnType<typeof saveVisualizationSuccessAction>) {
    const eventDispatcher: EventDispatcher = yield getContext("eventDispatcher");
    const threadId: string | undefined = yield select(threadIdSelector);

    eventDispatcher.dispatch({
        type: "chatSaveVisualizationSuccess",
        threadId,
        savedVisualizationId,
    });
}

function* onCopyToClipboard({ payload: { content } }: ReturnType<typeof copyToClipboardAction>) {
    const eventDispatcher: EventDispatcher = yield getContext("eventDispatcher");
    const threadId: string | undefined = yield select(threadIdSelector);

    eventDispatcher.dispatch({
        type: "chatCopyToClipboard",
        threadId,
        content,
    });
}

function* onDefinitionReceived({ payload }: ReturnType<typeof onDefinitionReceivedAction>) {
    const eventDispatcher: EventDispatcher = yield getContext("eventDispatcher");
    const threadId: string | undefined = yield select(threadIdSelector);

    eventDispatcher.dispatch({
        type: "onDefinitionReceived",
        threadId,
        ...payload,
    });
}

type MessageInfo = {
    id: string;
    localId: string;
    useCase: GenAIChatRoutingUseCase | undefined;
    skills?: ChatAssistantMessageEvent["skills"];
    clarificationQuestions?: ChatClarificationQuestion[];
    filled?: boolean;
};

function* loadMessage(
    assistantMessageId: string,
    conversationId?: string,
): Generator<unknown, MessageInfo | null> {
    const allMessages: IChatConversationLocalItem[] = conversationId
        ? yield select(conversationMessagesByIdSelector, conversationId)
        : yield select(conversationMessagesSelector);
    const message = allMessages.find((m) => m.localId === assistantMessageId);

    return message
        ? {
              id: message.id,
              localId: message.localId,
              useCase: convertMessageTypeTo(message?.content),
              skills: message.content.type === "skillsActivated" ? message.content.skills : undefined,
              clarificationQuestions: convertToChatClarificationQuestions(message.content),
              filled: message.filled,
          }
        : null;
}

function convertMessageTypeTo(
    content:
        | IChatConversationLocalItem["content"]
        | IChatConversationLocalContent
        | IChatConversationErrorContent
        | IChatConversationMultipartLocalPart
        | undefined,
): GenAIChatRoutingUseCase {
    switch (content?.type) {
        case "error":
            return "INVALID";
        case "multipart": {
            const cases = content.parts.map((part) => convertMessageTypeTo(part));
            return cases.find((c) => c !== "GENERAL") ?? "GENERAL";
        }
        case "whatIf":
            return "WHAT_IF";
        case "visualization":
            return "CREATE_VISUALIZATION";
        case "kda":
            return "CHANGE_ANALYSIS";
        default:
            return "GENERAL";
    }
}

function* onAmbientUserContextChanged({ payload }: ReturnType<typeof setAmbientUserContextAction>) {
    const eventDispatcher: EventDispatcher = yield getContext("eventDispatcher");
    const threadId: string | undefined = yield select(threadIdSelector);

    eventDispatcher.dispatch({
        type: "onContextChange",
        threadId,
        contextType: "ambient",
        ...payload,
    });
}

function* onUserContextChanged({ payload }: ReturnType<typeof setUserContextAction>) {
    const eventDispatcher: EventDispatcher = yield getContext("eventDispatcher");
    const threadId: string | undefined = yield select(threadIdSelector);

    eventDispatcher.dispatch({
        type: "onContextChange",
        threadId,
        contextType: "user",
        ...payload,
    });
}
