// (C) 2019-2021 GoodData Corporation
import flatMap from "lodash/flatMap";
import { IFluidLayoutRow } from "../fluidLayout";
import { IFluidLayoutRowsMethods, IFluidLayoutFacade, IFluidLayoutRowMethods } from "../fluidLayoutMethods";
import { FluidLayoutRowMethods } from "./row";

/**
 * TODO: RAIL-2869 add docs
 * @alpha
 */
export class FluidLayoutRowsMethods<TContent> implements IFluidLayoutRowsMethods<TContent> {
    protected constructor(
        protected readonly _layoutFacade: IFluidLayoutFacade<TContent>,
        protected readonly _rows: IFluidLayoutRowMethods<TContent>[],
        protected readonly _rawRows: IFluidLayoutRow<TContent>[],
    ) {}

    public static for<TContent>(
        layoutFacade: IFluidLayoutFacade<TContent>,
    ): FluidLayoutRowsMethods<TContent> {
        const rawRows = layoutFacade.raw().rows;
        const rows = layoutFacade
            .raw()
            .rows.map((row, index) => FluidLayoutRowMethods.for(layoutFacade, row, index));
        return new FluidLayoutRowsMethods(layoutFacade, rows, rawRows);
    }

    public raw = (): IFluidLayoutRow<TContent>[] => this._rawRows;

    public row = (rowIndex: number): IFluidLayoutRowMethods<TContent> | undefined => this._rows[rowIndex];

    public map = <TReturn>(callback: (row: IFluidLayoutRowMethods<TContent>) => TReturn): TReturn[] =>
        this._rows.map(callback);

    public flatMap = <TReturn>(
        callback: (column: IFluidLayoutRowMethods<TContent>) => TReturn[],
    ): TReturn[] => flatMap(this._rows, callback);

    public reduce = <TReturn>(
        callback: (acc: TReturn, row: IFluidLayoutRowMethods<TContent>) => TReturn,
        initialValue: TReturn,
    ): TReturn => this._rows.reduce(callback, initialValue);

    public find = (
        pred: (row: IFluidLayoutRowMethods<TContent>) => boolean,
    ): IFluidLayoutRowMethods<TContent> | undefined => this._rows.find(pred);

    public every = (pred: (row: IFluidLayoutRowMethods<TContent>) => boolean): boolean =>
        this._rows.every(pred);

    public some = (pred: (row: IFluidLayoutRowMethods<TContent>) => boolean): boolean =>
        this._rows.some(pred);

    public filter = (
        pred: (row: IFluidLayoutRowMethods<TContent>) => boolean,
    ): IFluidLayoutRowMethods<TContent>[] => this._rows.filter(pred);

    public all = (): IFluidLayoutRowMethods<TContent>[] => this._rows;
}
