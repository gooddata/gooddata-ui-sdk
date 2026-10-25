// (C) 2007-2026 GoodData Corporation

// @vitest-environment node
import { testSaga } from "redux-saga-test-plan";
import { put } from "redux-saga/effects";
import { describe, expect, it } from "vitest";

import { applyMetricPostponedShortcut } from "../../actions/shortcuts_actions.js";
import { extendedReferencePointApplied } from "../buckets/buckets_operation_events.js";

import { dispatchPostponedAction } from "./postponed_action_sagas.js";
import { getPostponedAction } from "./postponed_action_selectors.js";

describe("dispatchPostponedAction", () => {
    it("re-puts the parked action VERBATIM — the same reference, payload included", () => {
        const action = applyMetricPostponedShortcut({ identifier: "metric.foo", type: "metric" });
        const saga = testSaga(dispatchPostponedAction);

        saga.next()
            .select(getPostponedAction)
            .next(action)
            // the commit of the reference point the replay lands on top of
            .take(extendedReferencePointApplied.type)
            .next()
            .inspect((effect: { payload: { action: unknown } }) => {
                // `.put(action)` alone is DEEP equality, which would pass just as well for a
                // rebuilt `{ type, payload }` — the very thing this change removed. Identity is
                // the contract, so assert the effect AND the reference.
                expect(effect).toEqual(put(action));
                expect(effect.payload.action).toBe(action);
            })
            .next()
            .isDone();
    });

    it("does nothing when no action is parked — and waits for nothing", () => {
        const saga = testSaga(dispatchPostponedAction);

        saga.next().select(getPostponedAction).next(undefined).isDone();
    });
});
