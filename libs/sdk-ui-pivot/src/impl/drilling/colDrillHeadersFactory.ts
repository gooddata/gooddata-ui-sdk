// (C) 2007-2022 GoodData Corporation
import {
    AnyCol,
    ScopeCol,
    SeriesCol,
    isScopeCol,
    isSeriesCol,
    isSliceCol,
    SliceCol,
} from "../structure/tableDescriptorTypes.js";
import { IMappingHeader } from "@gooddata/sdk-ui";
import { IAttributeDescriptor, isResultAttributeHeader } from "@gooddata/sdk-model";
import { invariant, InvariantError } from "ts-invariant";
import { IGridRow } from "../data/resultTypes.js";

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

export function createSliceColHeaders(col: SliceCol, row: IGridRow): IMappingHeader[] {
    const result: IMappingHeader[] = [];

    const attributeElement = row.headerItemMap[col.id];

    invariant(attributeElement, `unable to obtain attribute element for row of a slicing column ${col.id}`);
    invariant(isResultAttributeHeader(attributeElement), `bad header for row data ${col.id}`);

    result.push(attributeElement);
    result.push(col.attributeDescriptor);

    return result;
}

export function createDataColGroupHeaders(col: ScopeCol): IMappingHeader[] {
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
export function createDrillHeaders(col: AnyCol, row?: IGridRow): IMappingHeader[] {
    if (isSeriesCol(col)) {
        return createDataColLeafHeaders(col);
    } else if (isScopeCol(col)) {
        return createDataColGroupHeaders(col);
    } else if (isSliceCol(col)) {
        // if this bombs, then the client is not calling the function at the right time. in order
        // to construct drilling headers for a slice col, both the column & the row data must be
        // available because the attribute element (essential part) is only available in the data itself
        invariant(row);

        return createSliceColHeaders(col, row);
    }

    throw new InvariantError(`unable to obtain drill headers for column of type ${col.type}`);
}
