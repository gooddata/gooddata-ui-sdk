// (C) 2026 GoodData Corporation

import { type ReactNode, createElement } from "react";

import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
    type IExecutionDefinition,
    type ITotal,
    newAttribute,
    newAttributeSort,
    newBucket,
    newMeasureSort,
} from "@gooddata/sdk-model";
import { BucketNames, type IPushData } from "@gooddata/sdk-ui";

import { PivotTablePropsProvider } from "../../context/PivotTablePropsContext.js";
import { type ICorePivotTableNextProps } from "../../types/internal.js";

import { useUpdateTotals } from "./useUpdateTotals.js";

vi.hoisted(() => {
    vi.resetModules();
});

describe("useUpdateTotals", () => {
    const rowAttributes = [
        newAttribute("state", (a) => a.localId("a1")),
        newAttribute("city", (a) => a.localId("a2")),
    ];
    const grandTotal: ITotal = { attributeIdentifier: "a1", measureIdentifier: "m1", type: "sum" };
    const subtotal: ITotal = { attributeIdentifier: "a2", measureIdentifier: "m1", type: "sum" };

    it.each([
        ["second row attribute", [newAttributeSort("a2", "asc")]],
        ["measure", [newMeasureSort("m1", "desc")]],
        ["multiple columns", [newAttributeSort("a1", "asc"), newAttributeSort("a2", "desc")]],
        ["cleared sort", []],
    ] as const)("adds and removes a grouped total with %s sorting", (_name, sortBy) => {
        const pushData = vi.fn();
        const { result } = renderUseUpdateTotals(
            pushData,
            {},
            {
                buckets: [newBucket(BucketNames.ATTRIBUTE, ...rowAttributes)],
                sortBy: [...sortBy],
            },
        );

        result.current.onUpdateTotals([grandTotal], [subtotal], false, false);
        expect(pushData).toHaveBeenLastCalledWith({
            properties: { totals: [grandTotal, subtotal], bucketType: BucketNames.ATTRIBUTE },
        });

        result.current.onUpdateTotals([grandTotal, subtotal], [subtotal], true, false);
        expect(pushData).toHaveBeenLastCalledWith({
            properties: { totals: [grandTotal], bucketType: BucketNames.ATTRIBUTE },
        });
    });

    it("propagates the existing alias to a total newly enabled for another measure (column totals)", () => {
        const pushData = vi.fn();
        const { result } = renderUseUpdateTotals(pushData);

        const currentTotals: ITotal[] = [
            { attributeIdentifier: "a1", measureIdentifier: "m1", type: "sum", alias: "Grand Total" },
        ];
        const totalDefinitions: ITotal[] = [
            { attributeIdentifier: "a1", measureIdentifier: "m2", type: "sum" },
        ];

        result.current.onUpdateTotals(currentTotals, totalDefinitions, false, true);

        expect(pushData).toHaveBeenCalledWith({
            properties: {
                totals: [
                    { attributeIdentifier: "a1", measureIdentifier: "m1", type: "sum", alias: "Grand Total" },
                    { attributeIdentifier: "a1", measureIdentifier: "m2", type: "sum", alias: "Grand Total" },
                ],
                bucketType: BucketNames.COLUMNS,
            },
        });
    });

    it("does not propagate another measure's alias to a row total newly enabled in a transposed table", () => {
        const pushData = vi.fn();
        const { result } = renderUseUpdateTotals(pushData, { measureGroupDimension: "rows" });

        const currentTotals: ITotal[] = [
            { attributeIdentifier: "a1", measureIdentifier: "m1", type: "sum", alias: "Grand Total" },
        ];
        const totalDefinitions: ITotal[] = [
            { attributeIdentifier: "a1", measureIdentifier: "m2", type: "sum" },
        ];

        result.current.onUpdateTotals(currentTotals, totalDefinitions, false, false);

        expect(pushData).toHaveBeenCalledWith({
            properties: {
                totals: [
                    { attributeIdentifier: "a1", measureIdentifier: "m1", type: "sum", alias: "Grand Total" },
                    { attributeIdentifier: "a1", measureIdentifier: "m2", type: "sum" },
                ],
                bucketType: BucketNames.ATTRIBUTE,
            },
        });
    });
});

function renderUseUpdateTotals(
    pushData: (data: IPushData) => void,
    config: Partial<ICorePivotTableNextProps["config"]> = {},
    definition: Pick<IExecutionDefinition, "buckets" | "sortBy"> = { buckets: [], sortBy: [] },
) {
    const pivotTableProps: ICorePivotTableNextProps = {
        execution: {
            definition,
        } as unknown as ICorePivotTableNextProps["execution"],
        pushData,
        config: config as ICorePivotTableNextProps["config"],
    };

    return renderHook(() => useUpdateTotals(), {
        wrapper: ({ children }: { children: ReactNode }) =>
            createElement(PivotTablePropsProvider, { ...pivotTableProps, children }),
    });
}
