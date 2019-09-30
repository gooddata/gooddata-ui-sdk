// (C) 2007-2019 GoodData Corporation

import {
    getMappingHeaderIdentifier,
    getMappingHeaderLocalIdentifier,
    getMappingHeaderName,
    getMappingHeaderUri,
} from "../../base/helpers/mappingHeader";
import { IDrillEventIntersectionElement } from "../../base/interfaces/DrillEvents";
import { IMappingHeader } from "../../base/interfaces/MappingHeader";
import { getAttributeElementIdFromAttributeElementUri } from "../../base/helpers/getAttributeElementIdFromAttributeElementUri";
import { createDrillIntersectionElement } from "../../highcharts";
import { getIdsFromUri } from "./agGridUtils";
import { COLUMN_ATTRIBUTE_COLUMN, MEASURE_COLUMN, ROW_ATTRIBUTE_COLUMN } from "./agGridConst";
import { ColDef } from "ag-grid-community";
import { IGridHeader } from "./agGridTypes";
import {
    DataViewFacade,
    IAttributeHeader,
    IHeader,
    IResultHeaderItem,
    IResultMeasureHeaderItem,
    isMeasureGroupHeader,
    isResultAttributeHeaderItem,
    isResultMeasureHeaderItem,
} from "@gooddata/sdk-backend-spi";
import { measureUriOrQualifier } from "../../base/helpers/measures";
import get = require("lodash/get");

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

export const getDrillIntersection = (
    drillItems: IMappingHeader[],
    dv: DataViewFacade,
): IDrillEventIntersectionElement[] => {
    // Drilling needs refactoring: all '' should be replaced by null (breaking change)
    // intersection consists of
    //     0..1 measure
    //     0..1 row attribute and row attribute value
    //     0..n column attribute and column attribute values
    return drillItems.map((drillItem: IMappingHeader) => {
        if (isResultAttributeHeaderItem(drillItem)) {
            const id = getAttributeElementIdFromAttributeElementUri(drillItem.attributeHeaderItem.uri);
            return createDrillIntersectionElement(
                id,
                getMappingHeaderName(drillItem),
                getMappingHeaderUri(drillItem),
                "",
            );
        }

        const headerLocalIdentifier = getMappingHeaderLocalIdentifier(drillItem);
        const headerIdentifier = getMappingHeaderIdentifier(drillItem) || "";
        const measure = dv.masterMeasureForDerived(headerLocalIdentifier);
        const uriAndIdentifier = measureUriOrQualifier(measure);

        const headerUri = getMappingHeaderUri(drillItem) || "";
        const uri = (uriAndIdentifier && uriAndIdentifier.uri) || headerUri;
        const identifier = (uriAndIdentifier && uriAndIdentifier.identifier) || headerIdentifier;
        const id = headerLocalIdentifier || headerIdentifier;

        return createDrillIntersectionElement(id, getMappingHeaderName(drillItem), uri, identifier);
    });
};

export const getMeasureDrillItem = (responseHeaders: IHeader[], header: IResultMeasureHeaderItem) => {
    const measureGroupHeader = responseHeaders.find(isMeasureGroupHeader);

    return get(measureGroupHeader, ["measureGroupHeader", "items", header.measureHeaderItem.order], null);
};

export const assignDrillItemsAndType = (
    header: IGridHeader,
    currentHeader: IResultHeaderItem,
    responseHeaders: IHeader[],
    headerIndex: number,
    drillItems: IMappingHeader[],
) => {
    if (isResultAttributeHeaderItem(currentHeader)) {
        header.type = COLUMN_ATTRIBUTE_COLUMN;
        // attribute value uri
        drillItems.push(currentHeader);
        // attribute uri and identifier
        const attributeResponseHeader = responseHeaders[
            headerIndex % responseHeaders.length
        ] as IAttributeHeader;
        drillItems.push(attributeResponseHeader);
        // This is where we could assign drillItems if we want to start drilling on column headers
        // It needs to have an empty array for some edge cases like column attributes without measures
    } else if (isResultMeasureHeaderItem(currentHeader)) {
        // measure uri and identifier
        header.type = MEASURE_COLUMN;
        drillItems.push(getMeasureDrillItem(responseHeaders, currentHeader));
        header.drillItems = drillItems;
        header.measureIndex = currentHeader.measureHeaderItem.order;
    }
};
