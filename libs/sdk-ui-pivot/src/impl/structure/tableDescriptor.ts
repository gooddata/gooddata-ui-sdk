// (C) 2021-2022 GoodData Corporation
import { IntlShape } from "react-intl";
import {
    AnyCol,
    isScopeCol,
    isSeriesCol,
    isSliceCol,
    isRootCol,
    SliceCol,
    TableColDefs,
    TableCols,
    agColId,
    isEmptyScopeCol,
    LeafDataCol,
} from "./tableDescriptorTypes.js";
import { ColDef, ColGroupDef, Column } from "@ag-grid-community/all-modules";
import { invariant } from "ts-invariant";
import { IAttributeColumnWidthItem, IMeasureColumnWidthItem } from "../../columnWidths.js";
import { searchForLocatorMatch } from "./colLocatorMatching.js";
import { DataViewFacade } from "@gooddata/sdk-ui";
import { createHeadersAndColDefs } from "./tableDescriptorFactory.js";
import { ISortItem, IMeasureDescriptor, IAttributeDescriptor } from "@gooddata/sdk-model";
import { createSortIndicators, SortIndicator } from "./tableDescriptorSorting.js";
import { createSortItemForCol } from "./colSortItemFactory.js";
import keyBy from "lodash/keyBy.js";
import findIndex from "lodash/findIndex.js";

/**
 * Table Descriptor is the entry point to all table structure data and metadata. It contains exhaustive information
 * about all table columns (column descriptors) and their respective ag-grid column definitions.
 *
 * On top of this data and metadata, the table descriptor provides convenience and added value methods.
 *
 * Column Descriptors vs ag-grid ColDefs | ColGroupDefs
 * ----------------------------------------------------
 *
 * Column Descriptors (shortened to `Col` for sakes of brevity) are our implementation-specific descriptors for
 * the table columns and their grouping into column groups. They contain all the essential GD-specific metadata about
 * the content of the respective table column (attribute descriptors, headers, measure descriptors) and additional
 * structural information.
 *
 * The ag-grid ColDefs and ColGroupDefs are (naturally) used to construct the ag-grid table :) They are built to
 * reflect the column descriptors but only contain the information needed by ag-grid itself.
 *
 * The important thing to remember is that ColDefs and ColGroupDefs have same colId/groupId as their column descriptor
 * counterparts.
 *
 * @alpha
 */
export class TableDescriptor {
    /**
     * This field contains slice column descriptors zipped with their respective ColDef that should
     * be used for ag-grid.
     */
    public readonly zippedSliceCols: Array<[SliceCol, ColDef]> = [];

    /**
     * This field contains descriptors of leaf columns zipped with their respective ColDef that should
     * be used for ag-grid.
     */
    public readonly zippedLeaves: Array<[LeafDataCol, ColDef]> = [];
    private readonly _seriesColsCount: number;

    private constructor(
        private readonly dv: DataViewFacade,
        public readonly headers: TableCols,
        public readonly colDefs: TableColDefs,
    ) {
        this._initializeZippedLeaves();
        this._initializeZippedSliceCols();
        this._seriesColsCount = headers.leafDataCols.filter(isSeriesCol).length;
    }

    /**
     * Creates a new table descriptor from the provided data view facade.
     *
     * @param dv - data view facade
     * @param emptyHeaderTitle - what to show for title of headers with empty title
     */
    public static for(dv: DataViewFacade, emptyHeaderTitle: string, intl?: IntlShape): TableDescriptor {
        const { headers, colDefs } = createHeadersAndColDefs(dv, emptyHeaderTitle, intl);

        invariant(headers.leafDataCols.length === colDefs.leafDataColDefs.length);

        return new TableDescriptor(dv, headers, colDefs);
    }

    private _initializeZippedLeaves() {
        this.headers.leafDataCols.forEach((col, idx) => {
            this.zippedLeaves.push([col, this.colDefs.leafDataColDefs[idx]]);
        });
    }

    private _initializeZippedSliceCols() {
        this.headers.sliceCols.forEach((col, idx) => {
            this.zippedSliceCols.push([col, this.colDefs.sliceColDefs[idx]]);
        });
    }

    /**
     * Gets column descriptor for column with the provided ID. This method will raise error if there is no such
     * col: this is to draw out possible errors in the rest of table code that uses the cols and ColDefs.
     *
     * @param c - column id, Column, ColDef or ColGroupDef from ag-grid
     */
    public getCol(c: string | Column | ColDef | ColGroupDef): AnyCol {
        invariant(c, "id of column or Column, ColDef or ColGroupDef must be provided");
        const id = agColId(c);
        const result = this.headers.idToDescriptor[id];

        invariant(result, `no column with id ${id}`);

        return result;
    }

    /**
     * Gets ColDef or ColGroupDef for column with the provided ID. This method will raise error if there is no such
     * col: this is to draw out possible errors in the rest of table code that uses the cols and ColDefs.
     *
     * @param c - column id, Column, ColDef or ColGroupDef from ag-grid
     */
    public getColDef(c: string | Column | ColDef | ColGroupDef): ColDef | ColGroupDef {
        invariant(c, "id of column or Column, ColDef or ColGroupDef must be provided");
        const id = agColId(c);
        const result = this.colDefs.idToColDef[id];

        invariant(result, `no column with id ${id}`);

        return result;
    }

    /**
     * Gets descriptors of all attributes that are used to slice the table into columns. Note that it is perfectly
     * OK that table has no scoping attributes.
     *
     * @returns empty if there are no scoping attributes
     */
    public getScopingAttributes(): IAttributeDescriptor[] {
        return this.headers.scopingAttributes;
    }

    /**
     * Gets descriptors of all attributes that are used to slice the table into rows. Note that it is perfectly
     * OK that table has no slicing attributes.
     *
     * @returns empty if there are no slicing attributes
     */
    public getSlicingAttributes(): IAttributeDescriptor[] {
        return this.headers.sliceCols.map((col) => col.attributeDescriptor);
    }

    /**
     *
     */
    public sliceColCount(): number {
        return this.headers.sliceCols.length;
    }

    /**
     * Gets count of scoping attributes (columns).
     */
    public scopingColCount(): number {
        return this.headers.scopingAttributes.length;
    }

    /**
     * Gets all descriptors of all measures that were used to compute data values for this table. Note that it is
     * perfectly OK that table has no measures. If the table has slicing attributes, then it will be listing out
     * all available attribute values.
     *
     * Also note that table MAY have more data leaf columns than there are number of measures. If the measures
     * are further scoped for values of some attribute's elements, then there will be one series col for each combination
     * of measure X attribute element.
     *
     * @returns empty if there are no measures
     */
    public getMeasures(): IMeasureDescriptor[] {
        return this.dv.meta().measureDescriptors();
    }

    /**
     * Returns count of leaf data cols. This represents the actual width of the data sheet holding the computed metric
     * values.
     */
    public seriesColsCount(): number {
        return this._seriesColsCount;
    }

    /**
     * Tests whether the column with the provided id is the first (e.g. left-most) column in the table. Table with
     * slicing attributes has first col a SliceCol. Table without slicing attributes starts with either SeriesCol or
     * with ScopeCol (in case table does not contain measures)
     *
     * @param c - column id, Column, ColDef or ColGroupDef from ag-grid
     */
    public isFirstCol(c: string | Column | ColDef | ColGroupDef): boolean {
        invariant(c, "id of column or Column, ColDef or ColGroupDef must be provided");
        const id = agColId(c);

        if (this.headers.sliceCols.length > 0) {
            return this.headers.sliceCols[0].id === id;
        }

        return this.isFirstDataCol(id);
    }

    /**
     * Tests whether the column with the provided id is the first (e.g. left-most) column of the data sheet part of the table.
     *
     * Note that for table that uses column groups, there will be multiple first columns: the grouping root and recursively
     * its first children down to the first leaf col..
     *
     * @param c - column id, Column, ColDef or ColGroupDef from ag-grid
     */
    public isFirstDataCol(c: string | Column | ColDef | ColGroupDef): boolean {
        invariant(c, "id of column or Column, ColDef or ColGroupDef must be provided");
        const col = this.getCol(c);

        switch (col.type) {
            case "seriesCol":
            case "scopeCol": {
                return col.fullIndexPathToHere.every((idx) => idx === 0);
            }
            case "rootCol": {
                return true;
            }
            default: {
                return false;
            }
        }
    }

    /**
     * Tests whether the table has scoping cols. Scoping cols mean table's data cols are organizes into a tree hierarchy.
     */
    public hasScopingCols(): boolean {
        const firstRoot = this.headers.rootDataCols[0];

        return firstRoot && (isScopeCol(firstRoot) || isRootCol(firstRoot));
    }

    /**
     * Tests whether the table has any leaf data cols - in other words whether there any computed data values to show
     * in the table. It is OK for table not to have any data leaf cols - it may be just a table with slicing cols listing
     * elements of an attribute.
     */
    public hasDataLeafCols(): boolean {
        return this.headers.leafDataCols.length > 0;
    }

    /**
     * Given a column that may appear as a leaf of table headers this method returns its absolute index in the table.
     *
     * This takes into account that the table columns go from left-to-right, starting with slicing columns first then
     * followed by leaf data columns.
     *
     * @param col - column to get absolute index of
     */
    public getAbsoluteLeafColIndex(col: SliceCol | LeafDataCol): number {
        if (isSliceCol(col)) {
            return col.index;
        } else if (isScopeCol(col)) {
            // if this bombs, caller is not operating with the leaf columns correctly and sent over
            // a col that is not a leaf
            invariant(isEmptyScopeCol(col));

            return this.sliceColCount() + findIndex(this.headers.leafDataCols, (leaf) => leaf.id === col.id);
        }

        return this.sliceColCount() + col.index;
    }

    /**
     * Attempts to match the provided attribute column width item to a SliceCol descriptor.
     *
     * @param columnWidthItem - item to match
     */
    public matchAttributeWidthItem(columnWidthItem: IAttributeColumnWidthItem): SliceCol | undefined {
        const matcher = attributeDescriptorLocalIdMatch(
            columnWidthItem.attributeColumnWidthItem.attributeIdentifier,
        );

        return this.headers.sliceCols.find((col) => matcher(col.attributeDescriptor));
    }

    /**
     * Attempts to match the provided measure width item to a leaf data col. The locators in the item
     * will be used to traverse the column structure.
     *
     * @param measureWidthItem - item to match
     */
    public matchMeasureWidthItem(measureWidthItem: IMeasureColumnWidthItem): LeafDataCol | undefined {
        return searchForLocatorMatch(
            this.headers.rootDataCols,
            measureWidthItem.measureColumnWidthItem.locators,
        );
    }

    /**
     * Tests whether the table can be enriched by row totals. Tables that do not have any measures, do not have any
     * slicing attributes cannot have row totals. Because by definition they either have exactly 1 row with all measure grant total
     * sum or have no rows whatsoever.
     */
    public canTableHaveRowTotals(): boolean {
        return this.sliceColCount() > 0 && this.seriesColsCount() > 0;
    }

    /**
     * Tests whether the table can be enriched by column totals. Tables that do not have any measures, do not have any
     * scoping attribute cannot have column totals. Because by definition they either have exactly 1 column with all measure grant total
     * sum or have no columns whatseover.
     */
    public canTableHaveColumnTotals(): boolean {
        return this.scopingColCount() > 0 && this.seriesColsCount() > 0;
    }

    /**
     * Returns slice col against which grant totals can be defined. This is essentially the left-most slicing column.
     * This method will raise invariant error if there are no slicing cols. Rationale being that inclusion of grand
     * totals requires more checks anyway and calling this blindly does not make much sense.
     *
     * @remarks see {@link TableDescriptor.canTableHaveTotals}
     */
    public getGrandTotalCol(): SliceCol {
        const result = this.headers.sliceCols[0];

        invariant(result);

        return result;
    }

    /**
     * Given a col, this function determines all slice cols that are effective up to and including
     * the col. In other words, it returns all slice cols 'to the left' of the provided col.
     *
     * Note: the col can be of any type. If a data col is provided, then by definition all slice cols are
     * effective. if col is a slice col, then slice cols from start up to and including the provided col
     * are returned.
     */
    public getSliceColsUpToIncludingCol(col: AnyCol): SliceCol[] {
        const allSliceCols = this.headers.sliceCols;

        if (!isSliceCol(col)) {
            return allSliceCols;
        }

        const colAt = findIndex(allSliceCols, (slice) => slice.id === col.id);

        // if this happens, then caller has mismatch of descriptor and cols
        invariant(colAt > -1);

        return allSliceCols.slice(0, colAt + 1);
    }

    /**
     * Given ag-grid columns or coldefs and a list of initial sort items, this function will create
     * sort items that reflect current table sorting configuration. The sorting configuration is obtained from the
     * Column/ColDef `getSort`/`sort` property.
     *
     * Note: the initial sort items are passed to here to ensure that attribute area sort setting is reused
     * correctly when sort direction for the respective column changes.
     *
     * @param columns - ag-grid columns / coldefs to obtain sorting information from
     * @param originalSorts - original sorts
     */
    public createSortItems(
        columns: Array<Column> | Array<ColDef>,
        originalSorts: ISortItem[] = [],
    ): ISortItem[] {
        if (columns.length === 0) {
            return [];
        }

        const sortIndicators = createSortIndicators(columns);

        return sortIndicators.map((sortModelItem: SortIndicator) => {
            const { colId, sort } = sortModelItem;
            const col = this.getCol(colId);

            return createSortItemForCol(col, sort, originalSorts);
        });
    }

    /**
     * Updates effective totals for the slice cols using the new total descriptors included for their respective
     * attributes in the new data view facade.
     *
     * @param dv - data view with same attribute structure but with added totals
     */
    public updateEffectiveTotals(dv: DataViewFacade): void {
        const idToDescriptor: Record<string, IAttributeDescriptor> = keyBy(
            dv.meta().attributeDescriptors(),
            (desc) => desc.attributeHeader.localIdentifier,
        );

        this.headers.sliceCols.forEach((sliceCol) => updateEffectiveTotals(sliceCol, idToDescriptor));
    }
}

function attributeDescriptorLocalIdMatch(localId: string): (b: IAttributeDescriptor) => boolean {
    return (b: IAttributeDescriptor): boolean => {
        return localId === b.attributeHeader.localIdentifier;
    };
}

function updateEffectiveTotals(col: SliceCol, newDescriptors: Record<string, IAttributeDescriptor>) {
    const attributeLocalId = col.attributeDescriptor.attributeHeader.localIdentifier;
    const newDescriptor = newDescriptors[attributeLocalId];

    // if this bombs then reinit logic of the entire pivot table is flawed because upon change of table structure is
    // re-initialized - which includes the table descriptor so the code should be getting to this place at all.
    invariant(
        newDescriptor,
        `attempting to refresh attribute descriptors for different table. attribute with local id ${attributeLocalId} not found`,
    );

    col.effectiveTotals = newDescriptor.attributeHeader.totalItems ?? [];
}
