// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IWidget, idRef, serializeObjRef } from "@gooddata/sdk-model";

import { DRILL_MODAL_EXECUTION_PSEUDO_REF } from "../constants.js";
import { selectHasAnyExecutionResultLimitBreaks } from "../executionResultsSelectors.js";
import { type IExecutionResultEnvelope } from "../types.js";

// Test the selector's combiner directly so we don't have to build the full dashboard layout state.
const computeHasLimitBreaks = (
    selectHasAnyExecutionResultLimitBreaks as unknown as {
        resultFunc: (
            executionResults: Record<string, IExecutionResultEnvelope | undefined>,
            widgets: IWidget[],
        ) => boolean;
    }
).resultFunc;

function widgetWithRef(id: string): IWidget {
    return { ref: idRef(id) } as IWidget;
}

function entitiesOf(envelopes: IExecutionResultEnvelope[]): Record<string, IExecutionResultEnvelope> {
    return Object.fromEntries(envelopes.map((e) => [e.id, e]));
}

const limitBreak = { limitType: "rowCount", limit: 1000, value: 1500 } as const;

describe("selectHasAnyExecutionResultLimitBreaks", () => {
    const widgetA = widgetWithRef("widget-a");
    const widgetB = widgetWithRef("widget-b");

    it("returns false when there are no execution results", () => {
        expect(computeHasLimitBreaks({}, [widgetA, widgetB])).toBe(false);
    });

    it("returns false when no widget has limit breaks", () => {
        const entities = entitiesOf([
            { id: serializeObjRef(widgetA.ref), isLoading: false },
            { id: serializeObjRef(widgetB.ref), isLoading: false, limitBreaks: [] },
        ]);
        expect(computeHasLimitBreaks(entities, [widgetA, widgetB])).toBe(false);
    });

    it("returns true when a widget still on the dashboard has a limit break", () => {
        const entities = entitiesOf([
            { id: serializeObjRef(widgetA.ref), isLoading: false },
            { id: serializeObjRef(widgetB.ref), isLoading: false, limitBreaks: [limitBreak] },
        ]);
        expect(computeHasLimitBreaks(entities, [widgetA, widgetB])).toBe(true);
    });

    it("ignores limit breaks of widgets no longer on the dashboard layout", () => {
        const removed = widgetWithRef("removed-widget");
        const entities = entitiesOf([
            { id: serializeObjRef(removed.ref), isLoading: false, limitBreaks: [limitBreak] },
        ]);
        // Only widgetA is still on the layout; the removed widget's stale entry must be ignored.
        expect(computeHasLimitBreaks(entities, [widgetA])).toBe(false);
    });

    it("ignores the drill dialog's execution result", () => {
        const entities = entitiesOf([
            {
                id: serializeObjRef(DRILL_MODAL_EXECUTION_PSEUDO_REF),
                isLoading: false,
                limitBreaks: [limitBreak],
            },
        ]);
        expect(computeHasLimitBreaks(entities, [widgetA])).toBe(false);
    });
});
