// (C) 2026 GoodData Corporation

import { type IBucket, type TotalType, bucketsFind } from "@gooddata/sdk-model";
import {
    BucketNames,
    type DataViewFacade,
    type ITableColumnDefinition,
    type ITableDataValue,
    type ITableGrandTotalRowDefinition,
    type ITableSubtotalRowDefinition,
    isAttributeTotalScope,
    isGrandTotalColumnDefinition,
    isGrandTotalRowDefinition,
    isMeasureGroupHeaderColumnDefinition,
    isMeasureTotalScope,
    isSubtotalColumnDefinition,
    isSubtotalRowDefinition,
    isTableGrandTotalHeaderValue,
    isTableTotalHeaderValue,
} from "@gooddata/sdk-ui";

import { type AgGridRowData } from "../../types/internal.js";

import { type TotalLabelBucketType, getResultTotalType, getTotalAlias } from "./totals.js";

export interface ITotalLabelTarget {
    type: TotalType;
    attributeIdentifier: string;
    bucketType: TotalLabelBucketType;
    measureIdentifier?: string;
}

export interface IOpenTotalLabelMenuRequest extends ITotalLabelTarget {
    anchor: HTMLElement;
}

/**
 * Resolves the total definition represented by a total/grand-total label cell (e.g. the "Sum A" or
 * "RowSum Σ" cell, not a numeric value cell). Only grand-total and subtotal rows ever produce these
 * label cells - every "totalHeader"/"grandTotalHeader" cell sdk-ui emits comes from a
 * grandTotalRow/subtotalRow mapper, so its rowDefinition is always a total row. Total/subtotal
 * *column* headers (not cell data) are resolved separately by resolveTotalLabelTargetFromColumnDefinition.
 */
export function resolveTotalLabelTargetFromTotalLabelCellData(
    cellData: ITableDataValue | undefined,
): ITotalLabelTarget | undefined {
    if (!cellData || (!isTableTotalHeaderValue(cellData) && !isTableGrandTotalHeaderValue(cellData))) {
        return undefined;
    }

    if (isMeasureGroupHeaderColumnDefinition(cellData.columnDefinition)) {
        return undefined;
    }

    if (isTableTotalHeaderValue(cellData) && cellData.value.totalHeaderItem.measureIndex !== undefined) {
        return undefined;
    }

    const { rowDefinition } = cellData;
    if (isGrandTotalRowDefinition(rowDefinition)) {
        const measureIdentifier = measureIdentifierForGrandTotalRow(rowDefinition);
        return {
            type: rowDefinition.totalType,
            attributeIdentifier: rowDefinition.attributeDescriptor.attributeHeader.localIdentifier,
            bucketType: BucketNames.ATTRIBUTE,
            ...(measureIdentifier === undefined ? {} : { measureIdentifier }),
        };
    }

    if (isSubtotalRowDefinition(rowDefinition)) {
        const totalScope = rowDefinition.rowScope.find(isAttributeTotalScope);
        const type = getResultTotalType(totalScope?.header.totalHeaderItem.type);
        if (totalScope && type) {
            const measureIdentifier = measureIdentifierForSubtotalRow(rowDefinition);
            return {
                type,
                attributeIdentifier: totalScope.descriptor.attributeHeader.localIdentifier,
                bucketType: BucketNames.ATTRIBUTE,
                ...(measureIdentifier === undefined ? {} : { measureIdentifier }),
            };
        }
    }

    return undefined;
}

function measureIdentifierForGrandTotalRow(rowDefinition: ITableGrandTotalRowDefinition): string | undefined {
    const [soleMeasureDescriptor] = rowDefinition.measureDescriptors;
    return rowDefinition.measureDescriptors.length === 1
        ? soleMeasureDescriptor.measureHeaderItem.localIdentifier
        : undefined;
}

function measureIdentifierForSubtotalRow(rowDefinition: ITableSubtotalRowDefinition): string | undefined {
    return rowDefinition.rowScope.find(isMeasureTotalScope)?.descriptor.measureHeaderItem.localIdentifier;
}

export function isFirstTotalHeaderAttributeCell(rowData: AgGridRowData | undefined, colId: string): boolean {
    let firstColId: string | undefined;
    let firstColumnIndex = Infinity;

    for (const [id, cell] of Object.entries(rowData?.cellDataByColId ?? {})) {
        if (
            cell.columnDefinition.type !== "attribute" ||
            (!isTableTotalHeaderValue(cell) && !isTableGrandTotalHeaderValue(cell))
        ) {
            continue;
        }

        if (cell.columnDefinition.columnIndex < firstColumnIndex) {
            firstColumnIndex = cell.columnDefinition.columnIndex;
            firstColId = id;
        }
    }

    return firstColId === colId;
}

/**
 * Resolves the total definition represented by a total or subtotal column.
 */
export function resolveTotalLabelTargetFromColumnDefinition(
    columnDefinition: ITableColumnDefinition | undefined,
): ITotalLabelTarget | undefined {
    if (
        !columnDefinition ||
        (!isGrandTotalColumnDefinition(columnDefinition) && !isSubtotalColumnDefinition(columnDefinition))
    ) {
        return undefined;
    }

    // A grand total spanning multiple column attributes has a single total definition anchored to
    // the outermost attribute (confirmed against real execution fixtures) even though every
    // pivoted level shows an attributeTotalScope entry - collectColumnDefinitions.ts's reversed
    // search resolves a display header for that case, not the total definition's identity, so it
    // doesn't apply here.
    const totalScope = columnDefinition.columnScope.find(isAttributeTotalScope);
    const type = getResultTotalType(columnDefinition.totalHeader.totalHeaderItem.type);
    if (!totalScope || !type) {
        return undefined;
    }

    return {
        type,
        attributeIdentifier: totalScope.descriptor.attributeHeader.localIdentifier,
        bucketType: BucketNames.COLUMNS,
    };
}

export function getTotalAliasForTarget(buckets: IBucket[], target: ITotalLabelTarget): string | undefined {
    const totals = bucketsFind(buckets, target.bucketType)?.totals ?? [];
    return getTotalAlias(totals, target.type, target.attributeIdentifier, target.measureIdentifier);
}

/**
 * Resolves the custom label (alias) for the total a cell represents, if it has one. A single source
 * of truth for both applying the alias to a cell's formatted value and for later deciding whether
 * that formatted value is already-final custom text that must not be run through total-type
 * translation (an alias that happens to equal a raw type key, e.g. "sum", must still display verbatim).
 */
export function resolveCustomTotalLabel(
    cellData: ITableDataValue | undefined,
    dataView: DataViewFacade,
): string | undefined {
    const target = resolveTotalLabelTargetFromTotalLabelCellData(cellData);
    if (!target) {
        return undefined;
    }

    return getTotalAliasForTarget(dataView.definition.buckets, target);
}
