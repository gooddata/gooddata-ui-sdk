// (C) 2007-2026 GoodData Corporation

import { type RunResult, expectSaga } from "redux-saga-test-plan";
import { call, put, select } from "redux-saga/effects";
import { describe, expect, it } from "vitest";

import { resetApplication } from "../../actions/app_context_actions.js";
import { reportSaving } from "../../selectors/editor_header_selector.js";
import { isResetDisabledSelector } from "../../selectors/reset_button_selector.js";
import { PostEventActionTypeKeys } from "../actions/action_types.js";
import {
    type IClearInsightFailedAction,
    type IClearInsightFinishedAction,
    type IClearInsightRequestedAction,
    clearInsightFailed,
    clearInsightFished,
} from "../actions/clear_insight_actions.js";
import { clearFailedEvent, clearFinishedEvent } from "../outgoing/clear_insight_events.js";
import { SUPPORTED_COMMANDS } from "../outgoing/supported_commands_events.js";
import { availableCommandsSelector } from "../state/selectors/post_message_context_selector.js";

import {
    clearInsightRequested,
    handleClearInsightFailed,
    handleClearInsightFinished,
} from "./clear_insight_saga.js";

describe("clear saga", () => {
    const contextId = "contextId";
    const action: IClearInsightRequestedAction = {
        type: PostEventActionTypeKeys.CLEAR_INSIGHT_REQUESTED,
        payload: {
            postMessageContext: {
                contextId,
            },
        },
    };
    it("should clear insight editor", async () => {
        const saga: RunResult = await expectSaga(clearInsightRequested, action)
            .provide([
                [select(isResetDisabledSelector), false],
                [select(reportSaving), false],
                [select(availableCommandsSelector), SUPPORTED_COMMANDS],
            ])
            .run();

        expect(saga.effects.put).toEqual([put(resetApplication()), put(clearInsightFished(contextId))]);
    });

    it("should call clearFailed when report in saving state", async () => {
        const saga: RunResult = await expectSaga(clearInsightRequested, action)
            .provide([
                [select(isResetDisabledSelector), false],
                [select(reportSaving), true],
            ])
            .run();

        expect(saga.effects.put).toEqual([put(clearInsightFailed(contextId))]);
    });

    it("should call clearFailed when clear is disabled", async () => {
        const saga: RunResult = await expectSaga(clearInsightRequested, action)
            .provide([
                [select(isResetDisabledSelector), true],
                [select(reportSaving), false],
            ])
            .run();

        expect(saga.effects.put).toEqual([put(clearInsightFailed(contextId))]);
    });

    describe("handle clearInsightFailed action", () => {
        it("should call clearFailed event", async () => {
            const clearFailedAction: IClearInsightFailedAction = {
                type: PostEventActionTypeKeys.CLEAR_INSIGHT_FAILED,
                payload: {
                    postMessageContext: {
                        contextId,
                    },
                },
            };
            const saga: RunResult = await expectSaga(handleClearInsightFailed, clearFailedAction).run();
            expect(saga.effects.call).toEqual([call(clearFailedEvent, contextId)]);
        });
    });

    describe("handle clearInsightFinished action", () => {
        it("should call clearFinished event", async () => {
            const clearFinishedAction: IClearInsightFinishedAction = {
                type: PostEventActionTypeKeys.CLEAR_INSIGHT_FINISHED,
                payload: {
                    postMessageContext: {
                        contextId,
                    },
                },
            };
            const saga: RunResult = await expectSaga(handleClearInsightFinished, clearFinishedAction)
                .provide([[select(availableCommandsSelector), SUPPORTED_COMMANDS]])
                .run();
            expect(saga.effects.call).toEqual([call(clearFinishedEvent, SUPPORTED_COMMANDS, contextId)]);
        });
    });
});
