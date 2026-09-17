// (C) 2026 GoodData Corporation

import { type ReactNode, createElement } from "react";

import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { type ITotal } from "@gooddata/sdk-model";
import { BucketNames, type IPushData } from "@gooddata/sdk-ui";

import { PivotTablePropsProvider } from "../../context/PivotTablePropsContext.js";
import { type ICorePivotTableNextProps } from "../../types/internal.js";

import { useUpdateTotals } from "./useUpdateTotals.js";

describe("useUpdateTotals", () => {
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
) {
    const pivotTableProps: ICorePivotTableNextProps = {
        // the hook under test only reads execution.definition on the row (non-column) branch
        execution: {
            definition: { buckets: [], sortBy: [] },
        } as unknown as ICorePivotTableNextProps["execution"],
        pushData,
        config: config as ICorePivotTableNextProps["config"],
    };

    return renderHook(() => useUpdateTotals(), {
        wrapper: ({ children }: { children: ReactNode }) =>
            createElement(PivotTablePropsProvider, { ...pivotTableProps, children }),
    });
}
