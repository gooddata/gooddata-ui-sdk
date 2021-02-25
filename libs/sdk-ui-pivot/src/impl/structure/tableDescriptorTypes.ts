// (C) 2007-2021 GoodData Corporation
import { IAttributeDescriptor, IResultAttributeHeader, ITotalDescriptor } from "@gooddata/sdk-backend-spi";
import { DataSeriesDescriptor, DataSeriesId } from "@gooddata/sdk-ui";
import { ColDef, ColGroupDef, Column } from "@ag-grid-community/all-modules";

export const ColumnGroupingDescriptorId = "groupingDescriptor";

/**
 * Represents table column which displays data slice attribute element names. PivotTable interface also calls
 * these `attribute column`.
 *
 * In other words, in a table that is defined as (Row: A1, Measures: M1) and looking like:
 *
 * A1    | M1
 * ----------
 * val1  | 1
 * val2  | 2
 *
 * There is one SliceCol - for row attribute A1. In this table, there will be one row for each
 * element of attribute A1.
 *
 * TODO: rename to attributeCol?
 */
export type SliceCol = {
    readonly type: "rowHeaderDescriptor";
    readonly id: string;

    /**
     * Descriptor of attribute whose elements will be in this column.
     */
    readonly attributeDescriptor: IAttributeDescriptor;

    /**
     * Descriptors of totals that are defined on this column's granularity. Note that while the total
     * descriptors are also part of the attributeDescriptor (above) the total descriptors there are a snapshot done
     * at the time of table descriptor construction.
     *
     * User may change effective totals by configuring aggregations using the table's aggregation menu. If that
     * happens the table will drive a new execution with updated totals. After it finishes, the effective totals
     * in this field will be updated.
     */
    effectiveTotals: ITotalDescriptor[];

    /**
     * Column index among all slice columns
     */
    index: number;

    /**
     * Path of indexes to follow from root, through children in order to get to this node.
     */
    readonly fullIndexPathToHere: number[];
};

export function isSliceCol(obj: unknown): obj is SliceCol {
    return (obj as SliceCol)?.type === "rowHeaderDescriptor";
}

/**
 * Represents most granular column under which computed measure data is rendered.
 *
 * In other words, in a table that is defined as (Row: A1, Cols: A2, Measures: M1) and looking like:
 *
 *       -------+-----+
 *       | A2E1 | A2E2|
 * A1    | M1   | M1  | ....
 * ------------------------
 * val1  | 1    | 3   |
 * val2  | 2    | 4   |
 *
 * There are as many leaf data cols as there are combinations of A2 attribute elements for which it is possible
 * to calculate metric M1.
 *
 * If you are familiar with the DataViewFacade's data access infrastructure, then the analogy is simple: there
 * is one leaf data col of each data series.
 *
 * TODO: Rename from Leaf to something indicating that there are measure values in this col
 */
export type DataColLeaf = {
    readonly type: "leafColumnDescriptor";
    readonly id: string;

    /**
     * Path of indexes to follow from root, through children in order to get to this node.
     */
    fullIndexPathToHere: number[];

    /**
     * column index among all leaf columns
     */
    index: number;

    readonly children: [];

    readonly seriesId: DataSeriesId;
    readonly seriesDescriptor: DataSeriesDescriptor;
};

export function isDataColLeaf(obj: unknown): obj is DataColLeaf {
    return (obj as DataColLeaf)?.type == "leafColumnDescriptor";
}

/**
 * In a grouped table, this represents a column which groups multiple data leaf columns. The leaf cols are grouped
 * into into N trees. The number of trees depends on how many scoping attribute elements actually exist and for
 * how many of those a metric can be calculated.
 *
 * In other words, in a table that is defined as (Row: A1, Cols: A2, A3, Measures: M1, M2) and looking like:
 *
 *       ---------------------------
 *       |           A1E1          |
 *       -------+-----+------------+
 *       |     A2E1   |     A2E2   |
 * A1    | M1   | M2  | M1   | M2  | ....
 * ----------------------------------------
 * val1  | 1    | 3   | ....
 * val2  | 2    | 4   | ....
 *
 * There are as many data leaf columns as there are valid combinations of A1xA2 elements for which metric values M1 and
 * M2 can be computed. These leaves are then grouped under as many trees as there are unique values of A1. In each
 * such tree there are there are further subtrees - one for each unique value of A2. And then in each subtree there
 * are the leaves - one for each measure.
 *
 * TODO: Rename to something indicating that the col represents values of scoping attribute and may hosting
 *  additional children cols
 */
export type DataColGroup = {
    readonly type: "columnGroupHeaderDescriptor";
    readonly id: string;

    readonly children: DataCol[];

    /**
     * Path of indexes to follow from root, through children in order to get to this node.
     */
    fullIndexPathToHere: number[];

    /**
     * Descriptor of attribute whose value scopes this column group.
     */
    readonly attributeDescriptor: IAttributeDescriptor;

    /**
     * The actual attribute header that scopes this column group.
     */
    readonly header: IResultAttributeHeader;

    /**
     * Descriptors of all attributes on the way to this column group - excluding the descriptor of the
     * current group.
     */
    readonly descriptorsToHere: IAttributeDescriptor[];

    /**
     * Descriptors of all attribute headers on the way to this column group - excluding the header of the
     * current group.
     */
    readonly headersToHere: IResultAttributeHeader[];
};

export function isDataColGroup(obj: unknown): obj is DataColGroup {
    return (obj as DataColGroup)?.type === "columnGroupHeaderDescriptor";
}

/**
 * Tests whether the provided col is a {@link DataColGroup} with no children - which implies that it is the bottom
 * most group that is not linked to any measure columns, which in turn means the table is not defined with any measures.
 *
 * @param col - col to test
 */
export function isEmptyDataColGroup(col: AnyCol): boolean {
    return isDataColGroup(col) && col.children.length === 0;
}

/**
 * Appears in a table with grouped data columns. This is the root header that has all first-level
 * group headers as children.
 */
export type DataColRootGroup = {
    readonly type: "columnGroupRootDescriptor";
    readonly id: "groupingDescriptor";

    readonly children: DataCol[];
    readonly groupingAttributes: IAttributeDescriptor[];
    readonly fullIndexPathToHere: [0];
};

export function isDataColRootGroup(obj: unknown): obj is DataColRootGroup {
    return (obj as DataColRootGroup)?.type === "columnGroupRootDescriptor";
}

/**
 * Column Descriptor is modeled as a composite structure. Column groups may host additional column
 * groups or leaf column descriptor.
 */
export type DataCol = DataColLeaf | DataColGroup | DataColRootGroup;
export type AnyCol = SliceCol | DataCol;

/**
 * Descriptors of all table headers. The table headers are divided into two groups:
 *
 * -  Row-column headers; these describe the columns that contain description of each row of data. They are
 *    constructed from data slicing attributes.
 *
 * -  Column headers; these describe the columns that contain the actual data points. They are constructed from
 *    the data series identified in the result. A data series represents a stream of data points computed for particular
 *    measure. The data points can be sliced by some attributes and/or scoped by some attributes. Read more about
 *    that here: {@link IDataSeries}.
 *
 *    When the data series use scoping, the table headers should be nicely grouped by the scoping attribute
 *    element values and form a tree hierarchy. That is why the column headers are further listed as:
 *
 *    -  Root Columns = column descriptors representing top-most group
 *    -  Leaf Columns = column descriptors representing the actual, fully scoped columns that contain the actual
 *       data points
 *
 *    Note: if the data series are not scoped, then no grouping is needed and the root columns and leaf columns will
 *    contain the same values.
 *
 */
export type TableCols = {
    /**
     * All table row headers - these are derived from slicing attributes
     */
    readonly sliceCols: SliceCol[];

    /**
     * Root table headers.
     */
    readonly rootDataCols: DataCol[];

    /**
     * Bottom-most
     */
    readonly leafDataCols: Array<DataColGroup | DataColLeaf>;

    /**
     * Mapping between header ID to header descriptor (useful for lookups as ColDefs 'field' references this)
     */
    readonly idToDescriptor: Record<string, AnyCol>;

    /**
     * All attributes used for grouping table columns.
     */
    readonly groupingAttributes: IAttributeDescriptor[];
};

/**
 * Ag-Grid colDefs constructed to match the table header descriptors. See {@link TableCols} for more
 * information about nomenclature.
 */
export type TableColDefs = {
    readonly sliceColDefs: ReadonlyArray<ColDef>;
    readonly rootDataColDefs: ReadonlyArray<ColDef | ColGroupDef>;
    readonly leafDataColDefs: ReadonlyArray<ColDef>;
    readonly idToColDef: Record<string, ColDef | ColGroupDef>;
};

function isColDef(obj: unknown): obj is ColDef {
    return (obj as ColDef)?.colId !== undefined;
}

function isColumn(obj: unknown): obj is Column {
    return (obj as Column)?.getColDef !== undefined;
}

/**
 * Convenience accessor of ag-grid column identifier. This can take either string itself or the
 * different type of col flying around ag-grid API (ColDef, ColGroupDef or Column).
 *
 * For purposes of our table, column ID for ag-grid groups is the groupId.
 *
 * @param colOrId - column id (returned as is) or one of the ag-grid's column types
 */
export function agColId(colOrId: string | ColDef | ColGroupDef | Column): string {
    if (typeof colOrId === "string") {
        return colOrId;
    }
    if (isColDef(colOrId)) {
        return colOrId.colId!;
    } else if (isColumn(colOrId)) {
        return agColId(colOrId.getColDef());
    } else {
        return colOrId.groupId!;
    }
}
