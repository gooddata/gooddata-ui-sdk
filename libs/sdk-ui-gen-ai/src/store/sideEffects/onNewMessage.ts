// (C) 2024 GoodData Corporation

import { PayloadAction } from "@reduxjs/toolkit";
import { IAnalyticalBackend, IChatThread } from "@gooddata/sdk-backend-spi";
import { IGenAIChatEvaluation } from "@gooddata/sdk-model";
import { put, call, getContext, cancelled, select } from "redux-saga/effects";
import { newMessageAction } from "../messages/messagesSlice.js";
import { setAgentBusyAction, setAgentIdleAction } from "../agent/agentSlice.js";
import { isUserMessage, makeAssistantErrorMessage, Message, UserMessage } from "../../model.js";
import { extractError } from "./utils.js";
import { evalToMessage } from "./converters/evalToMessage.js";
import { messagesToHistory } from "./converters/messagesToHistory.js";
import { allMessagesSelector } from "../messages/messagesSelectors.js";

function* fetchChatThreadEvaluation(preparedChatThread: IChatThread) {
    const controller = new AbortController();
    try {
        const results: IGenAIChatEvaluation = yield call(preparedChatThread.query.bind(preparedChatThread), {
            signal: controller.signal,
        });

        return results;
    } finally {
        const wasCancelled: boolean = yield cancelled();

        if (wasCancelled) {
            controller.abort();
        }
    }
}

function* processNewMessage(message: UserMessage) {
    yield put(setAgentBusyAction());

    // Retrieve messages history
    const messages: Message[] = yield select(allMessagesSelector);

    // Retrieve backend from context
    const backend: IAnalyticalBackend = yield getContext("backend");
    const workspace: string = yield getContext("workspace");

    // Prepare the thread for server
    const preparedChatThread = backend
        .workspace(workspace)
        .genAI()
        .getChatThread()
        .withQuestion(message.content)
        .withChatHistory(messagesToHistory(messages.slice(0, -1)));

    let results: IGenAIChatEvaluation;
    try {
        results = yield call(fetchChatThreadEvaluation, preparedChatThread);
    } catch (e) {
        yield put(newMessageAction(makeAssistantErrorMessage(extractError(e))));
        yield put(setAgentIdleAction());
        return;
    }

    yield put(setAgentIdleAction());

    if (results) {
        yield put(newMessageAction(evalToMessage(results)));
    }
}

/**
 * Process new messages.
 * @internal
 */
export function* onNewMessage({ payload }: PayloadAction<Message>) {
    if (isUserMessage(payload)) {
        yield call(processNewMessage, payload);
    }
}

export function* onHistorySetMessage({ payload }: PayloadAction<Message[]>) {
    if (!payload.length) return;

    const lastMessage = payload[payload.length - 1];
    // If the last message in the history is from the user, process it as a new message right away
    if (isUserMessage(lastMessage)) {
        yield call(processNewMessage, lastMessage);
    }
}
