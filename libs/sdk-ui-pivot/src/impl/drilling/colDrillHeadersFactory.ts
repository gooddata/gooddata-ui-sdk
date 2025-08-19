// (C) 2007-2025 GoodData Corporation
import { InvariantError, invariant } from "ts-invariant";

import { IAttributeDescriptor, isResultAttributeHeader } from "@gooddata/sdk-model";
import { IMappingHeader } from "@gooddata/sdk-ui";

import { ColumnHeadersPosition } from "../../publicTypes.js";
import { IGridRow } from "../data/resultTypes.js";
import {
    AnyCol,
    MixedValuesCol,
    ScopeCol,
    SeriesCol,
    SliceCol,
    isMixedValuesCol,
    isScopeCol,
    isSeriesCol,
    isSliceCol,
} from "../structure/tableDescriptorTypes.js";

export function createDataColLeafHeaders(col: SeriesCol): IMappingHeader[] {
    const mappingHeaders: IMappingHeader[] = [];

    if (col.seriesDescriptor.attributeDescriptors) {
        col.seriesDescriptor.attributeDescriptors.forEach(
            (attributeDescriptor: IAttributeDescriptor, index: number) => {
                const attributeElementDescriptor = col.seriesDescriptor.attributeHeaders![index];
                mappingHeaders.push(attributeElementDescriptor);
                mappingHeaders.push(attributeDescriptor);
            },
        );
    }
    mappingHeaders.push(col.seriesDescriptor.measureDescriptor);

    return mappingHeaders;
}

/**
 * For transposed table add metric descriptor from row
 */
export function createScopeColWithMetricHeaders(
    col: ScopeCol,
    includeColGroupHeaders: boolean,
    row?: IGridRow,
): IMappingHeader[] {
    const mappingHeaders: IMappingHeader[] = includeColGroupHeaders ? createDataColGroupHeaders(col) : [];

    if (row?.measureDescriptor) {
        mappingHeaders.push(row.measureDescriptor);
    }

    return mappingHeaders;
}

export function createMixedValuesColHeaders(col: MixedValuesCol, row: IGridRow): IMappingHeader[] {
    const mappingHeaders: IMappingHeader[] = [];

    if (row.measureDescriptor) {
        mappingHeaders.push(row.measureDescriptor);
    }

    if (row.columnAttributeDescriptor) {
        const attributeElement = row.headerItemMap[col.id];

        mappingHeaders.push(attributeElement);
        mappingHeaders.push(row.columnAttributeDescriptor);
    }

    return mappingHeaders;
}

export function createSliceColHeaders(col: SliceCol, row: IGridRow): IMappingHeader[] {
    const result: IMappingHeader[] = [];

    if (!row.headerItemMap) {
        return [];
    }

    const attributeElement = row.headerItemMap[col.id];
    if (!attributeElement) {
        return [];
    }

    invariant(isResultAttributeHeader(attributeElement), `bad header for row data ${col.id}`);

    result.push(attributeElement);
    result.push(col.attributeDescriptor);

    return result;
}

function createDataColGroupHeaders(col: ScopeCol): IMappingHeader[] {
    const mappingHeaders: IMappingHeader[] = [];

    col.descriptorsToHere.forEach((descriptor, index) => {
        mappingHeaders.push(col.headersToHere[index]);
        mappingHeaders.push(descriptor);
    });

    mappingHeaders.push(col.header);
    mappingHeaders.push(col.attributeDescriptor);

    return mappingHeaders;
}

/**
 * Given column and optionally a grid row, this function will collect all descriptors and headers
 * to create 'mapping headers' that can be used for matching the column against drill predicates.
 *
 * Note: the row is optional and will only be needed when constructing headers for slicing columns (e.g. columns
 * that contain slicing attribute elements) - as the attribute element headers are in the row data.
 *
 * @param col - column to get mapping headers for
 * @param row - row
 */
export function createDrillHeaders(
    col: AnyCol,
    row: IGridRow,
    columnHeadersPosition: ColumnHeadersPosition,
    isTransposed: boolean,
): IMappingHeader[] {
    if (isSeriesCol(col)) {
        return createDataColLeafHeaders(col);
    } else if (isScopeCol(col)) {
        const includeColGroupHeaders = columnHeadersPosition === "top" && !isTransposed;
        return createScopeColWithMetricHeaders(col, includeColGroupHeaders, row);
    } else if (isSliceCol(col)) {
        // if this bombs, then the client is not calling the function at the right time. in order
        // to construct drilling headers for a slice col, both the column & the row data must be
        // available because the attribute element (essential part) is only available in the data itself
        invariant(row);

        return createSliceColHeaders(col, row);
    } else if (isMixedValuesCol(col)) {
        // if this bombs, then the client is not calling the function at the right time. in order
        // to construct drilling headers for a metrics in rows, both the column & the row data must be
        // available because the metric descriptor is only available in the data itself
        invariant(row);
        return createMixedValuesColHeaders(col, row);
    }

    throw new InvariantError(`unable to obtain drill headers for column of type ${col.type}`);
}
