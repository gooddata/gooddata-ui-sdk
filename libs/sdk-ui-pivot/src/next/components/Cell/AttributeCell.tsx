// (C) 2025-2026 GoodData Corporation

import { useCallback, useEffect, useRef } from "react";

import { type ICellRendererParams } from "ag-grid-enterprise";
import { type IntlShape } from "react-intl";

import { type AttributeDisplayFormType } from "@gooddata/sdk-model";
import {
    type ITableAttributeColumnDefinition,
    type ITableAttributeHeaderValue,
    emptyHeaderTitleFromIntl,
    isTableGrandTotalHeaderValue,
    isTableTotalHeaderValue,
} from "@gooddata/sdk-ui";

import { useTotalLabelContext } from "../../context/TotalLabelContext.js";
import {
    isFirstTotalHeaderAttributeCell,
    resolveTotalLabelTargetFromTotalLabelCellData,
} from "../../features/aggregations/totalLabelTarget.js";
import { shouldGroupAttribute } from "../../features/columns/shared.js";
import { e } from "../../features/styling/bem.js";
import {
    getPivotCellAttributeImageTestIdProps,
    getPivotCellTestIdPropsFromCellTypes,
} from "../../testing/dataTestIdGenerators.js";
import { type CellTypes } from "../../types/cellRendering.js";

import { ImageCell } from "./ImageCell.js";

const IMAGE_LABEL_TYPE: AttributeDisplayFormType = "GDC.image";

/**
 * Gets the primary label value from the cell data.
 *
 * The attribute header item contains:
 * - `uri`: The primary label's value (e.g., "Product Name")
 *
 * @param cellData - The cell data containing the attribute header
 * @returns The primary label value from uri, or undefined if not available
 */
function getPrimaryLabelValue(cellData: ITableAttributeHeaderValue | undefined): string | undefined {
    return cellData?.value?.attributeHeaderItem?.uri ?? undefined;
}

/**
 * Cell renderer for attributes.
 *
 * @internal
 */
export function AttributeCell(
    params: ICellRendererParams & {
        intl: IntlShape;
        colId: string;
        columnDefinition: ITableAttributeColumnDefinition;
        cellTypes?: CellTypes;
    },
) {
    const value = params.value;
    const colId = params.colId;
    const columnDefinition = params.columnDefinition;
    const dataTestIdProps = getPivotCellTestIdPropsFromCellTypes(params.cellTypes);

    const cellData = params.data?.cellDataByColId?.[colId];
    const isTotalHeaderCell =
        !!cellData && (isTableTotalHeaderValue(cellData) || isTableGrandTotalHeaderValue(cellData));
    const isFirstTotalCell = isTotalHeaderCell && isFirstTotalHeaderAttributeCell(params.data, colId);

    const { enabled: totalLabelsEditable } = useTotalLabelContext();
    const isRenameableTotalCell =
        totalLabelsEditable && isFirstTotalCell && !!resolveTotalLabelTargetFromTotalLabelCellData(cellData);

    const cellRef = useRef<HTMLElement | null>(null);
    const setCellRef = useCallback((node: HTMLElement | null) => {
        cellRef.current = node;
    }, []);
    useEffect(() => {
        const gridCell = cellRef.current?.closest<HTMLElement>("[role='gridcell']");
        if (!gridCell || !isRenameableTotalCell) {
            return;
        }

        const previousAriaHasPopup = gridCell.getAttribute("aria-haspopup");
        gridCell.setAttribute("aria-haspopup", "menu");
        return () => {
            if (previousAriaHasPopup === null) {
                gridCell.removeAttribute("aria-haspopup");
            } else {
                gridCell.setAttribute("aria-haspopup", previousAriaHasPopup);
            }
        };
    }, [isRenameableTotalCell]);

    // 1) Empty value handling - must be checked first
    if (!value) {
        return <span {...dataTestIdProps}>{emptyHeaderTitleFromIntl(params.intl)}</span>;
    }

    // If this is a total/grand-total header cell, render the title only in the first attribute
    // column that carries the total header in this row (see isFirstTotalHeaderAttributeCell) -
    // hide it in the others.
    if (isTotalHeaderCell && !isFirstTotalCell) {
        return <span {...dataTestIdProps} />;
    }

    // 3) Image rendering: check if attribute should be rendered as an image
    // Images respect text wrapping configuration:
    // - When text wrapping is OFF: images are constrained to default row height (28px)
    // - When text wrapping is ON: AG Grid adds .ag-cell-auto-height class, allowing images to expand
    const attributeDescriptor = columnDefinition.attributeDescriptor;
    const labelType = attributeDescriptor?.attributeHeader.labelType;
    const isImage = labelType === IMAGE_LABEL_TYPE;

    if (isImage) {
        const primaryLabelValue = getPrimaryLabelValue(cellData as ITableAttributeHeaderValue);

        return (
            <div
                ref={setCellRef}
                className={e("cell-image-wrapper")}
                {...getPivotCellAttributeImageTestIdProps()}
            >
                <ImageCell src={value} alt={primaryLabelValue} />
            </div>
        );
    }

    // 4) Grouping suppression: do not render repeating attribute values
    const rowIndex = params.node.rowIndex;
    const previousRow = rowIndex ? params.api.getDisplayedRowAtIndex(rowIndex - 1) : null;

    if (!previousRow?.data) {
        return (
            <span ref={setCellRef} {...dataTestIdProps}>
                {value}
            </span>
        );
    }

    const shouldGroup = shouldGroupAttribute(params, previousRow, columnDefinition);

    if (shouldGroup) {
        return <span {...dataTestIdProps} />;
    }

    return (
        <span ref={setCellRef} {...dataTestIdProps}>
            {value}
        </span>
    );
}
