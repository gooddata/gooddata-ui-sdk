// (C) 2020-2026 GoodData Corporation

// @vitest-environment node

import { type RunResult, expectSaga } from "redux-saga-test-plan";
import { call } from "redux-saga/effects";
import { describe, expect, it } from "vitest";

import { GdcAdCommandType } from "@gooddata/sdk-embedding";

import { hostVerificationFailed, insecureCommandFailed } from "../actions/command_error_actions.js";
import {
    hostDomainVerificationFailedEvent,
    insecureCommandFailedEvent,
} from "../outgoing/command_error_events.js";

import { watchInsecureCommand } from "./command_error_saga.js";

describe("command error saga", () => {
    it("should call insecureCommandFailedEvent", async () => {
        const contextId = "contextId";
        const saga: RunResult = await expectSaga(watchInsecureCommand)
            .dispatch(insecureCommandFailed(GdcAdCommandType.Save, contextId))
            .silentRun();
        expect(saga.effects.call).toEqual([
            call(insecureCommandFailedEvent, GdcAdCommandType.Save, contextId),
        ]);
    });

    it("should call handleHostVerificationFailed", async () => {
        const contextId = "contextId";
        const saga: RunResult = await expectSaga(watchInsecureCommand)
            .dispatch(hostVerificationFailed(contextId))
            .silentRun();
        expect(saga.effects.call).toEqual([call(hostDomainVerificationFailedEvent, contextId)]);
    });
});
