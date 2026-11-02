// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { renderHook } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { describe, expect, it, vi } from "vitest";

import {
    type ISortItem,
    type ITotal,
    newAttribute,
    newAttributeSort,
    newBucket,
    newMeasureSort,
} from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";

import { CurrentDataViewProvider } from "../../context/CurrentDataViewContext.js";
import { PivotTablePropsProvider } from "../../context/PivotTablePropsContext.js";
import { type ICorePivotTableNextProps } from "../../types/internal.js";

import { useHeaderMenuAggregations } from "./useHeaderMenuAggregations.js";

vi.hoisted(() => {
    vi.resetModules();
});

const rows = [newAttribute("state", (a) => a.localId("a1")), newAttribute("city", (a) => a.localId("a2"))];
const columns = [
    newAttribute("category", (a) => a.localId("c1")),
    newAttribute("product", (a) => a.localId("c2")),
];
const metricSort = newMeasureSort("m1", "desc");
const explanation = "Clear metric sorting to show subtotals.";

/**
 * Renders the menu with real pivot providers and independently mutable current sorting.
 */
function renderMenu(initialSortBy: ISortItem[], totals: ITotal[] = [], measureIdentifiers = ["m1"]) {
    const pushData = vi.fn();
    let sortBy = initialSortBy;
    // The original execution can retain its sort while the grid changes the current sortBy props.
    const execution = {
        definition: {
            buckets: [
                newBucket(BucketNames.ATTRIBUTE, ...rows, ...totals),
                newBucket(BucketNames.COLUMNS, ...columns),
            ],
            sortBy: [metricSort],
            filters: [],
        },
    } as unknown as ICorePivotTableNextProps["execution"];

    function wrapper({ children }: { children: ReactNode }) {
        return (
            <IntlProvider
                locale="en-US"
                messages={{
                    "visualizations.menu.aggregations.all-rows": "of all rows",
                    "visualizations.menu.aggregations.all-columns": "of all columns",
                    "visualizations.menu.aggregations.within-attribute": "within {attributeName}",
                    "visualizations.totals.dropdown.tooltip.subtotal.disabled.measureSort": explanation,
                }}
            >
                <CurrentDataViewProvider>
                    <PivotTablePropsProvider
                        execution={execution}
                        rows={rows}
                        columns={columns}
                        sortBy={sortBy}
                        pushData={pushData}
                        config={{
                            menu: {
                                aggregations: true,
                                aggregationsSubMenu: true,
                                aggregationsSubMenuForRows: true,
                                aggregationTypes: ["sum"],
                            },
                        }}
                    >
                        {children}
                    </PivotTablePropsProvider>
                </CurrentDataViewProvider>
            </IntlProvider>
        );
    }

    const hook = renderHook(() => useHeaderMenuAggregations(measureIdentifiers, []), { wrapper });
    return {
        ...hook,
        pushData,
        setSort: (nextSort: ISortItem[]) => {
            sortBy = nextSort;
            hook.rerender();
        },
    };
}

describe("useHeaderMenuAggregations", () => {
    it("explains unavailable row subtotals with metric sorting, while leaving grand and column totals available", () => {
        const { result, pushData } = renderMenu([metricSort]);
        const menu = result.current.aggregationsItems[0];
        expect(menu.rows[0].isDisabled).not.toBe(true);
        expect(menu.rows[1]).toMatchObject({ isDisabled: true, disabledTooltip: explanation });
        expect(menu.columns.every((item) => !item.isDisabled)).toBe(true);

        result.current.handleAggregationsItemClick(menu.rows[1]);
        expect(pushData).not.toHaveBeenCalled();
    });

    it("uses current sorting and enables subtotals again when metric sorting is cleared", () => {
        const { result, setSort } = renderMenu([metricSort]);
        setSort([]);
        expect(result.current.aggregationsItems[0].rows[1].isDisabled).not.toBe(true);
        setSort([newAttributeSort("a2", "asc")]);
        expect(result.current.aggregationsItems[0].rows[1].isDisabled).not.toBe(true);
        setSort([newAttributeSort("a1", "asc"), newAttributeSort("a2", "desc")]);
        expect(result.current.aggregationsItems[0].rows[1].isDisabled).not.toBe(true);
    });

    it("allows removing an existing subtotal while a metric is sorted", () => {
        const total: ITotal = { type: "sum", measureIdentifier: "m1", attributeIdentifier: "a2" };
        const { result, pushData } = renderMenu([metricSort], [total]);
        const subtotal = result.current.aggregationsItems[0].rows[1];
        expect(subtotal.isDisabled).not.toBe(true);
        expect(subtotal.disabledTooltip).toBe(explanation);
        result.current.handleAggregationsItemClick(subtotal);
        expect(pushData).toHaveBeenCalledWith({
            properties: { totals: [], bucketType: BucketNames.ATTRIBUTE },
        });
    });

    it("removes partially present grouped subtotals during metric sorting without adding missing ones", () => {
        const subtotal: ITotal = { type: "sum", measureIdentifier: "m1", attributeIdentifier: "a2" };
        const grandTotal: ITotal = { type: "sum", measureIdentifier: "m1", attributeIdentifier: "a1" };
        const { result, pushData } = renderMenu([metricSort], [grandTotal, subtotal], ["m1", "m2"]);
        const item = result.current.aggregationsItems[0].rows[1];

        expect(item.isDisabled).not.toBe(true);
        expect(item.disabledTooltip).toBe(explanation);
        result.current.handleAggregationsItemClick(item);

        expect(pushData).toHaveBeenCalledWith({
            properties: { totals: [grandTotal], bucketType: BucketNames.ATTRIBUTE },
        });
    });

    it("clears the explanation on existing subtotals when metric sorting is cleared", () => {
        const total: ITotal = { type: "sum", measureIdentifier: "m1", attributeIdentifier: "a2" };
        const { result, setSort } = renderMenu([metricSort], [total]);
        expect(result.current.aggregationsItems[0].rows[1].disabledTooltip).toBe(explanation);
        setSort([]);
        expect(result.current.aggregationsItems[0].rows[1].disabledTooltip).toBeUndefined();
        expect(result.current.aggregationsItems[0].rows[1].isActive).toBe(true);
    });

    it("still completes partially present grouped subtotals during attribute sorting", () => {
        const subtotal: ITotal = { type: "sum", measureIdentifier: "m1", attributeIdentifier: "a2" };
        const { result, pushData } = renderMenu([newAttributeSort("a2", "asc")], [subtotal], ["m1", "m2"]);

        result.current.handleAggregationsItemClick(result.current.aggregationsItems[0].rows[1]);

        expect(pushData).toHaveBeenCalledWith({
            properties: {
                totals: [subtotal, { ...subtotal, measureIdentifier: "m2" }],
                bucketType: BucketNames.ATTRIBUTE,
            },
        });
    });
});
