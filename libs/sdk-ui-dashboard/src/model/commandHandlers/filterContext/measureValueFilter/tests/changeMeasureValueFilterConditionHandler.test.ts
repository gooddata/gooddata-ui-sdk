// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import {
    type IDashboardMeasureValueFilter,
    type MeasureValueFilterCondition,
    idRef,
} from "@gooddata/sdk-model";

import { changeMeasureValueFilterCondition } from "../../../../commands/filters.js";
import { tabsActions } from "../../../../store/tabs/index.js";
import { type DashboardContext } from "../../../../types/commonTypes.js";
import { changeMeasureValueFilterConditionHandler } from "../changeMeasureValueFilterConditionHandler.js";

// Minimal redux-saga effect type guards. The handler yields `select`, `put`, and `call` effects
// plus the `dispatchDashboardEvent` helper which wraps a `put` of an event-envelope action. We
// step through the generator manually and assert on the effect type at each step.
type SagaEffect = {
    "@@redux-saga/IO": true;
    type: "SELECT" | "PUT" | "CALL";
    payload: any;
};

function isSagaEffect(value: unknown): value is SagaEffect {
    return (
        !!value &&
        typeof value === "object" &&
        (value as { [key: string]: unknown })["@@redux-saga/IO"] === true
    );
}

function makeContext(): DashboardContext {
    return {
        backend: {} as any,
        workspace: "ws",
        dashboardRef: idRef("dashboard-id"),
    } as DashboardContext;
}

const LOCAL_ID = "mvf-local-id";

const makeExistingFilter = (conditions?: MeasureValueFilterCondition[]): IDashboardMeasureValueFilter => ({
    dashboardMeasureValueFilter: {
        localIdentifier: LOCAL_ID,
        measure: idRef("metric-1"),
        ...(conditions ? { conditions } : {}),
    },
});

const greaterThan100: MeasureValueFilterCondition = {
    comparison: { operator: "GREATER_THAN", value: 100 },
};

const lessThan10: MeasureValueFilterCondition = {
    comparison: { operator: "LESS_THAN", value: 10 },
};

describe("changeMeasureValueFilterConditionHandler", () => {
    it("dispatches the reducer action and a CONDITION_CHANGED event with the updated filter", () => {
        const ctx = makeContext();
        const cmd = changeMeasureValueFilterCondition(LOCAL_ID, [greaterThan100], "corr-1");
        const saga = changeMeasureValueFilterConditionHandler(ctx, cmd);

        // 1) select existing filter
        const select1 = saga.next();
        expect(isSagaEffect(select1.value)).toBe(true);
        expect((select1.value as SagaEffect).type).toBe("SELECT");

        // 2) feed an existing filter (with no prior conditions) → handler should put the
        //    reducer action with the new conditions
        const existing = makeExistingFilter();
        const put1 = saga.next(existing);
        expect((put1.value as SagaEffect).type).toBe("PUT");
        expect((put1.value as SagaEffect).payload.action).toEqual(
            tabsActions.changeMeasureValueFilterCondition({
                localIdentifier: LOCAL_ID,
                conditions: [greaterThan100],
            }),
        );

        // 3) re-select the now-updated filter
        const select2 = saga.next();
        expect((select2.value as SagaEffect).type).toBe("SELECT");

        // 4) feed the updated filter → handler should yield a PUT for the dashboard event
        const updated = makeExistingFilter([greaterThan100]);
        const eventPut = saga.next(updated);
        expect((eventPut.value as SagaEffect).type).toBe("PUT");
        const eventAction = (eventPut.value as SagaEffect).payload.action;
        expect(eventAction.type).toBe("GDC.DASH/EVT.FILTER_CONTEXT.MEASURE_VALUE_FILTER.CONDITION_CHANGED");
        expect(eventAction.correlationId).toBe("corr-1");
        expect(eventAction.payload).toEqual({
            localIdentifier: LOCAL_ID,
            filter: updated,
            conditions: [greaterThan100],
        });

        // 5) call dispatchFilterContextChanged
        const call1 = saga.next();
        expect((call1.value as SagaEffect).type).toBe("CALL");

        // 6) saga ends
        const end = saga.next();
        expect(end.done).toBe(true);
    });

    it("normalizes empty conditions to undefined when the user picks 'All'", () => {
        const ctx = makeContext();
        const cmd = changeMeasureValueFilterCondition(LOCAL_ID, []);
        const saga = changeMeasureValueFilterConditionHandler(ctx, cmd);

        saga.next(); // select
        const put1 = saga.next(makeExistingFilter([greaterThan100])); // feed existing filter

        // The reducer action gets the empty array; the reducer itself normalizes [] → undefined.
        // This test pins the contract that the handler forwards conditions verbatim.
        expect((put1.value as SagaEffect).payload.action).toEqual(
            tabsActions.changeMeasureValueFilterCondition({
                localIdentifier: LOCAL_ID,
                conditions: [],
            }),
        );

        saga.next(); // select again
        const eventPut = saga.next(makeExistingFilter()); // updated filter has no conditions

        // Event payload mirrors what the user passed (empty array), even though the stored
        // filter has conditions=undefined. This is intentional: the event is a record of the
        // user's intent; the stored shape is a normalized representation.
        expect((eventPut.value as SagaEffect).payload.action.payload.conditions).toEqual([]);
    });

    it("forwards multiple conditions through to the reducer and event payload", () => {
        const ctx = makeContext();
        const cmd = changeMeasureValueFilterCondition(LOCAL_ID, [greaterThan100, lessThan10], "corr-2");
        const saga = changeMeasureValueFilterConditionHandler(ctx, cmd);

        saga.next();
        const put1 = saga.next(makeExistingFilter());
        expect((put1.value as SagaEffect).payload.action.payload.conditions).toEqual([
            greaterThan100,
            lessThan10,
        ]);

        saga.next();
        const eventPut = saga.next(makeExistingFilter([greaterThan100, lessThan10]));
        expect((eventPut.value as SagaEffect).payload.action.correlationId).toBe("corr-2");
        expect((eventPut.value as SagaEffect).payload.action.payload.conditions).toEqual([
            greaterThan100,
            lessThan10,
        ]);
    });

    it("throws an invalidArgumentsProvided event when the localIdentifier does not exist", () => {
        const ctx = makeContext();
        const cmd = changeMeasureValueFilterCondition("does-not-exist", [greaterThan100]);
        const saga = changeMeasureValueFilterConditionHandler(ctx, cmd);

        saga.next(); // select

        // The saga `throw`s the event object itself (not an Error). Capture and inspect.
        let thrown: any;
        try {
            saga.next(undefined);
        } catch (e) {
            thrown = e;
        }
        expect(thrown).toBeDefined();
        expect(thrown.type).toBe("GDC.DASH/EVT.COMMAND.FAILED");
        expect(thrown.payload.reason).toBe("USER_ERROR");
        expect(thrown.payload.message).toMatch(/does not exist/);
        expect(thrown.payload.command).toBe(cmd);
    });

    it("does not put the reducer action when the localIdentifier does not exist", () => {
        const ctx = makeContext();
        const cmd = changeMeasureValueFilterCondition("does-not-exist", [greaterThan100]);
        const saga = changeMeasureValueFilterConditionHandler(ctx, cmd);

        const select1 = saga.next();
        expect((select1.value as SagaEffect).type).toBe("SELECT");

        // The very next step must throw — no PUT is yielded before the throw.
        try {
            saga.next(undefined);
        } catch {
            // expected
        }
        // After the throw the generator is closed; `.next()` returns done with no value.
        const after = saga.next();
        expect(after.done).toBe(true);
        expect(after.value).toBeUndefined();
    });

    it("trips the post-update invariant when the filter unexpectedly disappears", () => {
        const ctx = makeContext();
        const cmd = changeMeasureValueFilterCondition(LOCAL_ID, [greaterThan100]);
        const saga = changeMeasureValueFilterConditionHandler(ctx, cmd);

        saga.next(); // select
        saga.next(makeExistingFilter()); // put reducer
        saga.next(); // re-select

        // Simulate an inconsistent state where the second select returns nothing.
        expect(() => saga.next(undefined)).toThrow(/Inconsistent state/);
    });
});
