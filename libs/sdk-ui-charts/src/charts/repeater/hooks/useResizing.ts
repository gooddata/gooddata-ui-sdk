// (C) 2024-2026 GoodData Corporation

import { type RefObject, useCallback, useEffect, useMemo, useRef } from "react";

import {
    type ColDef,
    type Column,
    type ColumnResizedEvent,
    type GridApi,
    type GridReadyEvent,
} from "ag-grid-community";

import { type IAttributeOrMeasure } from "@gooddata/sdk-model";

import { cancelScheduledAnimationFrame } from "../../_base/animationFrameScheduler.js";
import { type RepeaterColumnLocator, UIClick } from "../columnWidths.js";
import {
    getColumnWidths,
    getManualResizedColumn,
    isAttributeColumnLocator,
    isAttributeColumnWidthItem,
    isManualResizing,
    isMeasureColumnLocator,
    isMeasureColumnWidthItem,
    isWeakMeasureColumnWidthItem,
} from "../internal/columnSizing.js";
import { type ColumnResizingConfig, type ResizingState } from "../internal/privateTypes.js";
import { growToFit } from "../internal/tableSizing.js";
import { type IRepeaterChartProps } from "../publicTypes.js";

const COLUMN_RESIZE_TIMEOUT = 300;

export const MANUALLY_SIZED_MAX_WIDTH = 2000;
export const MANUALLY_SIZED_MIN_WIDTH = 50;
export const AUTO_SIZED_MAX_WIDTH = 500;

export function useResizing(columnDefs: ColDef[], items: IAttributeOrMeasure[], props: IRepeaterChartProps) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const resizingState = useRef<ResizingState>({
        items,
        isAltKeyPressed: false,
        isMetaOrCtrlKeyPressed: false,
        clicks: 0,
        columnApi: null,
        containerElement: null,
        growToFitFrame: { frameId: null },
        manuallyResizedColumns: [],
    });

    useEffect(() => {
        const container = containerRef.current;
        if (container) {
            const listener = (event: MouseEvent) => {
                resizingState.current.isAltKeyPressed = event.altKey;
                resizingState.current.isMetaOrCtrlKeyPressed = event.metaKey || event.ctrlKey;
            };

            container.addEventListener("mousedown", listener);
            return () => {
                container.removeEventListener("mousedown", listener);
            };
        }
        return undefined;
    }, [containerRef, resizingState]);

    const resizeSettings = useMemo<ColumnResizingConfig>(() => {
        return {
            defaultWidth: 200,
            growToFit: props.config?.columnSizing?.growToFit === true,
            columnAutoresizeOption: props.config?.columnSizing?.defaultWidth ?? "unset",
            widths: props.config?.columnSizing?.columnWidths,

            isAltKeyPressed: resizingState.current.isAltKeyPressed,
            isMetaOrCtrlKeyPressed: resizingState.current.isMetaOrCtrlKeyPressed,

            separators: props?.config?.separators,

            onColumnResized: props.onColumnResized,
        };
    }, [props.config, props.onColumnResized]);

    const onColumnResized = useCallback(
        (columnEvent: ColumnResizedEvent) => {
            if (!columnEvent.finished) {
                return; // only update the height once the user is done setting the column size
            }

            if (isManualResizing(columnEvent)) {
                void onManualColumnResize(resizingState, resizeSettings, columnEvent.columns!);
            }
        },
        [resizeSettings],
    );

    const onGridReady = useCallback(
        (readyEvent: GridReadyEvent) => {
            resizingState.current.columnApi = readyEvent.api;
            resizingState.current.containerElement = containerRef.current;
            applyColumnSizes(columnDefs, resizingState, resizeSettings);
            growToFit(resizingState, resizeSettings);
        },
        [columnDefs, resizeSettings],
    );

    const onGridSizeChanged = useCallback(() => {
        growToFit(resizingState, resizeSettings);
    }, [resizeSettings]);

    useEffect(() => {
        applyColumnSizes(columnDefs, resizingState, resizeSettings);
    }, [columnDefs, resizeSettings]);

    // Cancel pending frames on cleanup
    useEffect(() => {
        const { growToFitFrame } = resizingState.current;
        return () => {
            cancelScheduledAnimationFrame(growToFitFrame);
        };
    }, []);

    return {
        containerRef,
        onColumnResized,
        onGridReady,
        onGridSizeChanged,
    };
}

async function onManualColumnResize(
    resizingState: RefObject<ResizingState>,
    resizingConfig: ColumnResizingConfig,
    columns: Column[],
) {
    resizingState.current.clicks++;
    await sleep(COLUMN_RESIZE_TIMEOUT);

    if (resizingState.current.clicks === (UIClick.DOUBLE_CLICK as number)) {
        resizingState.current.clicks = 0;
        onColumnsManualReset(resizingState, resizingConfig, columns);
    } else if (resizingState.current.clicks === (UIClick.CLICK as number)) {
        resizingState.current.clicks = 0;
        onColumnsManualResized(resizingState, resizingConfig, columns);
    }
}

function onColumnsManualReset(
    resizingState: RefObject<ResizingState>,
    resizingConfig: ColumnResizingConfig,
    columns: Column[],
) {
    const columnApi = resizingState.current.columnApi;

    for (const column of columns) {
        // Remove the column from the manually resized columns
        resizingState.current.manuallyResizedColumns = resizingState.current.manuallyResizedColumns.filter(
            (manuallyResizedColumn) => manuallyResizedColumn.getColId() !== column.getColId(),
        );

        column.getColDef().suppressSizeToFit = false;

        // If growToFit is disabled, we need to set the column's maxWidth to AUTO_SIZED_MAX_WIDTH
        // otherwise, the column will be auto-resized to fit
        if (!resizingConfig.growToFit) {
            const columnIds = [column.getColId()];
            setColumnMaxWidth(columnApi!, columnIds, AUTO_SIZED_MAX_WIDTH);
            columnApi!.autoSizeColumns(columnIds);
            setColumnMaxWidth(columnApi!, columnIds, MANUALLY_SIZED_MAX_WIDTH);
            resizingState.current.manuallyResizedColumns.push(column);
        }
    }

    afterOnResizeColumns(resizingState, resizingConfig);
}

function onColumnsManualResized(
    resizingState: RefObject<ResizingState>,
    resizingConfig: ColumnResizingConfig,
    columns: Column[],
) {
    columns.forEach((column) => {
        if (!getManualResizedColumn(resizingState, column)) {
            resizingState.current.manuallyResizedColumns.push(column);
        }
    });

    afterOnResizeColumns(resizingState, resizingConfig);
}

function applyColumnSizes(
    columnDefs: ColDef[],
    resizingState: RefObject<ResizingState>,
    resizeSettings: ColumnResizingConfig,
) {
    const columnWidthItems: Array<{ key: string; newWidth: number }> = [];

    const columnApi = resizingState.current.columnApi;

    if (!columnApi) {
        return;
    }

    resizeSettings.widths?.forEach((columnWidth) => {
        if (isAttributeColumnWidthItem(columnWidth)) {
            const column = columnDefs.find(
                (col) => col.field === columnWidth.attributeColumnWidthItem.attributeIdentifier,
            );
            if (column && !columnApi) {
                column.width = columnWidth.attributeColumnWidthItem.width.value;
            }
            if (column && columnApi) {
                const columnDef = columnApi
                    .getAllGridColumns()
                    .find((col) => col.getColDef().field === column.field);
                if (columnDef) {
                    columnWidthItems.push({
                        key: columnDef.getColId(),
                        newWidth: columnWidth.attributeColumnWidthItem.width.value,
                    });
                    if (!getManualResizedColumn(resizingState, columnDef)) {
                        resizingState.current.manuallyResizedColumns.push(columnDef);
                    }
                }
            }
        }
        if (isMeasureColumnWidthItem(columnWidth)) {
            columnWidth.measureColumnWidthItem.locators.forEach((locator) => {
                const res = applyMeasureColumnSize(
                    columnDefs,
                    resizingState,
                    locator,
                    columnWidth.measureColumnWidthItem.width.value,
                );

                if (res) {
                    columnWidthItems.push(res);
                }
            });
        }
        if (isWeakMeasureColumnWidthItem(columnWidth)) {
            const res = applyMeasureColumnSize(
                columnDefs,
                resizingState,
                columnWidth.measureColumnWidthItem.locator,
                columnWidth.measureColumnWidthItem.width.value,
            );

            if (res) {
                columnWidthItems.push(res);
            }
        }
    });

    setTimeout(() => {
        columnApi.setColumnWidths(columnWidthItems.filter((columnWidthItem) => !!columnWidthItem));
        columnApi.refreshCells();
    }, 0);
}

function applyMeasureColumnSize(
    columnDefs: ColDef[],
    resizingState: RefObject<ResizingState>,
    locator: RepeaterColumnLocator,
    width: number | "auto",
): { key: string; newWidth: number } | undefined {
    const columnApi = resizingState.current.columnApi;
    if (isMeasureColumnLocator(locator)) {
        const column = columnDefs.find((col) => col.field === locator.measureLocatorItem.measureIdentifier);
        if (column && !columnApi && width !== "auto") {
            column.width = width;
            column.suppressSizeToFit = true;
        }
        if (column && columnApi && width !== "auto") {
            const columnDef = columnApi
                .getAllGridColumns()
                .find((col) => col.getColDef().field === column.field);

            if (columnDef) {
                if (!getManualResizedColumn(resizingState, columnDef)) {
                    resizingState.current.manuallyResizedColumns.push(columnDef);
                }

                return { key: columnDef.getColId(), newWidth: width };
            }
        }
        //TODO: Autoresize column, value === "auto
    }
    if (isAttributeColumnLocator(locator)) {
        //TODO: Apply attribute column width
    }

    return undefined;
}

function afterOnResizeColumns(resizingState: RefObject<ResizingState>, resizingConfig: ColumnResizingConfig) {
    growToFit(resizingState, resizingConfig);

    const columnWidths = getColumnWidths(resizingState.current);
    resizingConfig.onColumnResized?.(columnWidths);
}

//utils

async function sleep(delay: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, delay);
    });
}

function setColumnMaxWidth(columnApi: GridApi, columnIds: string[], newMaxWidth: number | undefined): void {
    setColumnMaxWidthIf(columnApi, columnIds, newMaxWidth, () => true);
}

function setColumnMaxWidthIf(
    columnApi: GridApi,
    columnIds: string[],
    newMaxWidth: number | undefined,
    condition: (column: Column) => boolean,
): void {
    columnIds.forEach((colId) => {
        const column = columnApi.getColumn(colId);

        if (column && condition(column)) {
            // We need set maxWidth dynamically before/after autoresize/growToFit.
            // Set this only on column.getColDef().maxWidth not working
            // so we need to set it also on column's private member
            (column as any).maxWidth = newMaxWidth;
            column.getColDef().maxWidth = newMaxWidth;
        }
    });
}
