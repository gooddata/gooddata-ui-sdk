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
    private static Cache: WeakMap<IFluidLayoutRowMethods<any>, FluidLayoutColumnsMethods<any>> = new WeakMap<
        IFluidLayoutRowMethods<any>,
        FluidLayoutColumnsMethods<any>
    >();

    protected constructor(
        protected readonly _layoutFacade: IFluidLayoutFacade<TContent>,
        protected readonly _rowFacade: IFluidLayoutRowMethods<TContent>,
        protected readonly _rawColumns: IFluidLayoutColumn<TContent>[],
    ) {}

    private _columns: IFluidLayoutColumnMethods<TContent>[] | undefined = undefined;

    public static for<TContent>(
        layoutFacade: IFluidLayoutFacade<TContent>,
        rowFacade: IFluidLayoutRowMethods<TContent>,
        columns: IFluidLayoutColumn<TContent>[],
    ): FluidLayoutColumnsMethods<TContent> {
        if (!FluidLayoutColumnsMethods.Cache.has(rowFacade)) {
            FluidLayoutColumnsMethods.Cache.set(
                rowFacade,
                new FluidLayoutColumnsMethods(layoutFacade, rowFacade, columns),
            );
        }

        return FluidLayoutColumnsMethods.Cache.get(rowFacade)!;
    }

    private getColumnFacades = () => {
        if (!this._columns) {
            this._columns = this._rawColumns.map((column, index) =>
                FluidLayoutColumnMethods.for(this._layoutFacade, this._rowFacade, column, index),
            );
        }

        return this._columns;
    };

    public raw = (): IFluidLayoutColumn<TContent>[] => this._rawColumns;

    public column = (columnIndex: number): IFluidLayoutColumnMethods<TContent> | undefined => {
        const columnFacades = this.getColumnFacades();
        return columnFacades[columnIndex];
    };

    public map = <TReturn>(callback: (column: IFluidLayoutColumnMethods<TContent>) => TReturn): TReturn[] => {
        const columnFacades = this.getColumnFacades();
        return columnFacades.map(callback);
    };

    public flatMap = <TReturn>(
        callback: (column: IFluidLayoutColumnMethods<TContent>) => TReturn[],
    ): TReturn[] => {
        const columnFacades = this.getColumnFacades();
        return flatMap(columnFacades, callback);
    };

    public reduce = <TReturn>(
        callback: (acc: TReturn, row: IFluidLayoutColumnMethods<TContent>) => TReturn,
        initialValue: TReturn,
    ): TReturn => {
        const columnFacades = this.getColumnFacades();
        return columnFacades.reduce(callback, initialValue);
    };

    public find = (
        pred: (row: IFluidLayoutColumnMethods<TContent>) => boolean,
    ): IFluidLayoutColumnMethods<TContent> | undefined => {
        const columnFacades = this.getColumnFacades();
        return columnFacades.find(pred);
    };

    public every = (pred: (row: IFluidLayoutColumnMethods<TContent>) => boolean): boolean => {
        const columnFacades = this.getColumnFacades();
        return columnFacades.every(pred);
    };

    public some = (pred: (row: IFluidLayoutColumnMethods<TContent>) => boolean): boolean => {
        const columnFacades = this.getColumnFacades();
        return columnFacades.some(pred);
    };

    public filter = (
        pred: (row: IFluidLayoutColumnMethods<TContent>) => boolean,
    ): IFluidLayoutColumnMethods<TContent>[] => {
        const columnFacades = this.getColumnFacades();
        return columnFacades.filter(pred);
    };

    public all = (): IFluidLayoutColumnMethods<TContent>[] => {
        return this.getColumnFacades();
    };
}
