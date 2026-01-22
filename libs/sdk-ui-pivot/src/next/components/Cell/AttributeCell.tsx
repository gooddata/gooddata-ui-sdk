// (C) 2025-2026 GoodData Corporation

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

import { ImageCell } from "./ImageCell.js";
import { getAttributeColIds, shouldGroupAttribute } from "../../features/columns/shared.js";
import { e } from "../../features/styling/bem.js";
import {
    getPivotCellAttributeImageTestIdProps,
    getPivotCellTestIdPropsFromCellTypes,
} from "../../testing/dataTestIdGenerators.js";
import { type CellTypes } from "../../types/cellRendering.js";

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

    // 1) Empty value handling - must be checked first
    if (!value) {
        return <span {...dataTestIdProps}>{emptyHeaderTitleFromIntl(params.intl)}</span>;
    }

    // 2) Total/grand-total header visibility: render title only in the first attribute column
    // If this is a total/grand-total header cell, render the title only in the first
    // attribute column that carries the total header in this row. Hide it in others.
    const cellData = params.data?.cellDataByColId?.[colId];
    const isTotalHeaderCell =
        !!cellData && (isTableTotalHeaderValue(cellData) || isTableGrandTotalHeaderValue(cellData));

    if (isTotalHeaderCell) {
        const attributeColIds = getAttributeColIds(params.data);

        // Find the first attribute column (by columnIndex) that has a total/grand-total header in this row
        const firstTotalAttrColId = attributeColIds
            .filter((id) => {
                const c = params.data?.cellDataByColId?.[id];
                return !!c && (isTableTotalHeaderValue(c) || isTableGrandTotalHeaderValue(c));
            })
            .sort((a, b) => {
                const ai = params.data!.cellDataByColId![a].columnDefinition.columnIndex;
                const bi = params.data!.cellDataByColId![b].columnDefinition.columnIndex;
                return ai - bi;
            })[0];

        if (firstTotalAttrColId && firstTotalAttrColId !== params.colId) {
            return <span {...dataTestIdProps} />;
        }
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
            <div className={e("cell-image-wrapper")} {...getPivotCellAttributeImageTestIdProps()}>
                <ImageCell src={value} alt={primaryLabelValue} />
            </div>
        );
    }

    // 4) Grouping suppression: do not render repeating attribute values
    const rowIndex = params.node.rowIndex;
    const previousRow = rowIndex ? params.api.getDisplayedRowAtIndex(rowIndex - 1) : null;

    if (!previousRow?.data) {
        return <span {...dataTestIdProps}>{value}</span>;
    }

    const shouldGroup = shouldGroupAttribute(params, previousRow, columnDefinition);

    if (shouldGroup) {
        return <span {...dataTestIdProps} />;
    }

    return <span {...dataTestIdProps}>{value}</span>;
}
