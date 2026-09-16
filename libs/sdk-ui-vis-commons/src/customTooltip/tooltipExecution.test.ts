// (C) 2026 GoodData Corporation

// @vitest-environment node

import { describe, expect, it } from "vitest";

import { type IExecutionFactory, type IPreparedExecution } from "@gooddata/sdk-backend-spi";
import { idRef, newAttribute, newDefForItems, newMeasure } from "@gooddata/sdk-model";

import { buildTooltipExecution } from "./tooltipExecution.js";

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

    it("returns null when the referenced computed attribute is already in the chart", () => {
        // A computed attribute's own ref sits on the display form slot, so it is found among the
        // chart's label ids just like a display form would be.
        const execution = buildTooltipExecution(
            fakeExecutionFactory(),
            newDefForItems("ws", [
                newAttribute(idRef("tier", "computedAttribute"), (a) => a.localId("a_tier")),
            ]),
            "Tier {computed_attribute/tier}",
        );
        expect(execution).toBeNull();
    });

    it("fetches an external computed attribute as a max+count pair, like a label", () => {
        const execution = buildTooltipExecution(
            fakeExecutionFactory(),
            chartDef,
            "Tier {computed_attribute/tier}",
        );
        expect(execution).not.toBeNull();
        // published under its own namespace, not the label one
        expect(execution?.batch.meta.attributeKeyMap).toEqual({ tt_lv_0: "computed_attribute/tier" });
        expect(execution?.batch.meta.labelCountMap).toEqual({
            tt_lv_0: "tt_lc_0",
        });
    });

    it("fetches a repeated computed attribute reference once", () => {
        const execution = buildTooltipExecution(
            fakeExecutionFactory(),
            chartDef,
            "{computed_attribute/tier} and {Computed_Attribute/tier}",
        );
        expect(execution?.batch.meta.attributeKeyMap).toEqual({ tt_lv_0: "computed_attribute/tier" });
    });

    it("keeps a label and a computed attribute of the same id apart when both are fetched", () => {
        // Ids are unique only within an object type, so `tier` can name both. Under one shared
        // namespace the second value would overwrite the first and one reference would silently
        // render the other's value.
        const execution = buildTooltipExecution(
            fakeExecutionFactory(),
            chartDef,
            "{label/tier} vs {computed_attribute/tier}",
        );
        expect(execution?.batch.meta.attributeKeyMap).toEqual({
            tt_lv_0: "label/tier",
            tt_lv_1: "computed_attribute/tier",
        });
    });

    it("does not treat a computed attribute as in-chart because a label of that id is in the chart", () => {
        // Both sit on the display form slot, so without a per-type split the reference would be
        // classified as already resolvable and answered by the label's value.
        const withLabel = newDefForItems("ws", [
            newAttribute(idRef("tier", "displayForm"), (a) => a.localId("a_tier")),
        ]);
        const execution = buildTooltipExecution(
            fakeExecutionFactory(),
            withLabel,
            "Tier {computed_attribute/tier}",
        );
        expect(execution?.batch.meta.attributeKeyMap).toEqual({ tt_lv_0: "computed_attribute/tier" });
    });

    it("does not treat a label as in-chart because a computed attribute of that id is in the chart", () => {
        const withComputedAttribute = newDefForItems("ws", [
            newAttribute(idRef("tier", "computedAttribute"), (a) => a.localId("a_tier")),
        ]);
        const execution = buildTooltipExecution(
            fakeExecutionFactory(),
            withComputedAttribute,
            "Tier {label/tier}",
        );
        expect(execution?.batch.meta.attributeKeyMap).toEqual({ tt_lv_0: "label/tier" });
    });

    it("builds an execution only for references not already in the chart (control)", () => {
        const execution = buildTooltipExecution(
            fakeExecutionFactory(),
            chartDef,
            "External {metric/orders_total}",
        );
        expect(execution).not.toBeNull();
        expect(execution?.batch.meta.measureIdMap).toEqual({
            tt_m_0: "orders_total",
        });
        // One external reference → one per-reference fallback bundle (built lazily).
        expect(execution?.perRef()).toHaveLength(1);
    });
});
