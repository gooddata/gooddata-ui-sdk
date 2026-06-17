// (C) 2026 GoodData Corporation

import type { IntlShape } from "react-intl";

import { type IExecutionResultLimitBreak, executionResultLimitTypeToKind } from "@gooddata/sdk-model";

import { messages } from "./messages.js";

const COMPACT_FORMAT_THRESHOLD = 10000;
const COMPACT_FORMATTING_OPTIONS = { style: "decimal", notation: "compact" } as const;

type LimitBreakKind = "rows" | "columns" | "cells" | "unknown";
type KnownLimitBreakKind = Exclude<LimitBreakKind, "unknown">;
type KnownLimitBreaksByKind = Partial<Record<KnownLimitBreakKind, IExecutionResultLimitBreak>>;

/**
 * @internal
 */
export interface IPartialDataWarningMessage {
    id: string;
    values?: Record<string, string | undefined>;
}

interface IMessagePair {
    withOverflow: IPartialDataWarningMessage;
    unknownTotal: IPartialDataWarningMessage;
}

// Canonical order in which limit break kinds appear in the combined messages.
const KIND_ORDER: KnownLimitBreakKind[] = ["columns", "cells", "rows"];

const VALUE_KEYS: Record<KnownLimitBreakKind, { limit: string; overflow: string }> = {
    columns: { limit: "columnLimit", overflow: "columnOverflow" },
    cells: { limit: "cellLimit", overflow: "cellOverflow" },
    rows: { limit: "rowLimit", overflow: "rowOverflow" },
};

// Maps the set of broken limit kinds (in canonical order, comma-joined) to its message pair.
const MESSAGES_BY_KINDS: Record<string, IMessagePair> = {
    columns: {
        withOverflow: messages.columnsDescription,
        unknownTotal: messages.columnsDescriptionUnknownTotal,
    },
    cells: {
        withOverflow: messages.cellsDescription,
        unknownTotal: messages.cellsDescriptionUnknownTotal,
    },
    rows: {
        withOverflow: messages.rowsDescription,
        unknownTotal: messages.rowsDescriptionUnknownTotal,
    },
    "columns,rows": {
        withOverflow: messages.columnsRowsDescription,
        unknownTotal: messages.columnsRowsDescriptionUnknownTotal,
    },
    "columns,cells": {
        withOverflow: messages.columnsCellsDescription,
        unknownTotal: messages.columnsCellsDescriptionUnknownTotal,
    },
    "cells,rows": {
        withOverflow: messages.cellsRowsDescription,
        unknownTotal: messages.cellsRowsDescriptionUnknownTotal,
    },
    "columns,cells,rows": {
        withOverflow: messages.columnsCellsRowsDescription,
        unknownTotal: messages.columnsCellsRowsDescriptionUnknownTotal,
    },
};

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

function buildValues(
    byKind: KnownLimitBreaksByKind,
    presentKinds: KnownLimitBreakKind[],
    intl: IntlShape,
): Record<string, string | undefined> {
    const values: Record<string, string | undefined> = {};

    presentKinds.forEach((kind) => {
        const limitBreak = byKind[kind]!;
        const keys = VALUE_KEYS[kind];
        values[keys.limit] = formatLimit(limitBreak, intl);
        values[keys.overflow] = formatOverflow(limitBreak, intl);
    });

    return values;
}

/**
 * @internal
 */
export function getPartialDataWarningMessage(
    limitBreaks: IExecutionResultLimitBreak[],
    intl: IntlShape,
): IPartialDataWarningMessage {
    const byKind = getLimitBreaksByKind(limitBreaks);
    const presentKinds = KIND_ORDER.filter((kind) => byKind[kind]);

    const messagePair = MESSAGES_BY_KINDS[presentKinds.join(",")];
    if (!messagePair) {
        return messages.description;
    }

    const values = buildValues(byKind, presentKinds, intl);

    // Overflow can only be rendered when it is known for every broken limit; otherwise the
    // warning omits the exact amounts and falls back to the "unknown total" wording.
    const allOverflowsKnown = presentKinds.every((kind) => values[VALUE_KEYS[kind].overflow] !== undefined);

    return {
        ...(allOverflowsKnown ? messagePair.withOverflow : messagePair.unknownTotal),
        values,
    };
}
