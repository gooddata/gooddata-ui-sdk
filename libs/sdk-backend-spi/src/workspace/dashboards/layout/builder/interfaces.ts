// (C) 2019-2021 GoodData Corporation
import {
    IFluidLayout,
    IFluidLayoutColumn,
    IFluidLayoutRow,
    IFluidLayoutSectionHeader,
    IFluidLayoutSize,
    IFluidLayoutSizeByScreen,
} from "../fluidLayout";
import {
    IFluidLayoutColumnFacade,
    IFluidLayoutColumnFacadeImpl,
    IFluidLayoutColumnsFacade,
    IFluidLayoutColumnsFacadeImpl,
    IFluidLayoutFacade,
    IFluidLayoutFacadeImpl,
    IFluidLayoutRowFacade,
    IFluidLayoutRowFacadeImpl,
    IFluidLayoutRowsFacade,
    IFluidLayoutRowsFacadeImpl,
} from "../facade/interfaces";

/**
 * Represents a query to select a subset of layout rows.
 *
 * @alpha
 * @param rowsFacade - rows facade to create a query
 * @returns array of row facades, single row facade, or undefined
 */
export type FluidLayoutRowsSelector<
    TContent,
    TRow extends IFluidLayoutRow<TContent>,
    TRowFacade extends IFluidLayoutRowFacade<TContent, TRow>,
    TRowsFacade extends IFluidLayoutRowsFacade<TContent, TRow, TRowFacade>
> = (rowsFacade: TRowsFacade) => TRowFacade[] | TRowFacade | undefined;

/**
 * Represents a callback to modify the layout row.
 *
 * @alpha
 * @param rowBuilder - row builder on which the transformations will be performed
 * @param rowFacade - row facade for convenient work with the column
 * @returns row builder with applied transforms
 */
export type FluidLayoutRowModifications<
    TContent,
    TColumn extends IFluidLayoutColumn<TContent>,
    TRow extends IFluidLayoutRow<TContent>,
    TRowFacade extends IFluidLayoutRowFacade<TContent, TRow>,
    TColumnFacade extends IFluidLayoutColumnFacade<TContent, TColumn>,
    TColumnsFacade extends IFluidLayoutColumnsFacade<TContent, TColumn, TColumnFacade>,
    TColumnBuilder extends IFluidLayoutColumnBuilder<TContent, TColumn, TColumnFacade>,
    TRowBuilder extends IFluidLayoutRowBuilder<
        TContent,
        TRow,
        TColumn,
        TRowFacade,
        TColumnFacade,
        TColumnsFacade,
        TColumnBuilder
    >
> = (rowBuilder: TRowBuilder, rowFacade: TRowFacade) => TRowBuilder;

/**
 * Represents a query to select a subset of row columns.
 *
 * @alpha
 * @param columnsFacade - columns facade to create a query
 * @returns array of column facades, single column facade, or undefined
 */
export type FluidLayoutColumnsSelector<
    TContent,
    TColumn extends IFluidLayoutColumn<TContent>,
    TColumnFacade extends IFluidLayoutColumnFacade<TContent, TColumn>,
    TColumnsFacade extends IFluidLayoutColumnsFacade<TContent, TColumn, TColumnFacade>
> = (columnsFacade: TColumnsFacade) => TColumnFacade[] | TColumnFacade | undefined;

/**
 * Represents a callback to modify the layout column.
 *
 * @alpha
 * @param columnBuilder - column builder on which the transformations will be performed
 * @param columnFacade - column facade for convenient work with the column
 * @returns row builder with applied transforms
 */
export type FluidLayoutColumnModifications<
    TContent,
    TColumn extends IFluidLayoutColumn<TContent>,
    TColumnFacade extends IFluidLayoutColumnFacade<TContent, TColumn>,
    TColumnBuilder extends IFluidLayoutColumnBuilder<TContent, TColumn, TColumnFacade>
> = (columnBuilder: TColumnBuilder, columnFacade: TColumnFacade) => TColumnBuilder;

/**
 * Represents a callback to modify the layout.
 *
 * @alpha
 * @param layoutBuilder - layout builder on which the transformations will be performed
 * @param layoutFacade - layout facade for convenient work with the layout
 * @returns layout builder with applied transforms
 */
export type FluidLayoutModifications<
    TContent,
    TLayout extends IFluidLayout<TContent>,
    TRow extends IFluidLayoutRow<TContent>,
    TColumn extends IFluidLayoutColumn<TContent>,
    TRowFacade extends IFluidLayoutRowFacade<TContent, TRow>,
    TRowsFacade extends IFluidLayoutRowsFacade<TContent, TRow, TRowFacade>,
    TColumnFacade extends IFluidLayoutColumnFacade<TContent, TColumn>,
    TColumnsFacade extends IFluidLayoutColumnsFacade<TContent, TColumn, TColumnFacade>,
    TLayoutFacade extends IFluidLayoutFacade<TContent, TLayout>,
    TColumnBuilder extends IFluidLayoutColumnBuilder<TContent, TColumn, TColumnFacade>,
    TRowBuilder extends IFluidLayoutRowBuilder<
        TContent,
        TRow,
        TColumn,
        TRowFacade,
        TColumnFacade,
        TColumnsFacade,
        TColumnBuilder
    >,
    TLayoutBuilder extends IFluidLayoutBuilder<
        TContent,
        TLayout,
        TRow,
        TColumn,
        TRowFacade,
        TRowsFacade,
        TColumnFacade,
        TColumnsFacade,
        TLayoutFacade,
        TColumnBuilder,
        TRowBuilder
    >
> = (layoutBuilder: TLayoutBuilder, layoutFacade: TLayoutFacade) => TLayoutBuilder;

/**
 * Represents a callback to update the value, or the value itself.
 * @alpha
 */
export type ValueOrUpdateCallback<TValue> = TValue | ((value: TValue) => TValue);

/**
 * Builder for convenient creation or transformation of any {@link IFluidLayoutColumn}.
 *
 * @alpha
 */
export interface IFluidLayoutColumnBuilder<
    TContent,
    TColumn extends IFluidLayoutColumn<TContent>,
    TColumnFacade extends IFluidLayoutColumnFacade<TContent, TColumn>
> {
    /**
     * Set or update column size.
     *
     * @param valueOrUpdateCallback - column size or update callback
     * @returns this
     */
    size(valueOrTransform: ValueOrUpdateCallback<IFluidLayoutSizeByScreen>): this;

    /**
     * Set or update column content.
     *
     * @param valueOrUpdateCallback - column content or update callback
     * @returns this
     */
    content(valueOrTransform: ValueOrUpdateCallback<TContent | undefined>): this;

    /**
     * Set or update column as raw data.
     * Use it really carefully, and only when no other method suits your needs.
     *
     * @param valueOrUpdateCallback - raw column data or update callback
     * @returns this
     */
    setColumn(valueOrUpdateCallback: ValueOrUpdateCallback<TColumn>): this;

    /**
     * Get facade for the modified column.
     *
     * @returns column facade
     */
    facade(): TColumnFacade;

    /**
     * Perform set of the modifications on the column.
     * This is useful, when you want to decouple set of transforms to a single function.
     *
     * @param modifications - callback to modify the column
     * @returns this
     */
    modify(modifications: FluidLayoutColumnModifications<TContent, TColumn, TColumnFacade, this>): this;

    /**
     * Get raw data of the modified column.
     *
     * @returns raw data of the modified column
     */
    build(): TColumn;
}

/**
 * Builder for convenient creation or transformation of any {@link IFluidLayoutRow}.
 *
 * @alpha
 */
export interface IFluidLayoutRowBuilder<
    TContent,
    TRow extends IFluidLayoutRow<TContent>,
    TColumn extends IFluidLayoutColumn<TContent>,
    TRowFacade extends IFluidLayoutRowFacade<TContent, TRow>,
    TColumnFacade extends IFluidLayoutColumnFacade<TContent, TColumn>,
    TColumnsFacade extends IFluidLayoutColumnsFacade<TContent, TColumn, TColumnFacade>,
    TColumnBuilder extends IFluidLayoutColumnBuilder<TContent, TColumn, TColumnFacade>
> {
    /**
     * Set or update row header.
     *
     * @param valueOrUpdateCallback - row header or update callback
     * @returns this
     */
    header(valueOrTransform: ValueOrUpdateCallback<IFluidLayoutSectionHeader | undefined>): this;

    /**
     * Add a new column to a row.
     *
     * Note:
     * - This operation is non-invasive, it cannot replace an existing column.
     *   This means that if there is already an existing column on the specified index,
     *   this and all subsequent columns will be moved after the added column.
     *   If you want to replace an existing column use .modifyColumn() or .modifyColumns() method instead.
     *
     * - When no index is provided, column will be added at the end of the row.
     *
     * @param xlSize - size of the column for xl screen
     * @param create - callback to create the column
     * @param index - index where to place the column
     * @returns this
     */
    addColumn(
        xlSize: IFluidLayoutSize,
        create?: (builder: TColumnBuilder) => TColumnBuilder,
        index?: number,
    ): this;

    /**
     * Perform modifications for the column at a specified index.
     *
     * Note:
     * - If the column at the specified index does not exist, the error is thrown.
     *   Do this only when you are sure about the column index or use .modifyColumns() method instead,
     *   which allows you to select the columns according to your predicate and does nothing if it is not met.
     *
     * @param index - column index
     * @param modify - callback to modify the column
     * @returns this
     */
    modifyColumn(
        index: number,
        modify: FluidLayoutColumnModifications<TContent, TColumn, TColumnFacade, TColumnBuilder>,
    ): this;

    /**
     * Remove the column at a specified index.
     *
     * Note:
     * - If the column at the specified index does not exist, the error is thrown.
     *   Do this only when you are sure about the column index, or use .removeColumns() method instead,
     *   which allows you to select the columns according to your predicate and does nothing if it is not met.
     *
     * @param index - the index of the column to remove
     * @returns this
     */
    removeColumn(index: number): this;

    /**
     * Move column from a specified index to a target index.
     *
     * Note:
     * - If the column does not exist at the specified index, the error is thrown.
     * - This operation is non-invasive, it cannot replace an existing column.
     *   This means that if there is already an existing column at the target index,
     *   this and all subsequent columns will be moved after the added column.
     *
     * @param fromIndex - the index of the column to move
     * @param toIndex - the target index where the column will be moved
     * @returns this
     */
    moveColumn(fromIndex: number, toIndex: number): this;

    /**
     * Perform modifications for the selected column(s).
     * This is useful to perform a set of transformations for columns selected by any predicate.
     * Usually, you want to use .filter() and or .find() for the selector,
     * but it's really flexible and you can select any subset of the columns.
     *
     * Note:
     * - When no selector is provided, all columns are selected by default.
     * - Selector can return array, single value, or undefined.
     * - When selector returns undefined and or an empty array, no modifications are performed.
     *
     * @param modify - callback which is called for each of the selected columns to modify it
     * @param selector - query to select the target columns you want to modify
     * @returns this
     */
    modifyColumns(
        modify: FluidLayoutColumnModifications<TContent, TColumn, TColumnFacade, TColumnBuilder>,
        selector?: FluidLayoutColumnsSelector<TContent, TColumn, TColumnFacade, TColumnsFacade>,
    ): this;

    /**
     * Remove selected column(s).
     * This is useful to remove columns selected by any predicate.
     * Usually, you want to use .filter() and or .find() for the selector,
     * but it's really flexible and you can select any subset of the columns.
     *
     * Note:
     * - When no selector is provided, all columns are selected by default (and therefore removed).
     * - Selector can return array, single value, or undefined.
     * - When selector returns undefined and or an empty array, no column is removed.
     *
     * @param selector - query to select the target columns you want to remove
     * @returns this
     */
    removeColumns(
        selector?: FluidLayoutColumnsSelector<TContent, TColumn, TColumnFacade, TColumnsFacade>,
    ): this;

    /**
     * Remove all empty columns.
     *
     * @returns this
     */
    removeEmptyColumns(): this;

    /**
     * Set or update row as raw data.
     * Use it really carefully, and only when no other method suits your needs.
     *
     * @param valueOrUpdateCallback - raw row data or update callback
     * @returns this
     */
    setRow(valueOrUpdateCallback: ValueOrUpdateCallback<TRow>): this;

    /**
     * Get facade for the modified row.
     *
     * @returns row facade
     */
    facade(): TRowFacade;

    /**
     * Perform set of the modifications on the row.
     * This is useful, when you want to decouple set of transforms to a single function.
     *
     * @param modifications - callback to modify the row
     * @returns this
     */
    modify(
        modifications: FluidLayoutRowModifications<
            TContent,
            TColumn,
            TRow,
            TRowFacade,
            TColumnFacade,
            TColumnsFacade,
            TColumnBuilder,
            this
        >,
    ): this;

    /**
     * Get raw data of the modified row.
     *
     * @returns raw data of the modified row
     */
    build(): TRow;
}

/**
 * Builder for convenient creation or transformation of any {@link IFluidLayout}.
 * The provided layout is not touched in any way, all operations performed on the layout are immutable.
 *
 * @alpha
 */
export interface IFluidLayoutBuilder<
    TContent,
    TLayout extends IFluidLayout<TContent>,
    TRow extends IFluidLayoutRow<TContent>,
    TColumn extends IFluidLayoutColumn<TContent>,
    TRowFacade extends IFluidLayoutRowFacade<TContent, TRow>,
    TRowsFacade extends IFluidLayoutRowsFacade<TContent, TRow, TRowFacade>,
    TColumnFacade extends IFluidLayoutColumnFacade<TContent, TColumn>,
    TColumnsFacade extends IFluidLayoutColumnsFacade<TContent, TColumn, TColumnFacade>,
    TLayoutFacade extends IFluidLayoutFacade<TContent, TLayout>,
    TColumnBuilder extends IFluidLayoutColumnBuilder<TContent, TColumn, TColumnFacade>,
    TRowBuilder extends IFluidLayoutRowBuilder<
        TContent,
        TRow,
        TColumn,
        TRowFacade,
        TColumnFacade,
        TColumnsFacade,
        TColumnBuilder
    >
> {
    /**
     * Set or update layout size.
     *
     * @param valueOrUpdateCallback - layout size or update callback
     * @returns this
     */
    size(valueOrUpdateCallback: ValueOrUpdateCallback<IFluidLayoutSize | undefined>): this;

    /**
     * Add a new row to a layout.
     *
     * Note:
     * - This operation is non-invasive, it cannot replace an existing row.
     *   This means that if there is already an existing row on the specified index,
     *   this and all subsequent rows will be moved after the added row.
     *   If you want to replace an existing row use .modifyRow() or .modifyRows() method instead.
     *
     * - When no create callback is provided, an empty row is added
     * - When no index is provided, row will be added at the end of the layout.
     *
     * @param create - callback to create the row
     * @param index - index where to place the row
     * @returns this
     */
    addRow(create?: (builder: TRowBuilder) => TRowBuilder, index?: number): this;

    /**
     * Modify row at a specified index.
     *
     * Note:
     * - If the row does not exist at the specified index, the error is thrown.
     *   Do this only when you are sure about the row index, or use .modifyRows() method instead,
     *   which allows you to select the rows according to your predicate and does nothing if it is not met.
     *
     * @param index - row index
     * @param modify - callback to modify the row
     * @returns this
     */
    modifyRow(
        index: number,
        modify: FluidLayoutRowModifications<
            TContent,
            TColumn,
            TRow,
            TRowFacade,
            TColumnFacade,
            TColumnsFacade,
            TColumnBuilder,
            TRowBuilder
        >,
    ): this;

    /**
     * Remove the row at a specified index.
     *
     * Note:
     * - If the row does not exist at the specified index, the error is thrown.
     *   Do this only when you are sure about the row index, or use .removeRows() method instead,
     *   which allows you to select the rows according to your predicate and does nothing if it is not met.
     *
     * @param index - the index of the row to remove
     * @returns this
     */
    removeRow(index: number): this;

    /**
     * Move row from a specified index to a target index.
     *
     * Note:
     * - If the row does not exist at the specified index, the error is thrown.
     * - This operation is non-invasive, it cannot replace an existing row.
     *   This means that if there is already an existing row at the target index,
     *   this and all subsequent rows will be moved after the added row.
     *
     * @param fromIndex - the index of the row to move
     * @param toIndex - the target index where the row will be moved
     * @returns this
     */
    moveRow(fromIndex: number, toIndex: number): this;

    /**
     * Perform modifications for the selected row(s).
     * This is useful to perform a set of transformations for rows selected by any predicate.
     * Usually, you want to use .filter() and or .find() for the selector,
     * but it's really flexible and you can select any subset of the rows.
     *
     * Note:
     * - When no selector is provided, all rows are selected by default.
     * - Selector can return array, single value, or undefined.
     * - When selector returns undefined and or an empty array, no modifications are performed.
     *
     * @param modify - callback which is called for each of the selected rows to modify it
     * @param selector - query to select the target rows you want to modify
     * @returns this
     */
    modifyRows(
        modify: FluidLayoutRowModifications<
            TContent,
            TColumn,
            TRow,
            TRowFacade,
            TColumnFacade,
            TColumnsFacade,
            TColumnBuilder,
            TRowBuilder
        >,
        selector?: FluidLayoutRowsSelector<TContent, TRow, TRowFacade, TRowsFacade>,
    ): this;

    /**
     * Remove selected row(s).
     * This is useful to remove rows selected by any predicate.
     * Usually, you want to use .filter() and or .find() for the selector,
     * but it's really flexible and you can select any subset of the rows.
     *
     * Note:
     * - When no selector is provided, all rows are selected by default (and therefore removed).
     * - Selector can return array, single value, or undefined.
     * - When selector returns undefined and or an empty array, no row is removed.
     *
     * @param selector - query to select the target rows you want to modify
     * @returns this
     */
    removeRows(selector?: FluidLayoutRowsSelector<TContent, TRow, TRowFacade, TRowsFacade>): this;

    /**
     * Remove all empty rows.
     *
     * @returns this
     */
    removeEmptyRows(): this;

    /**
     * Set or update layout as raw data.
     * Use it really carefully, and only when no other method suits your needs.
     *
     * @param valueOrUpdateCallback - raw layout data or update callback
     * @returns this
     */
    setLayout(valueOrUpdateCallback: ValueOrUpdateCallback<TLayout>): this;

    /**
     * Get facade for the modified layout.
     *
     * @returns layout facade
     */
    facade(): TLayoutFacade;

    /**
     * Perform set of the modifications on the layout.
     * This is useful, when you want to decouple set of transforms to a single function.
     *
     * @param modifications - callback to modify the layout
     * @returns this
     */
    modify(
        modifications: FluidLayoutModifications<
            TContent,
            TLayout,
            TRow,
            TColumn,
            TRowFacade,
            TRowsFacade,
            TColumnFacade,
            TColumnsFacade,
            TLayoutFacade,
            TColumnBuilder,
            TRowBuilder,
            this
        >,
    ): this;

    /**
     * Get raw data of the modified layout.
     *
     * @returns raw data of the modified layout
     */
    build(): TLayout;
}

/**
 * @alpha
 */
export type IFluidLayoutBuilderImpl<TContent> = IFluidLayoutBuilder<
    TContent,
    IFluidLayout<TContent>,
    IFluidLayoutRow<TContent>,
    IFluidLayoutColumn<TContent>,
    IFluidLayoutRowFacadeImpl<TContent>,
    IFluidLayoutRowsFacadeImpl<TContent>,
    IFluidLayoutColumnFacadeImpl<TContent>,
    IFluidLayoutColumnsFacadeImpl<TContent>,
    IFluidLayoutFacadeImpl<TContent>,
    IFluidLayoutColumnBuilderImpl<TContent>,
    IFluidLayoutRowBuilderImpl<TContent>
>;

/**
 * @alpha
 */
export type IFluidLayoutRowBuilderImpl<TContent> = IFluidLayoutRowBuilder<
    TContent,
    IFluidLayoutRow<TContent>,
    IFluidLayoutColumn<TContent>,
    IFluidLayoutRowFacadeImpl<TContent>,
    IFluidLayoutColumnFacadeImpl<TContent>,
    IFluidLayoutColumnsFacadeImpl<TContent>,
    IFluidLayoutColumnBuilderImpl<TContent>
>;

/**
 * @alpha
 */
export type IFluidLayoutColumnBuilderImpl<TContent> = IFluidLayoutColumnBuilder<
    TContent,
    IFluidLayoutColumn<TContent>,
    IFluidLayoutColumnFacadeImpl<TContent>
>;
