// (C) 2019-2021 GoodData Corporation
import flatMap from "lodash/flatMap";
import { IFluidLayoutColumn } from "../fluidLayout";
import {
    IFluidLayoutColumnMethods,
    IFluidLayoutColumnsMethods,
    IFluidLayoutFacade,
    IFluidLayoutRowMethods,
} from "../fluidLayoutMethods";
import { FluidLayoutColumnMethods } from "./column";

/**
 * TODO: RAIL-2869 add docs
 * @alpha
 */
export class FluidLayoutColumnsMethods<TContent> implements IFluidLayoutColumnsMethods<TContent> {
    protected constructor(
        protected readonly _layoutFacade: IFluidLayoutFacade<TContent>,
        protected readonly _rowFacade: IFluidLayoutRowMethods<TContent>,
        protected readonly _columns: IFluidLayoutColumnMethods<TContent>[],
        protected readonly _rawColumns: IFluidLayoutColumn<TContent>[],
    ) {}

    public static for<TContent>(
        layoutFacade: IFluidLayoutFacade<TContent>,
        rowFacade: IFluidLayoutRowMethods<TContent>,
    ): FluidLayoutColumnsMethods<TContent> {
        const rawColumns = rowFacade.raw().columns;
        const columns = rawColumns.map((column, index) =>
            FluidLayoutColumnMethods.for(layoutFacade, rowFacade, column, index),
        );
        return new FluidLayoutColumnsMethods(layoutFacade, rowFacade, columns, rawColumns);
    }

    public raw = (): IFluidLayoutColumn<TContent>[] => this._rawColumns;

    public column = (columnIndex: number): IFluidLayoutColumnMethods<TContent> | undefined =>
        this._columns[columnIndex];

    public map = <TReturn>(callback: (column: IFluidLayoutColumnMethods<TContent>) => TReturn): TReturn[] =>
        this._columns.map(callback);

    public flatMap = <TReturn>(
        callback: (column: IFluidLayoutColumnMethods<TContent>) => TReturn[],
    ): TReturn[] => flatMap(this._columns, callback);

    public reduce = <TReturn>(
        callback: (acc: TReturn, row: IFluidLayoutColumnMethods<TContent>) => TReturn,
        initialValue: TReturn,
    ): TReturn => this._columns.reduce(callback, initialValue);

    public find = (
        pred: (row: IFluidLayoutColumnMethods<TContent>) => boolean,
    ): IFluidLayoutColumnMethods<TContent> | undefined => this._columns.find(pred);

    public every = (pred: (row: IFluidLayoutColumnMethods<TContent>) => boolean): boolean =>
        this._columns.every(pred);

    public some = (pred: (row: IFluidLayoutColumnMethods<TContent>) => boolean): boolean =>
        this._columns.some(pred);

    public filter = (
        pred: (row: IFluidLayoutColumnMethods<TContent>) => boolean,
    ): IFluidLayoutColumnMethods<TContent>[] => this._columns.filter(pred);

    public all = (): IFluidLayoutColumnMethods<TContent>[] => this._columns;
}
