// (C) 2007-2020 GoodData Corporation

import { getMappingHeaderUri, IMappingHeader } from "@gooddata/sdk-ui";
import { getIdsFromUri } from "./agGridUtils";
import { COLUMN_ATTRIBUTE_COLUMN, MEASURE_COLUMN, ROW_ATTRIBUTE_COLUMN } from "./agGridConst";
import { ColDef } from "@ag-grid-community/all-modules";
import { IGridHeader } from "./agGridTypes";
import {
    IAttributeDescriptor,
    IDimensionItemDescriptor,
    IResultHeader,
    IResultMeasureHeader,
    isMeasureGroupDescriptor,
    isResultAttributeHeader,
    isResultMeasureHeader,
} from "@gooddata/sdk-backend-spi";
import get from "lodash/get";

export const getDrillRowData = (leafColumnDefs: ColDef[], rowData: { [key: string]: any }) => {
    return leafColumnDefs.reduce((drillRow, colDef: ColDef) => {
        const { type } = colDef;
        // colDef without field is a utility column (e.g. top column label)
        if (colDef.field) {
            if (type === MEASURE_COLUMN) {
                return [...drillRow, rowData[colDef.field]];
            }
            const drillItem = get(rowData, ["headerItemMap", colDef.field]);
            if (drillItem && (type === COLUMN_ATTRIBUTE_COLUMN || type === ROW_ATTRIBUTE_COLUMN)) {
                const drillItemUri = getMappingHeaderUri(drillItem);
                return [
                    ...drillRow,
                    {
                        // Unlike fields, drilling data should not be sanitized, because it is not used in HTML properties
                        id: getIdsFromUri(drillItemUri, false)[1],
                        name: rowData[colDef.field],
                    },
                ];
            }
        }
        return drillRow;
    }, []);
};

export const getMeasureDrillItem = (
    responseHeaders: IDimensionItemDescriptor[],
    header: IResultMeasureHeader,
) => {
    const measureGroupHeader = responseHeaders.find(isMeasureGroupDescriptor);

    return get(measureGroupHeader, ["measureGroupHeader", "items", header.measureHeaderItem.order], null);
};

export const assignDrillItemsAndType = (
    header: IGridHeader,
    currentHeader: IResultHeader,
    responseHeaders: IDimensionItemDescriptor[],
    headerIndex: number,
    drillItems: IMappingHeader[],
) => {
    if (isResultAttributeHeader(currentHeader)) {
        header.type = COLUMN_ATTRIBUTE_COLUMN;
        // attribute value uri
        drillItems.push(currentHeader);
        // attribute uri and identifier
        const attributeDescriptor = responseHeaders[
            headerIndex % responseHeaders.length
        ] as IAttributeDescriptor;
        drillItems.push(attributeDescriptor);
        // This is where we could assign drillItems if we want to start drilling on column headers
        // It needs to have an empty array for some edge cases like column attributes without measures
    } else if (isResultMeasureHeader(currentHeader)) {
        // measure uri and identifier
        header.type = MEASURE_COLUMN;
        drillItems.push(getMeasureDrillItem(responseHeaders, currentHeader));
        header.drillItems = drillItems;
        header.measureIndex = currentHeader.measureHeaderItem.order;
    }
};
