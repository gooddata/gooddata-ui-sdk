// (C) 2024 GoodData Corporation

import { put, delay, call } from "redux-saga/effects";
import { newMessageAction } from "../messages/messagesSlice.js";
import { setAgentBusyAction, setAgentIdleAction } from "../agent/agentSlice.js";
import { makeAssistantMessage, Message } from "../../model.js";
import { PayloadAction } from "@reduxjs/toolkit";

function* processNewMessage(message: Message) {
    yield put(setAgentBusyAction());
    console.warn("NOT IMPLEMENTED. Simulating sending a message to the server...", message.content);
    yield delay(5000);
    yield put(setAgentIdleAction());
    yield put(newMessageAction(makeAssistantMessage("This is a dummy response to the user message.")));
}

/**
 * Process new messages.
 * @internal
 */
export function* onNewMessage({ payload }: PayloadAction<Message>) {
    if (payload.role === "user") {
        yield call(processNewMessage, payload);
    }
}

export function* onHistorySetMessage({ payload }: PayloadAction<Message[]>) {
    // If the last message in the history is from the user, process it as a new message right away
    if (payload.length > 0 && payload[payload.length - 1].role === "user") {
        yield call(processNewMessage, payload[payload.length - 1]);
    }
}
