// (C) 2025 GoodData Corporation

import { useCallback } from "react";

import { type ProcessCellForExportParams } from "ag-grid-enterprise";
import { useIntl } from "react-intl";

import { emptyHeaderTitleFromIntl, isTableAttributeHeaderValue } from "@gooddata/sdk-ui";

import { type AgGridProps } from "../types/agGrid.js";
import { type AgGridRowData } from "../types/internal.js";

/**
 * Returns ag-grid props with clipboard processing applied.
 *
 * This hook intercepts the copy operation (Cmd+C / Ctrl+C) to ensure empty values
 * are copied with their display text instead of as empty strings:
 * - Empty attribute values are copied as "(empty value)" or localized equivalent
 * - Empty metric values are copied intentionally as empty
 *
 * @internal
 */
export function useClipboardProps(): (agGridReactProps: AgGridProps) => AgGridProps {
    const intl = useIntl();

    const processCellForClipboard = useCallback(
        (params: ProcessCellForExportParams<AgGridRowData, string | null>) => {
            const { value, column, node } = params;

            // If there's a value, return it as-is
            if (value) {
                return value;
            }

            // Check if node exists
            if (!node) {
                return value;
            }

            // Get cell data to determine the type
            const colId = column.getColId();
            const cellData = node.data?.cellDataByColId?.[colId];

            if (!cellData) {
                return value;
            }

            // Check if this is an attribute cell with empty value
            if (isTableAttributeHeaderValue(cellData)) {
                return emptyHeaderTitleFromIntl(intl);
            }

            return value;
        },
        [intl],
    );

    return useCallback(
        (agGridReactProps: AgGridProps) => {
            return {
                ...agGridReactProps,
                processCellForClipboard,
            };
        },
        [processCellForClipboard],
    );
}
