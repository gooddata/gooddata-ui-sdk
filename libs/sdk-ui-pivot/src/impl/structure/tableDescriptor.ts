// (C) 2021 GoodData Corporation

import {
    AnyCol,
    DataColLeaf,
    isDataColGroup,
    isDataColLeaf,
    isSliceCol,
    isDataColRootGroup,
    SliceCol,
    TableColDefs,
    TableCols,
    agColId,
    DataColGroup,
} from "./tableDescriptorTypes";
import { ColDef, ColGroupDef, Column } from "@ag-grid-community/all-modules";
import invariant from "ts-invariant";
import { IAttributeColumnWidthItem, IMeasureColumnWidthItem } from "../../columnWidths";
import { IAttributeDescriptor, IMeasureDescriptor } from "@gooddata/sdk-backend-spi";
import { searchForLocatorMatch } from "./colLocatorMatching";
import { DataViewFacade } from "@gooddata/sdk-ui";
import { createHeadersAndColDefs } from "./tableDescriptorFactory";
import { ISortItem } from "@gooddata/sdk-model";
import { createSortIndicators, SortIndicator } from "./tableDescriptorSorting";
import { createSortItemForCol } from "./colSortItemFactory";

/**
 * Table Descriptor is the entry point to all table structure data and metadata. It contains exhaustive information
 * about all table columns (column descriptors) and their respective ag-grid column definitions.
 *
 * On top of this data and metadata, the table descriptor provides convenience and added value methods.
 *
 * Column Descriptors vs ag-grid ColDefs | ColGroupDefs
 * ----------------------------------------------------
 *
 * Column Descriptors (shortened to `Col` sakes of brevity) are our implementation-specific descriptors for
 * the table columns and their grouping into column groups. They contain all the essential GD-specific metadata about
 * the content of the respective table column (attribute descriptors, headers, measure descriptors) and additional
 * structural information.
 *
 * Column Descriptors are divided into two groups: slicing column descriptors and data column descriptors. The
 * slicing columns essentially describe the row attribute columns, while the data columns describe columns that may
 * contains the computed metric values. The data column is a composite. In tables the scope metrics for one or more
 * attributes, the table columns will be further grouped by the different attribute elements to which the metrics
 * were scoped to.
 *
 * The ag-grid ColDefs and ColGroupDefs are (naturally) used to construct the ag-grid table :) They are built to
 * reflect the column descriptors but only contain the information needed by ag-grid itself.
 *
 * The important thing to remember is that ColDefs and ColGroupDefs have same colId/groupId as their column descriptor
 * counterparts.
 *
 *
 * @alpha
 */
export class TableDescriptor {
    public readonly zippedSliceCols: Array<[SliceCol, ColDef]> = [];
    public readonly zippedLeaves: Array<[DataColLeaf | DataColGroup, ColDef]> = [];
    private readonly dataColLeaves: number;

    private constructor(
        private readonly dv: DataViewFacade,
        public readonly headers: TableCols,
        public readonly colDefs: TableColDefs,
    ) {
        this._initializeZippedLeaves();
        this._initializeZippedSliceCols();
        this.dataColLeaves = headers.leafDataCols.filter(isDataColLeaf).length;
    }

    /**
     * Creates a new table descriptor from the provided data view facade.
     *
     * @param dv - data view facade
     */
    public static for(dv: DataViewFacade): TableDescriptor {
        const { headers, colDefs } = createHeadersAndColDefs(dv);

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
        const id = typeof c !== "string" ? agColId(c) : c;
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
        const id = typeof c !== "string" ? agColId(c) : c;
        const result = this.colDefs.idToColDef[id];

        invariant(result, `no column with id ${id}`);

        return result;
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
     * Gets all descriptors of all measures that were used to compute data values for this table. Note that it is
     * perfectly OK that table has no measures. If the table has slicing attributes, then it will be listing out
     * all available attribute values.
     *
     * Also note that table MAY have more data leaf columns than there are number of measures. If the measures
     * are further scoped for values of some attribute's elements, then there will be one data col for each combination
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
    public dataColLeavesCount(): number {
        return this.dataColLeaves;
    }

    /**
     * Tests whether the column with the provided id is the first (e.g. left-most) column in the table. Table always starts with
     * slicing columns followed by data columns.
     *
     * @param c - column id, Column, ColDef or ColGroupDef from ag-grid
     */
    public isFirstCol(c: string | Column | ColDef | ColGroupDef): boolean {
        invariant(c, "id of column or Column, ColDef or ColGroupDef must be provided");
        const id = typeof c !== "string" ? agColId(c) : c;
        invariant(id, "colId must be provided");

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
        const id = typeof c !== "string" ? agColId(c) : c;
        const col = this.getCol(id);

        switch (col.type) {
            case "leafColumnDescriptor":
            case "columnGroupHeaderDescriptor": {
                return col.fullIndexPathToHere.every((idx) => idx === 0);
            }
            case "columnGroupRootDescriptor": {
                return true;
            }
            default: {
                return false;
            }
        }
    }

    /**
     * Tests whether the table has grouped data columns.
     */
    public hasGroupedDataCols(): boolean {
        const firstRoot = this.headers.rootDataCols[0];

        return firstRoot && (isDataColGroup(firstRoot) || isDataColRootGroup(firstRoot));
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
     * Given slice or leaf data column, this method returns its absolute index in the table. This takes into
     * account that the table columns go from left-to-right, starting with slicing columns first then followed
     * by leaf data columns.
     *
     * @param col - column to get absolute index of
     */
    public getAbsoluteColIndex(col: SliceCol | DataColLeaf): number {
        if (isSliceCol(col)) {
            return col.index;
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
    public matchMeasureWidthItem(
        measureWidthItem: IMeasureColumnWidthItem,
    ): DataColLeaf | DataColGroup | undefined {
        return searchForLocatorMatch(
            this.headers.rootDataCols,
            measureWidthItem.measureColumnWidthItem.locators,
        );
    }

    /**
     * Tests whether the table can be enriched by totals. Tables that do not have any measures or do not have any
     * slicing attributes cannot have totals. Because by definition they either have exactly 1 row with all measure grant total
     * sum or have no rows whatsover.
     */
    public canTableHaveTotals(): boolean {
        return this.sliceColCount() > 0 && this.dataColLeavesCount() > 0;
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

        const colAt = allSliceCols.findIndex((slice) => slice.id === col.id);

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
}

function attributeDescriptorLocalIdMatch(localId: string): (b: IAttributeDescriptor) => boolean {
    return (b: IAttributeDescriptor): boolean => {
        return localId === b.attributeHeader.localIdentifier;
    };
}
