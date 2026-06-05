// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { type IExecutionFactory, type IPreparedExecution } from "@gooddata/sdk-backend-spi";
import { idRef, newDefForItems, newMeasure } from "@gooddata/sdk-model";

import { buildTooltipExecution } from "../tooltipExecution.js";

// buildTooltipExecution only touches the factory once it has external refs to
// fetch; for the null path the factory is never called. This minimal chainable
// stub is enough for the control case — we only assert on the returned plan,
// not on a real execution. The cast-through-unknown mirrors the SDK type
// boundary pattern used by the sibling tests in this folder.
function fakeExecutionFactory(): IExecutionFactory {
    const prepared = {
        withDimensions: () => prepared,
        withExecConfig: () => prepared,
        fingerprint: () => "tt-fp",
    } as unknown as IPreparedExecution;
    return { forItems: () => prepared } as unknown as IExecutionFactory;
}

// Chart with two in-chart metrics, by identifier ref (so getChartMetricIds picks
// them up). Mirrors F1-2510's insight: a bar chart whose tooltip references its
// own measures.
const chartDef = newDefForItems("ws", [
    newMeasure(idRef("customers", "measure"), (m) => m.localId("m_customers")),
    newMeasure(idRef("returns", "measure"), (m) => m.localId("m_returns")),
]);

describe("buildTooltipExecution (WS3 premise: in-chart refs fire no secondary fetch)", () => {
    it("returns null when every referenced metric is already in the chart", () => {
        // This is *why* F1-2510's insight produced no `tt_` execution: in-chart
        // metrics are excluded from the secondary fetch on the assumption they
        // resolve from drill data. The multi-series gap (see the charts
        // referenceResolver tests) is therefore the operative defect — not a
        // failed or empty external fetch.
        const execution = buildTooltipExecution(
            fakeExecutionFactory(),
            chartDef,
            "Customers {metric/customers} / Returns {metric/returns}",
        );
        expect(execution).toBeNull();
    });

    it("builds an execution only for references not already in the chart (control)", () => {
        const execution = buildTooltipExecution(
            fakeExecutionFactory(),
            chartDef,
            "External {metric/orders_total}",
        );
        expect(execution).not.toBeNull();
        expect(execution?.batch.meta.measureIdMap).toEqual({ tt_m_0: "orders_total" });
        // One external reference → one per-reference fallback bundle (built lazily).
        expect(execution?.perRef()).toHaveLength(1);
    });
});
