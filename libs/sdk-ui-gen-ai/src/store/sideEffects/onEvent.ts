// (C) 2024 GoodData Corporation

import { getContext, select, takeEvery } from "redux-saga/effects";
import { setOpenAction } from "../chatWindow/chatWindowSlice.js";
import {
    clearThreadAction,
    newMessageAction,
    evaluateMessageCompleteAction,
    setUserFeedback,
    loadThreadSuccessAction,
} from "../messages/messagesSlice.js";
import { EventDispatcher } from "../events.js";
import { isRoutingContents, isTextContents, isUserMessage, Message, RoutingContents } from "../../model.js";
import { messagesSelector, threadIdSelector } from "../messages/messagesSelectors.js";

export function* onEvent() {
    yield takeEvery(setOpenAction.type, onSetOpen);
    yield takeEvery(loadThreadSuccessAction.type, onThreadLoaded);
    yield takeEvery(clearThreadAction.type, onClearThread);
    yield takeEvery(newMessageAction.type, onNewMessage);
    yield takeEvery(evaluateMessageCompleteAction.type, onEvaluateMessageComplete);
    yield takeEvery(setUserFeedback.type, onUserFeedback);
}

function* onSetOpen({ payload: { isOpen } }: ReturnType<typeof setOpenAction>) {
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

function* onThreadLoaded({ payload: { threadId } }: ReturnType<typeof loadThreadSuccessAction>) {
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

function* onNewMessage({ payload: message }: ReturnType<typeof newMessageAction>) {
    if (!isUserMessage(message)) {
        return;
    }

    const question = message.content.find((c) => isTextContents(c))?.text;

    if (!question) {
        return;
    }

    const eventDispatcher: EventDispatcher = yield getContext("eventDispatcher");
    const threadId: string | undefined = yield select(threadIdSelector);

    eventDispatcher.dispatch({
        type: "chatUserMessage",
        threadId,
        question,
    });
}

function* onEvaluateMessageComplete({
    payload: { assistantMessageId },
}: ReturnType<typeof evaluateMessageCompleteAction>) {
    const allMessages: Message[] = yield select(messagesSelector);
    const assistantMessage = allMessages.find((m) => m.localId === assistantMessageId);

    if (!assistantMessage) {
        return;
    }

    const useCase = assistantMessage.content.find((c): c is RoutingContents => isRoutingContents(c))?.useCase;

    if (!useCase) {
        return;
    }

    const eventDispatcher: EventDispatcher = yield getContext("eventDispatcher");
    const threadId: string | undefined = yield select(threadIdSelector);

    eventDispatcher.dispatch({
        type: "chatAssistantMessage",
        interactionId: assistantMessage.id,
        threadId,
        useCase,
    });
}

function* onUserFeedback({ payload: { assistantMessageId, feedback } }: ReturnType<typeof setUserFeedback>) {
    const allMessages: Message[] = yield select(messagesSelector);
    const assistantMessage = allMessages.find((m) => m.localId === assistantMessageId);

    if (!assistantMessage) {
        return;
    }

    const eventDispatcher: EventDispatcher = yield getContext("eventDispatcher");
    const threadId: string | undefined = yield select(threadIdSelector);

    eventDispatcher.dispatch({
        type: "chatFeedback",
        interactionId: assistantMessage.id,
        threadId,
        feedback,
    });
}
