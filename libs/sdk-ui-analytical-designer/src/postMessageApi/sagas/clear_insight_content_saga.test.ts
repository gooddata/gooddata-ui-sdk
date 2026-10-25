// (C) 2007-2026 GoodData Corporation

import { type RunResult, expectSaga } from "redux-saga-test-plan";
import { call, put, select } from "redux-saga/effects";
import { describe, expect, it } from "vitest";

import { clearInsightContent } from "../../actions/app_context_actions.js";
import { reportSaving } from "../../selectors/editor_header_selector.js";
import { isClearInsightContentDisabledSelector } from "../../selectors/reset_button_selector.js";
import { PostEventActionTypeKeys } from "../actions/action_types.js";
import {
    type IClearInsightContentFailedAction,
    type IClearInsightContentFinishedAction,
    type IClearInsightContentRequestedAction,
    clearInsightContentFailed,
    clearInsightContentFished,
} from "../actions/clear_insight_content_actions.js";
import {
    clearInsightContentFailedEvent,
    clearInsightContentFinishedEvent,
} from "../outgoing/clear_insight_content_events.js";
import { SUPPORTED_COMMANDS } from "../outgoing/supported_commands_events.js";
import { availableCommandsSelector } from "../state/selectors/post_message_context_selector.js";

import {
    clearInsightContentRequested,
    handleClearInsightContentFailed,
    handleClearInsightContentFinished,
} from "./clear_insight_content_saga.js";

describe("clear insight content saga", () => {
    const contextId = "contextId";
    const action: IClearInsightContentRequestedAction = {
        type: PostEventActionTypeKeys.CLEAR_INSIGHT_CONTENT_REQUESTED,
        payload: {
            postMessageContext: {
                contextId,
            },
        },
    };
    it("should clear insight editor", async () => {
        const saga: RunResult = await expectSaga(clearInsightContentRequested, action)
            .provide([
                [select(isClearInsightContentDisabledSelector), false],
                [select(reportSaving), false],
                [select(availableCommandsSelector), SUPPORTED_COMMANDS],
            ])
            .run();

        expect(saga.effects.put).toEqual([
            put(clearInsightContent()),
            put(clearInsightContentFished(contextId)),
        ]);
    });

    it("should call clearFailed when report in saving state", async () => {
        const saga: RunResult = await expectSaga(clearInsightContentRequested, action)
            .provide([
                [select(isClearInsightContentDisabledSelector), false],
                [select(reportSaving), true],
            ])
            .run();

        expect(saga.effects.put).toEqual([put(clearInsightContentFailed(contextId))]);
    });

    it("should call clearFailed when clear is disabled", async () => {
        const saga: RunResult = await expectSaga(clearInsightContentRequested, action)
            .provide([
                [select(isClearInsightContentDisabledSelector), true],
                [select(reportSaving), false],
            ])
            .run();

        expect(saga.effects.put).toEqual([put(clearInsightContentFailed(contextId))]);
    });

    describe("handle clearInsightContentFailed action", () => {
        it("should call clearFailed event", async () => {
            const clearFailedAction: IClearInsightContentFailedAction = {
                type: PostEventActionTypeKeys.CLEAR_INSIGHT_CONTENT_FAILED,
                payload: {
                    postMessageContext: {
                        contextId,
                    },
                },
            };
            const saga: RunResult = await expectSaga(
                handleClearInsightContentFailed,
                clearFailedAction,
            ).run();
            expect(saga.effects.call).toEqual([call(clearInsightContentFailedEvent, contextId)]);
        });
    });

    describe("handle clearInsightContentFinished action", () => {
        it("should call clearFinished event", async () => {
            const clearFinishedAction: IClearInsightContentFinishedAction = {
                type: PostEventActionTypeKeys.CLEAR_INSIGHT_CONTENT_FINISHED,
                payload: {
                    postMessageContext: {
                        contextId,
                    },
                },
            };
            const saga: RunResult = await expectSaga(handleClearInsightContentFinished, clearFinishedAction)
                .provide([[select(availableCommandsSelector), SUPPORTED_COMMANDS]])
                .run();
            expect(saga.effects.call).toEqual([
                call(clearInsightContentFinishedEvent, SUPPORTED_COMMANDS, contextId),
            ]);
        });
    });
});
