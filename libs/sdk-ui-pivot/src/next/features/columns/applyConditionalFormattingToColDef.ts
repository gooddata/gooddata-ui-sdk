// (C) 2026 GoodData Corporation

import { type CellClassParams, type CellStyle } from "ag-grid-enterprise";

import { type AgGridColumnDef } from "../../types/agGrid.js";
import {
    type ConditionalFormattingTriggerColIds,
    type IConditionalFormatting,
} from "../../types/conditionalFormatting.js";
import { type AgGridRowData } from "../../types/internal.js";
import { evaluateConditionalFormatting } from "../styling/conditionalFormatting.js";

/**
 * Decorates a col def's `cellStyle` so conditional-formatting colors are merged on top of any
 * existing (format-string-derived) styling — i.e. conditional formatting wins on conflict.
 *
 * Config-driven: a missing, disabled, or empty config is a no-op, so tables without conditional
 * formatting are completely unaffected. Adding the wrapper to every column (incl. row-header
 * attribute columns, which have no `cellStyle` of their own) is what enables whole-row scope.
 *
 * @internal
 */
export const applyConditionalFormattingToColDef =
    (config: IConditionalFormatting | undefined, triggers: ConditionalFormattingTriggerColIds) =>
    (colDef: AgGridColumnDef): AgGridColumnDef => {
        if (!config || !config.enabled || config.rules.length === 0) {
            return colDef;
        }

        const previous = colDef.cellStyle;

        return {
            ...colDef,
            cellStyle: (
                params: CellClassParams<AgGridRowData, string | null>,
            ): CellStyle | null | undefined => {
                const base = typeof previous === "function" ? previous(params) : (previous ?? null);

                const colId = params.colDef?.colId;
                if (!params.data || !colId) {
                    return base;
                }

                const fragment = evaluateConditionalFormatting(config, triggers, params.data, colId);
                if (!fragment) {
                    return base;
                }

                return { ...(base ?? {}), ...fragment };
            },
        };
    };
