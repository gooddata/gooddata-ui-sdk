// (C) 2026 GoodData Corporation

import { type SortChangedEvent } from "ag-grid-community";
import { describe, expect, it, vi } from "vitest";

import {
    type ISortItem,
    type ITotal,
    defWithBuckets,
    defWithSorting,
    emptyDef,
    newAttribute,
    newAttributeSort,
    newBucket,
    newMeasureSort,
} from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";

import { type InternalTableState } from "../../tableState.js";
import { getTotalsForAttributeBucket } from "../utils.js";

import { AggregationEventHandlers } from "./aggregationEventHandlers.js";
import { SortingEventHandlers } from "./sortingEventHandlers.js";

const subtotal: ITotal = { type: "sum", attributeIdentifier: "a2", measureIdentifier: "m1" };
const grandTotal: ITotal = { ...subtotal, attributeIdentifier: "a1" };
const rows = [newAttribute("state", (a) => a.localId("a1")), newAttribute("city", (a) => a.localId("a2"))];

describe("legacy pivot totals", () => {
    it.each([
        { sortItems: [] },
        { sortItems: [newAttributeSort("a2", "asc")] },
        { sortItems: [newAttributeSort("a1", "asc"), newAttributeSort("a2", "desc")] },
        { sortItems: [newMeasureSort("m1", "desc")] },
    ])("preserves totals when loading a sorted execution: $sortItems", ({ sortItems }) => {
        const definition = defWithSorting(
            defWithBuckets(
                emptyDef("workspace"),
                newBucket(BucketNames.ATTRIBUTE, ...rows, grandTotal, subtotal),
            ),
            sortItems,
        );
        expect(getTotalsForAttributeBucket(definition)).toEqual([grandTotal, subtotal]);
    });

    it("keeps newly added totals through sorting changes and removes them without changing grand totals", () => {
        let totals = [grandTotal];
        let sortItems: ISortItem[] = [newAttributeSort("a2", "asc")];
        const refreshData = vi.fn();
        const internal = {
            table: { getSortItems: () => sortItems, createSortItems: () => sortItems, refreshData },
        } as unknown as InternalTableState;
        const pushDataGuard = vi.fn();
        const context = {
            internal,
            getColumnTotals: () => totals,
            getRowTotals: () => [],
            pushDataGuard,
            setState: (state: { columnTotals: ITotal[] }, callback?: () => void) => {
                totals = state.columnTotals;
                callback?.();
            },
        };
        const aggregation = new AggregationEventHandlers(context);
        const sorting = new SortingEventHandlers(context);
        const selection = { ...subtotal, measureIdentifiers: ["m1"], isColumn: true, include: true };
        aggregation.onMenuAggregationClick(selection);
        expect(totals).toEqual([grandTotal, subtotal]);
        for (const nextSort of [[newAttributeSort("a2", "desc")], [newMeasureSort("m1", "desc")], []]) {
            sortItems = nextSort;
            sorting.onSortChanged({ api: { getAllGridColumns: () => [] } } as unknown as SortChangedEvent);
            expect(pushDataGuard).toHaveBeenLastCalledWith({
                properties: { sortItems, totals: [grandTotal, subtotal], bucketType: BucketNames.ATTRIBUTE },
            });
            expect(totals).toEqual([grandTotal, subtotal]);
        }
        aggregation.onMenuAggregationClick({ ...selection, include: false });
        expect(totals).toEqual([grandTotal]);
        expect(refreshData).toHaveBeenCalledTimes(5);
    });
});
