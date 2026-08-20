// (C) 2026 GoodData Corporation

import { type ReactNode, createElement } from "react";

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { type ITableColumnDefinition } from "@gooddata/sdk-ui";

import { PivotTablePropsProvider } from "../../context/PivotTablePropsContext.js";
import { type AgGridOnColumnResized } from "../../types/agGrid.js";
import { type ICorePivotTableNextProps } from "../../types/internal.js";
import {
    type ColumnResizedCallback,
    type ColumnWidthItem,
    newWidthForAttributeColumn,
} from "../../types/resizing.js";

import { useManualResize } from "./useManualResize.js";

describe("useManualResize", () => {
    it("should ignore resize events not coming from UI interaction", () => {
        const onColumnResized = vi.fn();

        const { result } = renderManualResize({
            onColumnResized,
            columnWidths: [newWidthForAttributeColumn("region", 120)],
        });

        act(() => {
            result.current.handleManualResize(
                createColumnResizedEvent({
                    source: "api",
                    column: createAgGridColumn(createAttributeColumnDefinition("region"), 210),
                }),
            );
        });

        expect(onColumnResized).not.toHaveBeenCalled();
    });

    it("should append new column width when no existing width item matches", () => {
        const onColumnResized = vi.fn();
        const existingWidth = newWidthForAttributeColumn("city", 150);
        const updatedWidth = 260;

        const { result } = renderManualResize({ onColumnResized, columnWidths: [existingWidth] });

        act(() => {
            result.current.handleManualResize(
                createColumnResizedEvent({
                    source: "uiColumnResized",
                    column: createAgGridColumn(createAttributeColumnDefinition("region"), updatedWidth),
                }),
            );
        });

        expect(onColumnResized).toHaveBeenCalledTimes(1);
        expect(onColumnResized).toHaveBeenCalledWith([
            existingWidth,
            newWidthForAttributeColumn("region", updatedWidth),
        ]);
    });

    it("should replace matching existing width item and keep unmatched items", () => {
        const onColumnResized = vi.fn();
        const unmatchedWidth = newWidthForAttributeColumn("city", 180);
        const oldMatchingWidth = newWidthForAttributeColumn("region", 110);
        const updatedWidth = 320;

        const { result } = renderManualResize({
            onColumnResized,
            columnWidths: [unmatchedWidth, oldMatchingWidth],
        });

        act(() => {
            result.current.handleManualResize(
                createColumnResizedEvent({
                    source: "uiColumnResized",
                    column: createAgGridColumn(createAttributeColumnDefinition("region"), updatedWidth),
                }),
            );
        });

        expect(onColumnResized).toHaveBeenCalledTimes(1);
        expect(onColumnResized).toHaveBeenCalledWith([
            unmatchedWidth,
            newWidthForAttributeColumn("region", updatedWidth),
        ]);
    });

    it("should support multi-column resize payload", () => {
        const onColumnResized = vi.fn();
        const existingWidth = newWidthForAttributeColumn("city", 180);

        const { result } = renderManualResize({ onColumnResized, columnWidths: [existingWidth] });

        act(() => {
            result.current.handleManualResize(
                createColumnResizedEvent({
                    source: "uiColumnResized",
                    columns: [
                        createAgGridColumn(createAttributeColumnDefinition("region"), 230),
                        createAgGridColumn(createAttributeColumnDefinition("country"), 260),
                    ],
                }),
            );
        });

        expect(onColumnResized).toHaveBeenCalledTimes(1);
        expect(onColumnResized).toHaveBeenCalledWith([
            existingWidth,
            newWidthForAttributeColumn("region", 230),
            newWidthForAttributeColumn("country", 260),
        ]);
    });
});

function renderManualResize(props: {
    onColumnResized: ColumnResizedCallback;
    columnWidths: ColumnWidthItem[];
}) {
    const pivotTableProps = createPivotTableProps(props);

    return renderHook(() => useManualResize(), {
        wrapper: ({ children }: { children: ReactNode }) =>
            createElement(PivotTablePropsProvider, { ...pivotTableProps, children }),
    });
}

function createPivotTableProps({
    onColumnResized,
    columnWidths,
}: {
    onColumnResized: ColumnResizedCallback;
    columnWidths: ColumnWidthItem[];
}): ICorePivotTableNextProps {
    return {
        // the hook under test never touches the execution, it is required by the props contract only
        execution: {} as ICorePivotTableNextProps["execution"],
        config: {
            columnSizing: {
                columnWidths,
            },
        },
        onColumnResized,
    };
}

function createAttributeColumnDefinition(attributeIdentifier: string): ITableColumnDefinition {
    return {
        type: "attribute",
        columnIndex: 0,
        rowHeaderIndex: 0,
        attributeDescriptor: {
            attributeHeader: {
                localIdentifier: attributeIdentifier,
            },
        },
    } as ITableColumnDefinition;
}

function createAgGridColumn(columnDefinition: ITableColumnDefinition, width: number) {
    return {
        getColDef: () => ({
            context: {
                columnDefinition,
            },
        }),
        getActualWidth: () => width,
    };
}

function createColumnResizedEvent(event: {
    source: string;
    column?: ReturnType<typeof createAgGridColumn>;
    columns?: Array<ReturnType<typeof createAgGridColumn>>;
}): Parameters<AgGridOnColumnResized>[0] {
    return event as unknown as Parameters<AgGridOnColumnResized>[0];
}
