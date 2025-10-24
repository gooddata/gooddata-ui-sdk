// (C) 2025 GoodData Corporation

import { useElementSize } from "../../hooks/useElementSize.js";
import { UiAsyncTableColumnDefinitionResponsive } from "../types.js";
import { CHECKBOX_COLUMN_WIDTH, SCROLLBAR_WIDTH } from "./constants.js";
import { computeProportionalWidth, getColumnWidth } from "./utils.js";

/**
 * Simple hook to handle responsive columns based on container width.
 * Hides columns with defined minimal width that don't fit.
 * Static columns (renderMenu, checkbox) maintain fixed width and are excluded from proportional resizing.
 *
 * @internal
 */
export function useAsyncTableResponsiveColumns<T>(
    columns: Array<UiAsyncTableColumnDefinitionResponsive<T>>,
    hasCheckbox = false,
) {
    const { ref, width: containerWidth } = useElementSize<HTMLDivElement>();
    const isLargeRow = columns.some((column) => column.getMultiLineTextContent);

    const { flexibleWidth, staticWidth } = columns.reduce(
        (acc, column) => {
            if (column.renderMenu) {
                acc.staticWidth += getColumnWidth(true, isLargeRow);
            } else {
                acc.flexibleWidth += column.width ?? 0;
            }
            return acc;
        },
        {
            flexibleWidth: 0,
            staticWidth: (hasCheckbox ? CHECKBOX_COLUMN_WIDTH : 0) + SCROLLBAR_WIDTH,
        },
    );

    const totalOriginalWidth = flexibleWidth + staticWidth;

    // If we have enough space or no container width yet, return original columns
    if (!containerWidth || containerWidth >= totalOriginalWidth) {
        return {
            ref,
            columns,
        };
    }

    const availableFlexibleWidth = containerWidth - staticWidth;

    // Filter: keep all renderMenu columns, and flexible columns that meet minWidth
    const validColumns = columns.filter((column) => {
        if (column.renderMenu) return true;

        const originalWidth = column.width ?? 0;
        const proportionalWidth = computeProportionalWidth(
            originalWidth,
            availableFlexibleWidth,
            flexibleWidth,
        );
        return !column.minWidth || proportionalWidth >= column.minWidth;
    });

    // Recalculate width sum for valid flexible columns (exclude renderMenu)
    const validFlexibleWidth = validColumns.reduce((acc, column) => {
        if (column.renderMenu) return acc;
        return acc + (column.width ?? 0);
    }, 0);

    // Resize flexible columns
    const finalColumns = validColumns.map((column) => {
        if (column.renderMenu) return column;

        const originalWidth = column.width ?? 0;
        const proportionalWidth = computeProportionalWidth(
            originalWidth,
            availableFlexibleWidth,
            validFlexibleWidth,
        );

        return {
            ...column,
            width: proportionalWidth,
        };
    });

    return {
        ref,
        columns: finalColumns,
    };
}
