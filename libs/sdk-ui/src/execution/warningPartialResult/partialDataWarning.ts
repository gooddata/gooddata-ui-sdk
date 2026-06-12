// (C) 2026 GoodData Corporation

import type { IntlShape } from "react-intl";

import { type IExecutionResultLimitBreak, executionResultLimitTypeToKind } from "@gooddata/sdk-model";

import { messages } from "./messages.js";

const COMPACT_FORMAT_THRESHOLD = 10000;
const COMPACT_FORMATTING_OPTIONS = { style: "decimal", notation: "compact" } as const;

type LimitBreakKind = "rows" | "columns" | "cells" | "unknown";
type KnownLimitBreaksByKind = Partial<Record<Exclude<LimitBreakKind, "unknown">, IExecutionResultLimitBreak>>;

/**
 * @internal
 */
export interface IPartialDataWarningMessage {
    id: string;
    values?: Record<string, string | undefined>;
}

function getLimitBreakKind(limitBreak: IExecutionResultLimitBreak): LimitBreakKind {
    return executionResultLimitTypeToKind(limitBreak.limitType);
}

function formatLimit(limitBreak: IExecutionResultLimitBreak, intl: IntlShape): string {
    return formatLimitValue(limitBreak.limit, intl);
}

function formatOverflow(limitBreak: IExecutionResultLimitBreak, intl: IntlShape): string | undefined {
    if (typeof limitBreak.value !== "number") {
        return undefined;
    }

    const overflow = limitBreak.value - limitBreak.limit;
    return overflow > 0 ? formatLimitValue(overflow, intl) : undefined;
}

function formatLimitValue(value: number, intl: IntlShape): string {
    return value >= COMPACT_FORMAT_THRESHOLD
        ? intl.formatNumber(value, COMPACT_FORMATTING_OPTIONS)
        : intl.formatNumber(value);
}

function getLimitBreaksByKind(limitBreaks: IExecutionResultLimitBreak[]): KnownLimitBreaksByKind {
    return limitBreaks.reduce((result, limitBreak) => {
        const kind = getLimitBreakKind(limitBreak);
        if (kind !== "unknown" && !result[kind]) {
            result[kind] = limitBreak;
        }
        return result;
    }, {} as KnownLimitBreaksByKind);
}

function getRowsAndColumnsDetailMessage(
    rowLimitBreak: IExecutionResultLimitBreak,
    columnLimitBreak: IExecutionResultLimitBreak,
    intl: IntlShape,
): IPartialDataWarningMessage {
    const values = {
        rowLimit: formatLimit(rowLimitBreak, intl),
        columnLimit: formatLimit(columnLimitBreak, intl),
        rowOverflow: formatOverflow(rowLimitBreak, intl),
        columnOverflow: formatOverflow(columnLimitBreak, intl),
    };

    if (values.rowOverflow && values.columnOverflow) {
        return { ...messages.rowsColumnsDescription, values };
    }

    if (values.rowOverflow) {
        return { ...messages.rowsColumnsDescriptionUnknownColumnTotal, values };
    }

    if (values.columnOverflow) {
        return { ...messages.rowsColumnsDescriptionUnknownRowTotal, values };
    }

    return { ...messages.rowsColumnsDescriptionUnknownTotal, values };
}

function getRowsDetailMessage(
    rowLimitBreak: IExecutionResultLimitBreak,
    intl: IntlShape,
): IPartialDataWarningMessage {
    const values = {
        rowLimit: formatLimit(rowLimitBreak, intl),
        rowOverflow: formatOverflow(rowLimitBreak, intl),
    };

    return {
        ...(values.rowOverflow ? messages.rowsDescription : messages.rowsDescriptionUnknownTotal),
        values,
    };
}

function getColumnsDetailMessage(
    columnLimitBreak: IExecutionResultLimitBreak,
    intl: IntlShape,
): IPartialDataWarningMessage {
    const values = {
        columnLimit: formatLimit(columnLimitBreak, intl),
        columnOverflow: formatOverflow(columnLimitBreak, intl),
    };

    return {
        ...(values.columnOverflow ? messages.columnsDescription : messages.columnsDescriptionUnknownTotal),
        values,
    };
}

function getCellsDetailMessage(
    cellLimitBreak: IExecutionResultLimitBreak,
    intl: IntlShape,
): IPartialDataWarningMessage {
    const values = {
        cellLimit: formatLimit(cellLimitBreak, intl),
        cellOverflow: formatOverflow(cellLimitBreak, intl),
    };

    return {
        ...(values.cellOverflow ? messages.cellsDescription : messages.cellsDescriptionUnknownTotal),
        values,
    };
}

/**
 * @internal
 */
export function getPartialDataWarningMessage(
    limitBreaks: IExecutionResultLimitBreak[],
    intl: IntlShape,
): IPartialDataWarningMessage {
    const byKind = getLimitBreaksByKind(limitBreaks);
    const rowLimitBreak = byKind.rows;
    const columnLimitBreak = byKind.columns;

    if (rowLimitBreak) {
        return columnLimitBreak
            ? getRowsAndColumnsDetailMessage(rowLimitBreak, columnLimitBreak, intl)
            : getRowsDetailMessage(rowLimitBreak, intl);
    }

    if (columnLimitBreak) {
        return getColumnsDetailMessage(columnLimitBreak, intl);
    }

    const cellLimitBreak = byKind.cells;
    if (cellLimitBreak) {
        return getCellsDetailMessage(cellLimitBreak, intl);
    }

    return messages.description;
}
