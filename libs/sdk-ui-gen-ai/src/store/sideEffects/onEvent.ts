// (C) 2024-2026 GoodData Corporation

import { call, getContext, select, takeEvery } from "redux-saga/effects";

import { type GenAIChatRoutingUseCase } from "@gooddata/sdk-model";

import {
    type IChatConversationErrorContent,
    type IChatConversationLocalContent,
    type IChatConversationLocalItem,
    type IChatConversationMultipartLocalPart,
    type Message,
    type RoutingContents,
    isChatConversationLocalItem,
    isRoutingContents,
    isTextContents,
    isUserMessage,
} from "../../model.js";
import { copyToClipboardAction, setOpenAction } from "../chatWindow/chatWindowSlice.js";
import { type EventDispatcher } from "../events.js";
import { clearCachedMessages, saveMessages, setIsOpened } from "../localStorage.js";
import {
    conversationMessagesSelector,
    conversationSelector,
    messagesSelector,
    threadIdSelector,
} from "../messages/messagesSelectors.js";
import {
    clearThreadAction,
    evaluateMessageCompleteAction,
    loadConversationsSuccessAction,
    loadThreadSuccessAction,
    newMessageAction,
    saveVisualizationErrorAction,
    saveVisualizationSuccessAction,
    setUserFeedback,
    setUserFeedbackError,
    visualizationErrorAction,
} from "../messages/messagesSlice.js";

export function* onEvent() {
    yield takeEvery(setOpenAction.type, onSetOpen);
    yield takeEvery(loadThreadSuccessAction.type, onThreadLoaded);
    yield takeEvery(loadConversationsSuccessAction.type, onThreadLoaded);
    yield takeEvery(clearThreadAction.type, onClearThread);
    yield takeEvery(newMessageAction.type, onNewMessage);
    yield takeEvery(evaluateMessageCompleteAction.type, onEvaluateMessageComplete);
    yield takeEvery(setUserFeedback.type, onUserFeedback);
    yield takeEvery(setUserFeedbackError.type, onUserFeedbackError);
    yield takeEvery(visualizationErrorAction.type, onVisualizationError);
    yield takeEvery(saveVisualizationErrorAction.type, onSaveVisualizationError);
    yield takeEvery(saveVisualizationSuccessAction.type, onSaveVisualizationSuccess);
    yield takeEvery(copyToClipboardAction.type, onCopyToClipboard);
}

function* persistMessages() {
    const workspace: string = yield getContext("workspace");
    const messages: Message[] = yield select(messagesSelector);
    saveMessages(workspace, messages);
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

function* onThreadLoaded({
    payload: { threadId },
}: ReturnType<typeof loadThreadSuccessAction | typeof loadConversationsSuccessAction>) {
    yield* persistMessages();

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
    const workspace: string = yield getContext("workspace");
    clearCachedMessages(workspace);

    const eventDispatcher: EventDispatcher = yield getContext("eventDispatcher");
    const threadId: string | undefined = yield select(threadIdSelector);

    eventDispatcher.dispatch({
        type: "chatReset",
        threadId,
    });
}

function* onNewMessage({ payload: message }: ReturnType<typeof newMessageAction>) {
    if (isChatConversationLocalItem(message)) {
        if (message.role !== "user") {
            return;
        }

        const messageContent = message.content as IChatConversationLocalContent;
        if (messageContent.type !== "text") {
            return;
        }

        const eventDispatcher: EventDispatcher = yield getContext("eventDispatcher");
        const threadId: string | undefined = yield select(threadIdSelector);

        eventDispatcher.dispatch({
            type: "chatUserMessage",
            threadId,
            question: messageContent.text,
            objects: messageContent.objects ?? [],
        });
    } else {
        if (!isUserMessage(message)) {
            return;
        }

        const messageContent = message.content.find((c) => isTextContents(c));

        if (!messageContent?.text) {
            return;
        }

        const eventDispatcher: EventDispatcher = yield getContext("eventDispatcher");
        const threadId: string | undefined = yield select(threadIdSelector);

        eventDispatcher.dispatch({
            type: "chatUserMessage",
            threadId,
            question: messageContent.text,
            objects: messageContent.objects,
        });
    }
}

function* onEvaluateMessageComplete({
    payload: { assistantMessageId },
}: ReturnType<typeof evaluateMessageCompleteAction>) {
    yield* persistMessages();

    const message: MessageInfo | null = yield call(loadMessage, assistantMessageId);

    if (!message?.useCase) {
        return;
    }

    const eventDispatcher: EventDispatcher = yield getContext("eventDispatcher");
    const threadId: string | undefined = yield select(threadIdSelector);

    eventDispatcher.dispatch({
        type: "chatAssistantMessage",
        interactionId: message.id,
        useCase: message.useCase,
        threadId,
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

type MessageInfo = {
    id: string;
    localId: string;
    useCase: GenAIChatRoutingUseCase | undefined;
};

function* loadMessage(assistantMessageId: string): Generator<unknown, MessageInfo | null> {
    const conversation: ReturnType<typeof conversationSelector> = yield select(conversationSelector);
    if (conversation) {
        const allMessages: IChatConversationLocalItem[] = yield select(conversationMessagesSelector);
        const message = allMessages.find((m) => m.localId === assistantMessageId);

        return message
            ? {
                  id: message.id,
                  localId: message.localId,
                  useCase: convertMessageTypeTo(message?.content),
              }
            : null;
    } else {
        const allMessages: Message[] = yield select(messagesSelector);
        const message = allMessages.find((m) => m.localId === assistantMessageId);
        const useCase = message?.content.find((c): c is RoutingContents => isRoutingContents(c))?.useCase;

        return message
            ? {
                  id: message.id ?? "",
                  localId: message.localId,
                  useCase,
              }
            : null;
    }
}

function convertMessageTypeTo(
    content:
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
