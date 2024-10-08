// (C) 2024 GoodData Corporation

import { IAnalyticalBackend, IChatThread, IChatThreadHistory } from "@gooddata/sdk-backend-spi";
import { PayloadAction } from "@reduxjs/toolkit";
import { Task } from "redux-saga";
import { call, cancelled, getContext, race, take, fork, delay, put, select } from "redux-saga/effects";
import {
    cancelAsyncAction,
    evaluateMessageErrorAction,
    evaluateMessagePollingAction,
    newMessageAction,
} from "../messages/messagesSlice.js";
import { processContents } from "./converters/interactionsToMessages.js";
import { AssistantMessage } from "../../model.js";
import { lastMessageIdSelector } from "../messages/messagesSelectors.js";

/**
 * Load thread history and put it to the store.
 * @internal
 */
export function* threadPolling({ payload: { message } }: PayloadAction<{ message: AssistantMessage }>) {
    // Get the last known thread id
    const lastInteractionId: number | undefined = yield select(lastMessageIdSelector);

    // Retrieve backend from context and prepare the chat thread service
    const backend: IAnalyticalBackend = yield getContext("backend");
    const workspace: string = yield getContext("workspace");
    const chatThread = backend.workspace(workspace).genAI().getChatThread();

    // Start the polling task
    const pollingTask: Task = yield fork(fetchChatHistoryPolling, message, chatThread, lastInteractionId);

    // Any of the following actions will cancel the polling
    // The loser effects will be cancelled automatically, i.e. no need to explicitly cancel polling
    yield race([
        pollingTask,
        take(cancelAsyncAction.type),
        take(evaluateMessageErrorAction.type),
        take(newMessageAction.type),
    ]);
}

function* fetchChatHistoryPolling(
    message: AssistantMessage,
    preparedChatThread: IChatThread,
    lastInteractionId?: number,
) {
    // +1 to avoid fetching the same interaction again
    const interactionId = lastInteractionId ? lastInteractionId + 1 : 0;

    // The internal loop, each iteration is a single poll
    while (true) {
        try {
            // Delay to avoid overwhelming the server
            yield delay(1000);

            // Make the server request
            const results: IChatThreadHistory = yield call(doTheCall, preparedChatThread, interactionId);

            if ((results?.interactions?.length ?? 0) > 1) {
                // Server feeds do not have stable IDs at the moment, it's hard to
                // merge the results. We have to make an assumption that a single
                // evaluation is running at a time.
                console.warn("Unexpected interactions", results);
                return;
            }

            const interaction = results?.interactions?.[0];

            if (interaction) {
                // Update the store with new content
                yield put(
                    evaluateMessagePollingAction({
                        contents: processContents(interaction),
                        interactionId: interaction.interactionId,
                        complete: interaction.interactionFinished,
                        localId: message.localId,
                    }),
                );

                if (interaction.interactionFinished) {
                    // Polling is done, exit the loop
                    return;
                }
            }
        } catch (e) {
            const isCancelled: boolean = yield cancelled();

            if (isCancelled) {
                // Polling is done, exit the loop
                return;
            }
        }
    }
}

function* doTheCall(preparedChatThread: IChatThread, nextInteraction?: number) {
    const controller = new AbortController();

    try {
        const results: IChatThreadHistory = yield call(
            preparedChatThread.loadHistory.bind(preparedChatThread),
            nextInteraction,
            { signal: controller.signal },
        );

        return results;
    } finally {
        const isCancelled: boolean = yield cancelled();

        if (isCancelled) {
            controller.abort();
        }
    }
}
