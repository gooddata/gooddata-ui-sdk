// (C) 2020-2026 GoodData Corporation

import { type RunResult, expectSaga } from "redux-saga-test-plan";
import { call, put, select } from "redux-saga/effects";
import { describe, expect, it } from "vitest";

import { undo } from "../../actions/time_travel_actions.js";
import { reportSaving, undoPossible } from "../../selectors/editor_header_selector.js";
import { PostEventActionTypeKeys } from "../actions/action_types.js";
import {
    type IUndoFailedAction,
    type IUndoFinishedAction,
    type IUndoRequestedAction,
    undoFailed,
    undoFinished,
} from "../actions/undo_actions.js";
import { SUPPORTED_COMMANDS } from "../outgoing/supported_commands_events.js";
import { undoFailedEvent, undoFinishedEvent } from "../outgoing/undo_events.js";
import { availableCommandsSelector } from "../state/selectors/post_message_context_selector.js";

import { handleUndoFailed, handleUndoFinished, undoRequested } from "./undo_saga.js";

describe("undo saga", () => {
    const contextId = "contextId";
    const action: IUndoRequestedAction = {
        type: PostEventActionTypeKeys.UNDO_REQUESTED,
        payload: {
            postMessageContext: {
                contextId,
            },
        },
    };
    it("should process the undo command", async () => {
        const saga: RunResult = await expectSaga(undoRequested, action)
            .provide([
                [select(undoPossible), true],
                [select(reportSaving), false],
            ])
            .run();

        expect(saga.effects.put).toEqual([put(undo()), put(undoFinished(contextId))]);
    });

    it("should dispatch undoFailed action when report in saving state", async () => {
        const saga: RunResult = await expectSaga(undoRequested, action)
            .provide([
                [select(undoPossible), true],
                [select(reportSaving), true],
            ])
            .run();

        expect(saga.effects.put).toEqual([put(undoFailed(contextId))]);
    });

    it("should dispatch undoFailed action when undo is disabled", async () => {
        const saga: RunResult = await expectSaga(undoRequested, action)
            .provide([
                [select(undoPossible), false],
                [select(reportSaving), false],
            ])
            .run();

        expect(saga.effects.put).toEqual([put(undoFailed(contextId))]);
    });

    describe("handle undoFailed event", () => {
        it("should call undoFailed event", async () => {
            const undoFailedAction: IUndoFailedAction = {
                type: PostEventActionTypeKeys.UNDO_FAILED,
                payload: {
                    postMessageContext: {
                        contextId,
                    },
                },
            };
            const saga: RunResult = await expectSaga(handleUndoFailed, undoFailedAction).run();
            expect(saga.effects.call).toEqual([call(undoFailedEvent, contextId)]);
        });
    });

    describe("handle undoFinished event", () => {
        it("should call undoFinished event", async () => {
            const undoFinishedAction: IUndoFinishedAction = {
                type: PostEventActionTypeKeys.UNDO_FINISHED,
                payload: {
                    postMessageContext: {
                        contextId,
                    },
                },
            };
            const saga: RunResult = await expectSaga(handleUndoFinished, undoFinishedAction)
                .provide([[select(availableCommandsSelector), SUPPORTED_COMMANDS]])
                .run();
            expect(saga.effects.call).toEqual([call(undoFinishedEvent, SUPPORTED_COMMANDS, contextId)]);
        });
    });
});
