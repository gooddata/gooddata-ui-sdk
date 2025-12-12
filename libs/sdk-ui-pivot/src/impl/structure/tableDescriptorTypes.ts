// (C) 2007-2025 GoodData Corporation
import { type ColDef, type ColGroupDef, type Column } from "ag-grid-community";

import {
    type IAttributeDescriptor,
    type IMeasureDescriptor,
    type IResultAttributeHeader,
    type ITotalDescriptor,
} from "@gooddata/sdk-model";
import { type DataSeriesDescriptor, type DataSeriesId } from "@gooddata/sdk-ui";

export const ColumnGroupingDescriptorId = "root";

/**
 * Recognized col types. See the respective interfaces for addition information.
 *
 * @remarks see {@link SliceCol}
 * @remarks see {@link SeriesCol}
 * @remarks see {@link ScopeCol}
 * @remarks see {@link RootCol}
 */
export type TableColType =
    | "sliceCol"
    | "sliceMeasureCol"
    | "mixedValuesCol"
    | "mixedHeadersCol"
    | "seriesCol"
    | "scopeCol"
    | "rootCol";

/**
 * Base interface for all col types.
 */
export interface TableCol {
    readonly type: TableColType;
    readonly id: string;
}

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
 */
export interface SliceCol extends TableCol {
    readonly type: "sliceCol";

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
}

export function isSliceCol(obj: unknown): obj is SliceCol {
    return (obj as SliceCol)?.type === "sliceCol";
}

/**
 * Represents table column which displays names of metrics when transposed to rows.
 *
 * In other words, in a table that is defined as (Row: A1, Measures: M1 transposed to rows) and looking like:
 *
 *          x
 * A1    |    |
 * ----------------
 * val1  | M1 | 1
 * val2  | M1 | 2
 *
 * There is one SliceMeasureCol - for name of M1. In this table, there will be one row for each
 * element of attribute A1.
 *
 */
export interface SliceMeasureCol extends TableCol {
    readonly type: "sliceMeasureCol";

    /**
     * Column index among all slice columns
     */
    index: number;

    /**
     * Path of indexes to follow from root, through children in order to get to this node.
     */
    readonly fullIndexPathToHere: number[];

    readonly seriesDescriptor: DataSeriesDescriptor[];
}

export interface MixedHeadersCol extends TableCol {
    readonly type: "mixedHeadersCol";

    /**
     * Column index among all slice columns
     */
    index: number; // probably will always be 0 as there will be always just one

    /**
     * Path of indexes to follow from root, through children in order to get to this node.
     */
    readonly fullIndexPathToHere: number[];
}
// TODO pivot operates with slices and series. Better name should be used than the introduction of attr/measures.

export interface MixedValuesCol extends TableCol {
    readonly type: "mixedValuesCol";

    /**
     * Column index among all slice columns
     */
    index: number;

    /**
     * Path of indexes to follow from root, through children in order to get to this node.
     */
    readonly fullIndexPathToHere: number[];

    readonly seriesDescriptor?: DataSeriesDescriptor[];

    /**
     * Checks whether this column group is part of grand total.
     */
    readonly isTotal?: boolean;

    /**
     * Checks whether this column group is part of sub-total.
     */
    readonly isSubtotal?: boolean;
}

export function isSliceMeasureCol(obj: unknown): obj is SliceMeasureCol {
    return (obj as SliceMeasureCol)?.type === "sliceMeasureCol";
}

export function isMixedHeadersCol(obj: unknown): obj is MixedHeadersCol {
    return (obj as MixedHeadersCol)?.type === "mixedHeadersCol";
}

export function isMixedValuesCol(obj: unknown): obj is MixedValuesCol {
    return (obj as MixedValuesCol)?.type === "mixedValuesCol";
}

/**
 * Represents most granular column under which computed measure data for a single data series is shown.
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
 * There are as many series cols as there are combinations of A2 attribute elements for which it is possible
 * to calculate metric M1.
 *
 * If you are familiar with the DataViewFacade's data access infrastructure, then the analogy is simple: there
 * is one series col of each data series.
 */
export interface SeriesCol extends TableCol {
    readonly type: "seriesCol";

    /**
     * Path of indexes to follow from root, through children in order to get to this node.
     */
    fullIndexPathToHere: number[];

    /**
     * Index among all series cols.
     */
    index: number;

    readonly children: [];

    readonly seriesId: DataSeriesId;
    readonly seriesDescriptor: DataSeriesDescriptor;
}

export function isSeriesCol(obj: unknown): obj is SeriesCol {
    return (obj as SeriesCol)?.type == "seriesCol";
}

/**
 * Tables with column attributes and measures is a table with scoped data series. Such table will have its data cols
 * grouped into a tree hierarchy. The ScopeCol is composite in this tree hierarchy, whose children may be either additional
 * scope cols or finally the series cols.
 *
 * The tree hierarchy will be as deep as there are column attributes and as wide as the number of the actual scoped
 * data series.
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
 * There are as many series cols as there are valid combinations of A1xA2 elements for which metric values M1 and
 * M2 can be computed. These leaves are then grouped under as many trees as there are unique values of A1. In each
 * such tree there are there are further subtrees - one for each unique value of A2. And then in each subtree there
 * are the leaves - one for each measure.
 */
export interface ScopeCol extends TableCol {
    readonly type: "scopeCol";

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

    /**
     * Checks whether this column group is part of grand total.
     */
    readonly isTotal?: boolean;

    /**
     * Checks whether this column group is part of sub-total.
     */
    readonly isSubtotal?: boolean;

    /**
     * When table is transposed (metrics in rows). Descriptor of the measure object whose computed values are in the data series
     */
    readonly measureDescriptors?: IMeasureDescriptor[];
}

export function isScopeCol(obj: unknown): obj is ScopeCol {
    return (obj as ScopeCol)?.type === "scopeCol";
}

/**
 * Tests whether the provided col is a {@link ScopeCol} with no children - which implies that it is the bottom
 * most group that is not linked to any measure columns, which in turn means the table is not defined with any measures.
 *
 * @param col - col to test
 */
export function isEmptyScopeCol(col: AnyCol): boolean {
    return isScopeCol(col) && col.children.length === 0;
}

/**
 * Appears in a table with grouped data columns. This is the root header that has all first-level
 * group headers as children.
 */
export interface RootCol extends TableCol {
    readonly type: "rootCol";
    readonly id: "root";

    readonly children: DataCol[];
    readonly groupingAttributes: IAttributeDescriptor[];
    readonly fullIndexPathToHere: [0];
}

export function isRootCol(obj: unknown): obj is RootCol {
    return (obj as RootCol)?.type === "rootCol";
}

/**
 * Leaf data cols appear as leaf / bottom-most columns in the data part of the table. This is typically a series col,
 * however in cases of table without measures it can also be a scope col.
 */
export type LeafDataCol = SeriesCol | ScopeCol;

/**
 * Represents table columns which displays names and values of metrics when is transposed to rows.
 */
export type TransposedMeasureDataCol = SliceMeasureCol | MixedValuesCol;

/**
 * Data col is a composite structure describing the data part of the table.
 */
export type DataCol = RootCol | LeafDataCol;

/**
 * All types of slice cols.
 */
export type AnySliceCol = SliceCol | SliceMeasureCol | MixedValuesCol;

/**
 * Any table col. May be either the col describing the table slicing or col describing the data part of the table.
 */
export type AnyCol = SliceCol | SliceMeasureCol | MixedHeadersCol | MixedValuesCol | DataCol | ScopeCol;

/**
 * Descriptors of all table columns. The table columns are divided into two groups:
 *
 * -  Slice Columns; these describe the columns that contain description of each row of data. They are
 *    constructed from data slicing attributes.
 *
 * -  Data columns; these describe the columns that contain the actual data points. They are constructed from
 *    the data series identified in the result. A data series represents a stream of data points computed for particular
 *    measure. The data points can be sliced by some attributes and/or scoped by some attributes. Read more about
 *    that here: {@link IDataSeries}.
 *
 *    When the data series use scoping, the data cols are grouped by the scoping attribute
 *    element values and form a tree hierarchy. The hierarchy always starts with a RootCol whose children
 *    are all scope cols created from the first scoping attribute. These in turn have children that are scope
 *    cols created from the second scoping attribute. This goes on until the last layer of scoping cols whose
 *    children will be the actual SeriesCols.
 *
 *    Note 1: if the table does contain only scoping attributes but  no measures, then the last layer of scoping
 *    cols will have no children.
 *
 *    Note 2: if the data series are not scoped, then no grouping is needed and the root columns and leaf columns will
 *    contain the same values.
 *
 */
export type TableCols = {
    /**
     * All table row headers - these are derived from slicing attributes
     */
    readonly sliceCols: SliceCol[];

    /**
     * Column used for metric names when table is transposed (metrics are in rows)
     */
    readonly sliceMeasureCols: SliceMeasureCol[];

    readonly mixedHeadersCols: MixedHeadersCol[];

    /**
     * Column with values of either elements or metrics or both mixed together
     */
    readonly mixedValuesCols: MixedValuesCol[];

    /**
     * Root table cols.
     */
    readonly rootDataCols: DataCol[];

    /**
     * Leaf data cols. These are either all series columns or in a corner case all scoping cols. This latter
     * can happen when the table is constructed with scoping attributes but without measures.
     */
    readonly leafDataCols: Array<LeafDataCol>;

    /**
     * Mapping between header ID to header descriptor (useful for lookups as ColDefs 'field' references this)
     */
    readonly idToDescriptor: Record<string, AnyCol>;

    /**
     * Descriptors for attributes that are used to construct the scoping cols.
     */
    readonly scopingAttributes: IAttributeDescriptor[];
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
