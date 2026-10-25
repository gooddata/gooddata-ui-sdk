// (C) 2007-2026 GoodData Corporation

import { type RunResult, expectSaga } from "redux-saga-test-plan";
import { call, put, select } from "redux-saga/effects";
import { describe, expect, it } from "vitest";

import { redo } from "../../actions/time_travel_actions.js";
import { redoPossible, reportSaving } from "../../selectors/editor_header_selector.js";
import { PostEventActionTypeKeys } from "../actions/action_types.js";
import {
    type IRedoFailedAction,
    type IRedoFinishedAction,
    type IRedoRequestedAction,
    redoFailed,
    redoFinished,
} from "../actions/redo_actions.js";
import { redoFailedEvent, redoFinishedEvent } from "../outgoing/redo_events.js";
import { SUPPORTED_COMMANDS } from "../outgoing/supported_commands_events.js";
import { availableCommandsSelector } from "../state/selectors/post_message_context_selector.js";

import { handleRedoFailed, handleRedoFinished, redoRequested } from "./redo_saga.js";

describe("redo saga", () => {
    const contextId = "contextId";
    const action: IRedoRequestedAction = {
        type: PostEventActionTypeKeys.REDO_REQUESTED,
        payload: {
            postMessageContext: {
                contextId,
            },
        },
    };
    it("should process the redo command", async () => {
        const saga: RunResult = await expectSaga(redoRequested, action)
            .provide([
                [select(redoPossible), true],
                [select(reportSaving), false],
            ])
            .run();

        expect(saga.effects.put).toEqual([put(redo()), put(redoFinished(contextId))]);
    });

    it("should dispatch redoFailed action when report in saving state", async () => {
        const saga: RunResult = await expectSaga(redoRequested, action)
            .provide([
                [select(redoPossible), true],
                [select(reportSaving), true],
            ])
            .run();

        expect(saga.effects.put).toEqual([put(redoFailed(contextId))]);
    });

    it("should dispatch redoFailed action when redo is disabled", async () => {
        const saga: RunResult = await expectSaga(redoRequested, action)
            .provide([
                [select(redoPossible), false],
                [select(reportSaving), false],
            ])
            .run();

        expect(saga.effects.put).toEqual([put(redoFailed(contextId))]);
    });

    describe("handle redoFailed event", () => {
        it("should call redoFailed event", async () => {
            const redoFailedAction: IRedoFailedAction = {
                type: PostEventActionTypeKeys.REDO_FAILED,
                payload: {
                    postMessageContext: {
                        contextId,
                    },
                },
            };
            const saga: RunResult = await expectSaga(handleRedoFailed, redoFailedAction).run();
            expect(saga.effects.call).toEqual([call(redoFailedEvent, contextId)]);
        });
    });

    describe("handle redoFinished event", () => {
        it("should call redoFinished event", async () => {
            const redoFinishedAction: IRedoFinishedAction = {
                type: PostEventActionTypeKeys.REDO_FINISHED,
                payload: {
                    postMessageContext: {
                        contextId,
                    },
                },
            };
            const saga: RunResult = await expectSaga(handleRedoFinished, redoFinishedAction)
                .provide([[select(availableCommandsSelector), SUPPORTED_COMMANDS]])
                .run();
            expect(saga.effects.call).toEqual([call(redoFinishedEvent, SUPPORTED_COMMANDS, contextId)]);
        });
    });
});
