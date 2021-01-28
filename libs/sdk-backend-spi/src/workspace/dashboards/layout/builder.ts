// (C) 2019-2021 GoodData Corporation
import {
    IFluidLayoutColumn,
    IFluidLayoutRow,
    IFluidLayoutSectionHeader,
    IFluidLayoutSizeByScreen,
} from "./fluidLayout";
import {
    IFluidLayoutColumnMethods,
    IFluidLayoutColumnsMethods,
    IFluidLayoutRowMethods,
    IFluidLayoutRowsMethods,
} from "./fluidLayoutMethods";

export type FluidLayoutRowsSelector<TContent> = (
    rowsFacade: IFluidLayoutRowsMethods<TContent>,
) => IFluidLayoutRowMethods<TContent>[] | IFluidLayoutRowMethods<TContent> | undefined;

export type FluidLayoutColumnsSelector<TContent> = (
    columnsFacade: IFluidLayoutColumnsMethods<TContent>,
) => IFluidLayoutColumnMethods<TContent>[] | IFluidLayoutColumnMethods<TContent> | undefined;

export type FluidLayoutColumnModifications<TContent> = (
    columnBuilder: IFluidLayoutColumnBuilder<TContent>,
    columnFacade: IFluidLayoutColumnMethods<TContent>,
) => IFluidLayoutColumnBuilder<TContent>;

export type FluidLayoutRowModifications<TContent> = (
    rowBuilder: IFluidLayoutRowBuilder<TContent>,
    rowFacade: IFluidLayoutRowMethods<TContent>,
) => IFluidLayoutRowBuilder<TContent>;

type ValueOrTransform<TValue> = ((value: TValue) => TValue) | TValue;

export interface IFluidLayoutColumnBuilder<TContent> {
    size(valueOrTransform: ValueOrTransform<IFluidLayoutSizeByScreen>): this;
    style(valueOrTransform: ValueOrTransform<string>): this;
    content(valueOrTransform: ValueOrTransform<TContent>): this;
}

export interface IFluidLayoutRowBuilder<TContent> {
    header(valueOrTransform: ValueOrTransform<IFluidLayoutSectionHeader>): this;
    style(valueOrTransform: ValueOrTransform<string>): this;
    columns(valueOrTransform: ValueOrTransform<IFluidLayoutColumn<TContent>[]>): this;
    addColumn(modifications: FluidLayoutColumnModifications<TContent>, index?: number): this;
    moveColumn(fromIndex: number, toIndex: number): this;
    modifyColumn(index: number, modifications: FluidLayoutColumnModifications<TContent>): this;
    removeColumn(index: number): this;
    modifyColumns(
        modifications: FluidLayoutColumnModifications<TContent>,
        selector?: FluidLayoutColumnsSelector<TContent>,
    ): this;
    removeColumns(selector?: FluidLayoutColumnsSelector<TContent>): this;
}

export interface IFluidLayoutBuilder<TContent> {
    rows(valueOrTransform: ValueOrTransform<IFluidLayoutRow<TContent>[]>): this;
    addRow(modifications: FluidLayoutRowModifications<TContent>, index?: number): this;
    moveRow(fromIndex: number, toIndex: number): this;
    modifyRow(index: number, modifications: FluidLayoutRowModifications<TContent>): this;
    removeRow(index: number): this;
    modifyRows(
        modifications: FluidLayoutRowModifications<TContent>,
        selector?: FluidLayoutRowsSelector<TContent>,
    ): this;
    removeRows(selector?: FluidLayoutRowsSelector<TContent>): this;
}
