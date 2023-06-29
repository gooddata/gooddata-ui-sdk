// (C) 2007-2022 GoodData Corporation
import { IntlShape } from "react-intl";
import { DataViewFacade, getTotalInfo } from "@gooddata/sdk-ui";
import {
    IAttributeDescriptor,
    IResultAttributeHeader,
    isAttributeDescriptor,
    isResultTotalHeader,
} from "@gooddata/sdk-model";
import { invariant } from "ts-invariant";
import range from "lodash/range.js";
import {
    AnyCol,
    DataCol,
    ScopeCol,
    SeriesCol,
    RootCol,
    isSeriesCol,
    SliceCol,
    TableColDefs,
    TableCols,
    LeafDataCol,
} from "./tableDescriptorTypes.js";
import { createColDefsFromTableDescriptor } from "./colDefFactory.js";

type ColumnGroupLevel = {
    pkToGroup: Record<string, ScopeCol>;
    groups: ScopeCol[];
};

type GroupingOperationResult = {
    groupingAttributes: IAttributeDescriptor[];
    rootColumns: DataCol[];
    leafColumns: SeriesCol[] | ScopeCol[];
    allColumns: DataCol[];
};

function createDataColRootGroup(scopingAttributes: IAttributeDescriptor[]): RootCol {
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
 * The scoping can be done on multiple 'levels' from from root towards the leaves. So
 * for each attribute code checks whether a group already exists on that level, if not it creates one and
 * remembers that group as parentGroup for the next iteration.
 *
 */
function groupColumns(
    bottomColumns: SeriesCol[] | ScopeCol[],
    scopingAttributes: IAttributeDescriptor[],
    limitLevels?: number,
): GroupingOperationResult {
    // this function should not be called if there is no need to create any groups
    invariant(scopingAttributes.length > 0);

    const levels = limitLevels !== undefined ? limitLevels : scopingAttributes.length;
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
            let currentGroup: ScopeCol | undefined = groupLevel.pkToGroup[pathToGroup];

            const { isTotal, isSubtotal } = getTotalInfo(attributeHeaders);

            if (!currentGroup) {
                const fullIndexPathToHere: number[] = parentGroup
                    ? [...parentGroup.fullIndexPathToHere, parentGroup.children.length]
                    : [groupLevel.groups.length];

                currentGroup = {
                    type: "scopeCol",
                    id: `g_${groupId++}`,
                    attributeDescriptor: attributeDescriptors![level],
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
 * {@link ScopeCol} which would normally host the measure columns.
 */
function createColumnDescriptorsWhenNoMeasures(dv: DataViewFacade): GroupingOperationResult {
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

    const bottom: ScopeCol[] = [];
    for (let colIdx = 0; colIdx < numberOfColumns; colIdx++) {
        bottom.push({
            type: "scopeCol",
            id: `cg_${colIdx}`,
            children: [],
            fullIndexPathToHere: [colIdx],
            header: headers[numberOfAttributes - 1][colIdx],
            headersToHere: headers.slice(0, numberOfAttributes - 1).map((attrHeaders) => attrHeaders[colIdx]),
            attributeDescriptor: descriptors[numberOfAttributes - 1],
            descriptorsToHere: descriptors.slice(0, numberOfAttributes - 1),
        });
    }

    // do the usual grouping logic with one tweak: do not process the last grouping level because code above
    // just created that.
    return groupColumns(bottom, descriptors, numberOfAttributes - 1);
}

function createColumnDescriptorsFromDataSeries(dv: DataViewFacade): GroupingOperationResult {
    const leafColumns: SeriesCol[] = dv
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

function createRowDescriptors(dv: DataViewFacade): SliceCol[] {
    return dv
        .data()
        .slices()
        .descriptors.filter(isAttributeDescriptor)
        .map((attributeDescriptor, idx) => {
            return {
                type: "sliceCol",
                id: `r_${idx}`,
                index: idx,
                attributeDescriptor,
                fullIndexPathToHere: [idx],
                effectiveTotals: attributeDescriptor.attributeHeader.totalItems ?? [],
            };
        });
}

function createColumnDescriptors(dv: DataViewFacade): GroupingOperationResult {
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
        return createColumnDescriptorsWhenNoMeasures(dv);
    }

    return createColumnDescriptorsFromDataSeries(dv);
}

function createTableHeaders(dv: DataViewFacade): TableCols {
    const rows: SliceCol[] = createRowDescriptors(dv);
    const { rootColumns, leafColumns, allColumns, groupingAttributes } = createColumnDescriptors(dv);

    const idToDescriptor: Record<string, AnyCol> = {};

    rows.forEach((header) => (idToDescriptor[header.id] = header));
    allColumns.forEach((header) => (idToDescriptor[header.id] = header));

    return {
        sliceCols: rows,
        rootDataCols: rootColumns,
        leafDataCols: leafColumns,
        idToDescriptor,
        scopingAttributes: groupingAttributes,
    };
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
 * @internal
 */
export function createHeadersAndColDefs(
    dv: DataViewFacade,
    emptyHeaderTitle: string,
    intl?: IntlShape,
): { headers: TableCols; colDefs: TableColDefs } {
    const headers = createTableHeaders(dv);
    const colDefs = createColDefsFromTableDescriptor(
        headers,
        dv.meta().effectiveSortItems(),
        emptyHeaderTitle,
        intl,
    );

    return { headers, colDefs };
}
