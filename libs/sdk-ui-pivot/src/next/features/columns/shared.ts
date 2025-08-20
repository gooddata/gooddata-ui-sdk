// (C) 2025 GoodData Corporation
import { IRowNode, ValueGetterParams } from "ag-grid-enterprise";
import { IntlShape } from "react-intl";

import { IResultTotalHeader, TotalType } from "@gooddata/sdk-model";
import { isTableGrandTotalHeaderValue, isTableTotalHeaderValue } from "@gooddata/sdk-ui";

import { totalTypeMessages } from "../../../locales.js";
import { METRIC_EMPTY_VALUE } from "../../constants/internal.js";
import { AgGridCellRendererParams } from "../../types/agGrid.js";
import { AgGridRowData } from "../../types/internal.js";

/**
 * Common cell renderer for metrics.
 *
 * @internal
 */
export function metricCellRenderer(params: AgGridCellRendererParams) {
    const value = params.value;

    if (!value) {
        return METRIC_EMPTY_VALUE;
    }

    return value;
}

/**
 * Extracts formatted value from cell data.
 *
 * @internal
 */
export function extractFormattedValue(
    params: ValueGetterParams<AgGridRowData, string | null> | IRowNode<AgGridRowData> | null | undefined,
    colId: string,
): string | null {
    const cell = params?.data?.cellDataByColId?.[colId];

    if (!cell) {
        return null;
    }

    return cell.formattedValue;
}

/**
 * Extracts translated formatted value from cell data.
 *
 * @internal
 */
export function extractIntlFormattedValue(
    params: ValueGetterParams<AgGridRowData, string | null> | IRowNode<AgGridRowData> | null | undefined,
    colId: string,
    intl: IntlShape,
): string | null {
    const cell = params?.data?.cellDataByColId?.[colId];

    if (!cell) {
        return null;
    }

    return isTableGrandTotalHeaderValue(cell) || isTableTotalHeaderValue(cell)
        ? (translateTotalValue(cell.formattedValue as TotalType, intl) ?? cell.formattedValue)
        : cell.formattedValue;
}

/**
 * Extracts translated formatted value from total header.
 *
 * @internal
 */
export function extractIntlTotalHeaderValue(header: IResultTotalHeader, intl: IntlShape): string {
    const totalType = header.totalHeaderItem.name as TotalType;

    return translateTotalValue(totalType, intl) ?? totalType;
}

function translateTotalValue(totalType: TotalType | null, intl: IntlShape) {
    if (!totalType) {
        return null;
    }

    const message = totalTypeMessages[totalType];
    return message ? intl.formatMessage(message) : totalType;
}
