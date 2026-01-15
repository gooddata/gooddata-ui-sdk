// (C) 2007-2026 GoodData Corporation

import { range } from "lodash-es";
import { type IntlShape } from "react-intl";
import { invariant } from "ts-invariant";

import {
    type IAttributeDescriptor,
    type IResultAttributeHeader,
    MeasureGroupIdentifier,
    isAttributeDescriptor,
    isResultTotalHeader,
} from "@gooddata/sdk-model";
import { type DataViewFacade, getTotalInfo } from "@gooddata/sdk-ui";

import { createColDefsFromTableDescriptor } from "./colDefFactory.js";
import {
    type AnyCol,
    type DataCol,
    type IMixedHeadersCol,
    type IMixedValuesCol,
    type IRootCol,
    type IScopeCol,
    type ISeriesCol,
    type ISliceCol,
    type ISliceMeasureCol,
    type LeafDataCol,
    type TableColDefs,
    type TableCols,
    isSeriesCol,
} from "./tableDescriptorTypes.js";
import { type IPivotTableConfig } from "../../publicTypes.js";
import { getDataViewSeriesDescriptors } from "../utils.js";

type ColumnGroupLevel = {
    pkToGroup: Record<string, IScopeCol>;
    groups: IScopeCol[];
};

type GroupingOperationResult = {
    groupingAttributes: IAttributeDescriptor[];
    rootColumns: DataCol[];
    leafColumns: ISeriesCol[] | IScopeCol[];
    allColumns: DataCol[];
};

function createDataColRootGroup(scopingAttributes: IAttributeDescriptor[]): IRootCol {
    return {
        type: "rootCol",
        id: "root",
        fullIndexPathToHere: [0],
        children: [],
        groupingAttributes: scopingAttributes,
    };
}

function colDescriptorAndHeaders(col: LeafDataCol): {
    attributeHeaders: IResultAttributeHeader[];
    attributeDescriptors: IAttributeDescriptor[];
} {
    if (isSeriesCol(col)) {
        invariant(col.seriesDescriptor.attributeHeaders);
        invariant(col.seriesDescriptor.attributeDescriptors);

        return {
            attributeHeaders: col.seriesDescriptor.attributeHeaders,
            attributeDescriptors: col.seriesDescriptor.attributeDescriptors,
        };
    } else {
        return {
            attributeHeaders: col.headersToHere,
            attributeDescriptors: col.descriptorsToHere,
        };
    }
}

/**
 * Given a list of leaf columns and number of grouping levels, this function will create the
 * column groups and establish linkage between them.
 *
 * It does this by traversing the leaf columns and for each of the leaf column iterates over all
 * scoping information for the data series backing the column. The scoping information is what code
 * needs to create/populate the groups.
 *
 * The scoping can be done on multiple 'levels' from root towards the leaves. So
 * for each attribute code checks whether a group already exists on that level, if not it creates one and
 * remembers that group as parentGroup for the next iteration.
 */
function groupColumns(
    bottomColumns: ISeriesCol[] | IScopeCol[],
    scopingAttributes: IAttributeDescriptor[],
    limitLevels?: number,
): GroupingOperationResult {
    // this function should not be called if there is no need to create any groups
    invariant(scopingAttributes.length > 0);

    const levels = limitLevels === undefined ? scopingAttributes.length : limitLevels;
    const root = createDataColRootGroup(scopingAttributes);

    // initialize grouping levels where code will keep pushing the new/updated groups. it is
    // the pkToGroup is here for quicker lookups. the groups list is there because the result
    // must be list of groups in order which they were created.
    const columnGroupLevels: ColumnGroupLevel[] = range(levels).map((_) => ({
        pkToGroup: {},
        groups: [],
    }));
    const allColumns: DataCol[] = [...bottomColumns, root];

    let groupId = 0;
    for (const leaf of bottomColumns) {
        const { attributeHeaders, attributeDescriptors } = colDescriptorAndHeaders(leaf);

        // if any of these bomb then there possibly a bug in the data access infrastructure. that's because
        // the code can get here only if there are some data series scoping attributes. and in that case,
        // by contract each series will contain non empty attributeHeaders and attributeDescriptors
        invariant(attributeHeaders !== undefined);
        invariant(attributeDescriptors !== undefined);

        let parentGroup: DataCol = root;
        let pathToGroup: string = "";

        for (let level = 0; level < levels; level++) {
            // see if a group for attribute element on the current level already exists (it will happen
            // when there are multiple measures in the table). if it exists, remember it as parentGroup
            // for the next iteration. if this is first
            const resultHeader = attributeHeaders[level];
            const currentId = isResultTotalHeader(resultHeader)
                ? resultHeader?.totalHeaderItem?.type
                : resultHeader?.attributeHeaderItem?.uri;

            pathToGroup += currentId;

            const groupLevel = columnGroupLevels[level];
            let currentGroup: IScopeCol | undefined = groupLevel.pkToGroup[pathToGroup];

            const { isTotal, isSubtotal } = getTotalInfo(attributeHeaders);

            if (!currentGroup) {
                const fullIndexPathToHere: number[] = parentGroup
                    ? [...parentGroup.fullIndexPathToHere, parentGroup.children.length]
                    : [groupLevel.groups.length];

                currentGroup = {
                    type: "scopeCol",
                    id: `g_${groupId++}`,
                    attributeDescriptor: attributeDescriptors[level],
                    // NOTE: group of totals gets the measure index stored in the first total
                    header: attributeHeaders[level],
                    descriptorsToHere: attributeDescriptors.slice(0, level),
                    headersToHere: attributeHeaders.slice(0, level),
                    children: [],
                    fullIndexPathToHere,
                    isTotal,
                    isSubtotal,
                };

                groupLevel.pkToGroup[pathToGroup] = currentGroup;
                groupLevel.groups.push(currentGroup);
                allColumns.push(currentGroup);

                if (parentGroup) {
                    parentGroup.children.push(currentGroup);
                }
            }

            parentGroup = currentGroup;
        }

        // now insert the leaf itself. if code gets here and blows up then there is something
        // very wrong in the funky loop above.
        invariant(parentGroup !== undefined);

        leaf.fullIndexPathToHere = [...parentGroup.fullIndexPathToHere, parentGroup.children.length];
        parentGroup.children.push(leaf);
    }

    return {
        groupingAttributes: scopingAttributes,
        rootColumns: [root],
        allColumns: allColumns,
        leafColumns: bottomColumns,
    };
}

/**
 * This function creates bottom-most column descriptors from column attributes. It essentially creates the bottom-most
 * {@link IScopeCol} which would normally host the measure columns.
 */
function createColumnDescriptorsWhenNoMeasuresInColumns(
    dv: DataViewFacade,
    isTransposed?: boolean,
): GroupingOperationResult {
    const descriptors = dv.meta().attributeDescriptorsForDim(1);
    const headers = dv.meta().attributeHeadersForDim(1);
    const numberOfColumns = headers[0]?.length ?? 0;
    const numberOfAttributes = descriptors.length;

    if (numberOfAttributes === 0) {
        return {
            groupingAttributes: [],
            leafColumns: [],
            rootColumns: [],
            allColumns: [],
        };
    }

    // for each attribute descriptor, there must be one array in the headers.
    invariant(descriptors.length === headers.length);

    const bottom: IScopeCol[] = [];

    const seriesDescriptor = getDataViewSeriesDescriptors(dv);
    for (let colIdx = 0; colIdx < numberOfColumns; colIdx++) {
        const attributeHeaders = headers.map((header) => header[colIdx]);
        const { isTotal, isSubtotal } = getTotalInfo(attributeHeaders);

        bottom.push({
            type: "scopeCol",
            id: `cg_${colIdx}`,
            children: [],
            fullIndexPathToHere: [colIdx],
            header: headers[numberOfAttributes - 1][colIdx],
            headersToHere: headers.slice(0, numberOfAttributes - 1).map((attrHeaders) => attrHeaders[colIdx]),
            attributeDescriptor: descriptors[numberOfAttributes - 1],
            descriptorsToHere: descriptors.slice(0, numberOfAttributes - 1),
            isTotal,
            isSubtotal,
            ...(isTransposed
                ? {
                      measureDescriptors: seriesDescriptor.map(
                          (serieDescriptor) => serieDescriptor.measureDescriptor,
                      ),
                  }
                : {}),
        });
    }

    // do the usual grouping logic with one tweak: do not process the last grouping level because code above
    // just created that.
    return groupColumns(bottom, descriptors, numberOfAttributes - 1);
}

function createColumnDescriptorsFromDataSeries(dv: DataViewFacade): GroupingOperationResult {
    const leafColumns: ISeriesCol[] = dv
        .data()
        .series()
        .toArray()
        .map((series, idx) => {
            return {
                type: "seriesCol",
                id: `c_${idx}`,
                index: idx,
                seriesId: series.id,
                seriesDescriptor: series.descriptor,
                children: [],
                fullIndexPathToHere: [idx],
            };
        });

    const scopingAttributes = dv.data().series().scopingAttributes ?? [];

    if (scopingAttributes.length === 0) {
        return {
            groupingAttributes: [],
            leafColumns,
            rootColumns: leafColumns,
            allColumns: leafColumns,
        };
    }

    return groupColumns(leafColumns, scopingAttributes);
}

function createRowDescriptor(attributeDescriptor: IAttributeDescriptor, index: number): ISliceCol {
    return {
        type: "sliceCol",
        id: `r_${index}`,
        index: index,
        attributeDescriptor,
        fullIndexPathToHere: [index],
        effectiveTotals: attributeDescriptor.attributeHeader.totalItems ?? [],
    };
}

function createRowDescriptors(dv: DataViewFacade): ISliceCol[] {
    if (getMeasureGroupDimensionIndex(dv) === 0) {
        return dv.meta().attributeDescriptorsForDim(0).map(createRowDescriptor);
    } else {
        return dv.data().slices().descriptors.filter(isAttributeDescriptor).map(createRowDescriptor);
    }
}

function createColumnDescriptors(dv: DataViewFacade, isTransposed: boolean): GroupingOperationResult {
    if (dv.meta().measureDescriptors().length === 0 && dv.meta().dimensions().length === 2) {
        /*
         * Columns for a table without any measures but with attributes in both dimensions cannot be created
         * using just the data access infrastructure. That is because data access operates with a concept of
         * data series that are calculated for some measure value. It does not cover the concept of having
         * 'table' without any actual computed data and only with attribute headers.
         *
         * We can perhaps enhance that infra one day if there is really a valid need. It is pretty much a corner
         * case.
         *
         * The table descriptor factory handles this case by extracting info from the second dimension on its own.
         */
        return createColumnDescriptorsWhenNoMeasuresInColumns(dv);
    }

    if (getMeasureGroupDimensionIndex(dv) === 0) {
        return createColumnDescriptorsWhenNoMeasuresInColumns(dv, isTransposed);
    }

    return createColumnDescriptorsFromDataSeries(dv);
}

function getMeasureGroupDimensionIndex(dv: DataViewFacade) {
    return dv.definition.dimensions.findIndex((dimension) =>
        dimension.itemIdentifiers.includes(MeasureGroupIdentifier),
    );
}

function createMeasureColumnDescriptors(dv: DataViewFacade, rows: ISliceCol[]): ISliceMeasureCol[] {
    if (getMeasureGroupDimensionIndex(dv) !== 0) {
        return [];
    }
    const idx = rows.length;
    // always just one measure column if measures are in row dimension
    return [
        {
            type: "sliceMeasureCol",
            id: `r_${idx}`,
            index: idx,
            fullIndexPathToHere: [idx],
            seriesDescriptor: getDataViewSeriesDescriptors(dv),
        },
    ];
}

function createMixedHeadersColumnDescriptors(): IMixedHeadersCol[] {
    const idx = 0;
    // always just one column with mixed attribute and measure headers
    return [
        {
            type: "mixedHeadersCol",
            id: `amh_${idx}`,
            index: idx,
            fullIndexPathToHere: [idx],
        },
    ];
}

function createMixedValuesColumnDescriptors(dv: DataViewFacade): IMixedValuesCol[] {
    return dv
        .data()
        .slices()
        .toArray()
        .map((slice, idx) => {
            const attributeHeaders = slice.descriptor.headers;
            const { isTotal, isSubtotal } = getTotalInfo(attributeHeaders as IResultAttributeHeader[]);

            return {
                type: "mixedValuesCol",
                id: `amv_${idx}`,
                index: idx,
                fullIndexPathToHere: [idx],
                isTotal,
                isSubtotal,
            };
        });
}

function createMeasureValuesColumnDescriptors(dv: DataViewFacade): IMixedValuesCol[] {
    const idx = 0;
    // always just one column with mixed attribute and measure headers
    return [
        {
            type: "mixedValuesCol",
            id: `amv_${idx}`,
            index: idx,
            fullIndexPathToHere: [idx],
            seriesDescriptor: getDataViewSeriesDescriptors(dv),
        },
    ];
}

function createTableHeaders(
    dv: DataViewFacade,
    isTransposed: boolean,
    config?: IPivotTableConfig,
): TableCols {
    const idToDescriptor: Record<string, AnyCol> = {};

    if (config?.columnHeadersPosition === "left" && isTransposed) {
        const mixedHeadersCols = createMixedHeadersColumnDescriptors();
        const mixedValuesCols = createMixedValuesColumnDescriptors(dv);

        mixedHeadersCols.forEach((header) => (idToDescriptor[header.id] = header));
        mixedValuesCols.forEach((header) => (idToDescriptor[header.id] = header));

        const scopingAttributes = dv.data().slices().descriptors ?? [];

        return {
            sliceCols: [],
            sliceMeasureCols: [],
            rootDataCols: [],
            leafDataCols: [],
            mixedHeadersCols,
            mixedValuesCols,
            idToDescriptor,
            scopingAttributes: scopingAttributes.filter(isAttributeDescriptor),
        };
    } else {
        const rows: ISliceCol[] = createRowDescriptors(dv);
        const measureColumns = createMeasureColumnDescriptors(dv, rows);
        let mixedHeadersCols: IMixedHeadersCol[] = [];
        if (config?.columnHeadersPosition === "left") {
            mixedHeadersCols = createMixedHeadersColumnDescriptors();
        }
        const { rootColumns, leafColumns, allColumns, groupingAttributes } = createColumnDescriptors(
            dv,
            isTransposed,
        );

        rows.forEach((header) => (idToDescriptor[header.id] = header));
        measureColumns.forEach((header) => (idToDescriptor[header.id] = header));

        const addMetricValueColumn = measureColumns.length > 0 && groupingAttributes.length === 0;
        const mixedValuesCols = addMetricValueColumn ? createMeasureValuesColumnDescriptors(dv) : [];
        mixedValuesCols.forEach((header) => (idToDescriptor[header.id] = header));
        mixedHeadersCols.forEach((header) => (idToDescriptor[header.id] = header));

        allColumns.forEach((header) => (idToDescriptor[header.id] = header));

        return {
            sliceCols: rows,
            sliceMeasureCols: measureColumns,
            rootDataCols: rootColumns,
            leafDataCols: leafColumns,
            mixedHeadersCols,
            mixedValuesCols,
            idToDescriptor,
            scopingAttributes: groupingAttributes,
        };
    }
}

//
//
//

/**
 * Constructs a table header descriptors and ag-grid colDefs using result metadata contained in the provided DataViewFacade.
 *
 * This function is not intended for stand-alone usage. It used during construction of TableDescriptor.
 *
 * @param dv - data view facade
 * @param emptyHeaderTitle - what to show for title of headers with empty title
 * @param config - optional pivot configuration
 * @internal
 */
export function createHeadersAndColDefs(
    dv: DataViewFacade,
    emptyHeaderTitle: string,
    isTransposed: boolean,
    config?: IPivotTableConfig,
    intl?: IntlShape,
): { headers: TableCols; colDefs: TableColDefs } {
    const headers = createTableHeaders(dv, isTransposed, config);
    const colDefs = createColDefsFromTableDescriptor(
        headers,
        dv.meta().effectiveSortItems(),
        emptyHeaderTitle,
        isTransposed,
        config,
        intl,
    );

    return { headers, colDefs };
}
