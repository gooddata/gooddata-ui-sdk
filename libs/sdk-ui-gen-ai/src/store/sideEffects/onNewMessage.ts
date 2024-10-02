// (C) 2024 GoodData Corporation

import { IAnalyticalBackend, IChatThread } from "@gooddata/sdk-backend-spi";
import { IGenAIChatEvaluation } from "@gooddata/sdk-model";
import { put, call, getContext, cancelled, select, race, take } from "redux-saga/effects";
import { newMessageAction } from "../messages/messagesSlice.js";
import { setAgentBusyAction, setAgentIdleAction } from "../agent/agentSlice.js";
import { isUserTextMessage, makeAssistantErrorMessage, Message, UserMessage } from "../../model.js";
import { extractError } from "./utils.js";
import { evalToMessage } from "./converters/evalToMessage.js";
import { messagesToHistory } from "./converters/messagesToHistory.js";
import { allMessagesSelector } from "../messages/messagesSelectors.js";
import { PayloadAction } from "@reduxjs/toolkit";

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

    try {
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
            .withQuestion(message.content.text)
            .withChatHistory(messagesToHistory(messages.slice(0, -1)));

        // Any new message will interrupt the evaluation
        // UI will disable the input for new messages, so it should be safe to use same channel for cancellation.
        const [results]: [IGenAIChatEvaluation, undefined] = yield race([
            call(fetchChatThreadEvaluation, preparedChatThread),
            take(newMessageAction.type),
        ]);

        if (results) {
            yield put(newMessageAction(evalToMessage(results)));
        }
    } catch (e) {
        yield put(newMessageAction(makeAssistantErrorMessage(extractError(e))));
    } finally {
        yield put(setAgentIdleAction());
    }
}

/**
 * Process new messages.
 * @internal
 */
export function* onNewMessage({ payload }: PayloadAction<Message>) {
    if (!isUserTextMessage(payload)) {
        return;
    }

    yield call(processNewMessage, payload);
}

/**
 * Process new messages from history.
 * @internal
 */
export function* onHistorySetMessage({ payload }: PayloadAction<Message[]>) {
    if (!payload.length) {
        return;
    }

    const lastMessage = payload[payload.length - 1];

    if (!isUserTextMessage(lastMessage)) {
        return;
    }

    yield call(processNewMessage, lastMessage);
}
