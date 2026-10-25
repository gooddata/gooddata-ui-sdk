// (C) 2026 GoodData Corporation

// @vitest-environment node

import { expectSaga } from "redux-saga-test-plan";
import { select } from "redux-saga/effects";
import { describe, expect, it } from "vitest";

import { reportExecutionFinished } from "../../actions/report_actions.js";

import { currentReportExecutionSettled } from "./execution_coordination_events.js";
import { onReportExecutionFinished } from "./execution_coordination_saga.js";
import { getExecutionState } from "./execution_selectors.js";
import { executionInitialState } from "./execution_state.js";

/**
 * Closing `report.nowOpen` for the CURRENT execution goes through a coordination event. The id guard
 * is the pin: a superseded result must emit NOTHING. The nowOpen slice's consumption is pinned in
 * reducers/test/execute_report_characterization.test.ts through the real chain.
 */
describe("execution coordination", () => {
    const finished = (id: string) => reportExecutionFinished({ status: "OK" }, id, 100, 200);

    it("emits the settled event when the finished result belongs to the current execution", async () => {
        const saga = await expectSaga(onReportExecutionFinished, finished("exec-1"))
            .provide([[select(getExecutionState), { ...executionInitialState, id: "exec-1" }]])
            .put(currentReportExecutionSettled())
            .silentRun(0);

        // `effects.put` holds only the UNASSERTED puts — nothing beyond the settled event fired
        expect(saga.effects.put).toBeUndefined();
    });

    it("emits NOTHING for a superseded execution", async () => {
        const saga = await expectSaga(onReportExecutionFinished, finished("exec-stale"))
            .provide([[select(getExecutionState), { ...executionInitialState, id: "exec-current" }]])
            .silentRun(0);

        expect(saga.effects.put).toBeUndefined();
    });
});
