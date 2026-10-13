// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import {
    type IDashboardMeasureValueFilter,
    type MeasureValueFilterCondition,
    idRef,
} from "@gooddata/sdk-model";

import {
    changeMeasureValueFilterCondition,
    changeWorkingMeasureValueFilterCondition,
} from "../../../commands/filters.js";
import { tabsActions } from "../../../store/tabs/index.js";
import { type DashboardContext } from "../../../types/commonTypes.js";

import { changeMeasureValueFilterConditionHandler } from "./changeMeasureValueFilterConditionHandler.js";

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

// The handler snapshots every tab's filter context before the write so a mirrored change can
// emit one event per updated tab. Stepping the generator sees that capture as a CALL.
function resumePastFilterContextSnapshot(saga: Generator, flag: boolean): IteratorResult<unknown> {
    const capture = saga.next(flag);
    expect(isSagaEffect(capture.value)).toBe(true);
    expect((capture.value as SagaEffect).type).toBe("CALL");
    return saga.next({ filterContexts: {}, attributeFilterConfigs: {} });
}

function makeContext(): DashboardContext {
    return {
        backend: {} as any,
        workspace: "ws",
        dashboardRef: idRef("dashboard-id"),
    } as DashboardContext;
}

const LOCAL_ID = "mvf-local-id";
const ENABLE_PERSISTENT_FILTERS_ACROSS_TABS = false;

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

        // 2) feed an existing filter (with no prior conditions) → handler selects the
        //    persistent-filters flag before dispatching
        const existing = makeExistingFilter();
        const selectFlag = saga.next(existing);
        expect((selectFlag.value as SagaEffect).type).toBe("SELECT");

        // 3) feed the flag → handler snapshots filter contexts, then puts the reducer action with the new conditions
        const put1 = resumePastFilterContextSnapshot(saga, ENABLE_PERSISTENT_FILTERS_ACROSS_TABS);
        expect((put1.value as SagaEffect).type).toBe("PUT");
        expect((put1.value as SagaEffect).payload.action).toEqual(
            tabsActions.changeMeasureValueFilterCondition({
                localIdentifier: LOCAL_ID,
                conditions: [greaterThan100],
                enablePersistentFiltersAcrossTabs: ENABLE_PERSISTENT_FILTERS_ACROSS_TABS,
            }),
        );

        // 4) re-select the now-updated filter
        const select2 = saga.next();
        expect((select2.value as SagaEffect).type).toBe("SELECT");

        // 5) feed the updated filter → handler should yield a PUT for the dashboard event
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

        // 6) call dispatchFilterContextChanged
        const call1 = saga.next();
        expect((call1.value as SagaEffect).type).toBe("CALL");

        // 7) saga ends
        const end = saga.next();
        expect(end.done).toBe(true);
    });

    it("normalizes empty conditions to undefined when the user picks 'All'", () => {
        const ctx = makeContext();
        const cmd = changeMeasureValueFilterCondition(LOCAL_ID, []);
        const saga = changeMeasureValueFilterConditionHandler(ctx, cmd);

        saga.next(); // select existing filter
        const selectFlag = saga.next(makeExistingFilter([greaterThan100]));
        expect((selectFlag.value as SagaEffect).type).toBe("SELECT");
        const put1 = resumePastFilterContextSnapshot(saga, ENABLE_PERSISTENT_FILTERS_ACROSS_TABS);

        // The reducer action gets the empty array; the reducer itself normalizes [] → undefined.
        // This test pins the contract that the handler forwards conditions verbatim.
        expect((put1.value as SagaEffect).payload.action).toEqual(
            tabsActions.changeMeasureValueFilterCondition({
                localIdentifier: LOCAL_ID,
                conditions: [],
                enablePersistentFiltersAcrossTabs: ENABLE_PERSISTENT_FILTERS_ACROSS_TABS,
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
        saga.next(makeExistingFilter()); // select persistent-filters flag
        const put1 = resumePastFilterContextSnapshot(saga, ENABLE_PERSISTENT_FILTERS_ACROSS_TABS);
        expect((put1.value as SagaEffect).payload.action.payload.conditions).toEqual([
            greaterThan100,
            lessThan10,
        ]);
        expect((put1.value as SagaEffect).payload.action.payload.enablePersistentFiltersAcrossTabs).toBe(
            ENABLE_PERSISTENT_FILTERS_ACROSS_TABS,
        );

        saga.next();
        const eventPut = saga.next(makeExistingFilter([greaterThan100, lessThan10]));
        expect((eventPut.value as SagaEffect).payload.action.correlationId).toBe("corr-2");
        expect((eventPut.value as SagaEffect).payload.action.payload.conditions).toEqual([
            greaterThan100,
            lessThan10,
        ]);
    });

    it("forwards working condition changes through to the reducer and event payload", () => {
        const ctx = makeContext();
        const cmd = changeWorkingMeasureValueFilterCondition(LOCAL_ID, [greaterThan100], "corr-working");
        const saga = changeMeasureValueFilterConditionHandler(ctx, cmd);

        saga.next(); // select existing applied filter
        saga.next(makeExistingFilter()); // select persistent-filters flag
        const put1 = resumePastFilterContextSnapshot(saga, ENABLE_PERSISTENT_FILTERS_ACROSS_TABS);

        expect((put1.value as SagaEffect).payload.action).toEqual(
            tabsActions.changeMeasureValueFilterCondition({
                localIdentifier: LOCAL_ID,
                conditions: [greaterThan100],
                isWorkingSelectionChange: true,
                enablePersistentFiltersAcrossTabs: ENABLE_PERSISTENT_FILTERS_ACROSS_TABS,
            }),
        );

        saga.next(); // select updated working filter
        const eventPut = saga.next(makeExistingFilter([greaterThan100]));
        const eventAction = (eventPut.value as SagaEffect).payload.action;

        expect(eventAction.type).toBe("GDC.DASH/EVT.FILTER_CONTEXT.MEASURE_VALUE_FILTER.CONDITION_CHANGED");
        expect(eventAction.correlationId).toBe("corr-working");
        expect(eventAction.payload.filter).toEqual(makeExistingFilter([greaterThan100]));
    });

    it("throws an invalidArgumentsProvided event when the localIdentifier does not exist", () => {
        const ctx = makeContext();
        const cmd = changeMeasureValueFilterCondition("does-not-exist", [greaterThan100]);
        const saga = changeMeasureValueFilterConditionHandler(ctx, cmd);

        saga.next(); // select existing filter
        const selectFlag = saga.next(undefined);
        expect((selectFlag.value as SagaEffect).type).toBe("SELECT");

        // The missing filter is only rejected after the flag select resolves. The saga
        // `throw`s the event object itself (not an Error). Capture and inspect.
        let thrown: any;
        try {
            resumePastFilterContextSnapshot(saga, ENABLE_PERSISTENT_FILTERS_ACROSS_TABS);
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

        const selectFlag = saga.next(undefined);
        expect((selectFlag.value as SagaEffect).type).toBe("SELECT");

        // Resolving the flag select must throw — no PUT is yielded before the throw.
        try {
            resumePastFilterContextSnapshot(saga, ENABLE_PERSISTENT_FILTERS_ACROSS_TABS);
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

        saga.next(); // select existing filter
        saga.next(makeExistingFilter()); // select persistent-filters flag
        resumePastFilterContextSnapshot(saga, ENABLE_PERSISTENT_FILTERS_ACROSS_TABS);
        saga.next(); // re-select

        // Simulate an inconsistent state where the updated-filter select returns nothing.
        expect(() => saga.next(undefined)).toThrow(/Inconsistent state/);
    });
});
