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
    private static Cache: WeakMap<IFluidLayoutFacade<any>, FluidLayoutRowsMethods<any>> = new WeakMap<
        IFluidLayoutFacade<any>,
        FluidLayoutRowsMethods<any>
    >();

    private _rows: IFluidLayoutRowMethods<TContent>[] | undefined;

    protected constructor(
        protected readonly _layoutFacade: IFluidLayoutFacade<TContent>,
        protected readonly _rawRows: IFluidLayoutRow<TContent>[],
    ) {}

    public static for<TContent>(
        layoutFacade: IFluidLayoutFacade<TContent>,
        rows: IFluidLayoutRow<TContent>[],
    ): FluidLayoutRowsMethods<TContent> {
        if (!FluidLayoutRowsMethods.Cache.has(layoutFacade)) {
            FluidLayoutRowsMethods.Cache.set(layoutFacade, new FluidLayoutRowsMethods(layoutFacade, rows));
        }

        return FluidLayoutRowsMethods.Cache.get(layoutFacade)!;
    }

    private getRowFacades = () => {
        if (!this._rows) {
            this._rows = this._rawRows.map((row, index) =>
                FluidLayoutRowMethods.for(this._layoutFacade, row, index),
            );
        }

        return this._rows;
    };

    public raw = (): IFluidLayoutRow<TContent>[] => this._rawRows;

    public row = (rowIndex: number): IFluidLayoutRowMethods<TContent> | undefined => {
        const rowFacades = this.getRowFacades();
        return rowFacades[rowIndex];
    };

    public map = <TReturn>(callback: (row: IFluidLayoutRowMethods<TContent>) => TReturn): TReturn[] => {
        const rowFacades = this.getRowFacades();
        return rowFacades.map(callback);
    };

    public flatMap = <TReturn>(callback: (row: IFluidLayoutRowMethods<TContent>) => TReturn[]): TReturn[] => {
        const rowFacades = this.getRowFacades();
        return flatMap(rowFacades, callback);
    };

    public reduce = <TReturn>(
        callback: (acc: TReturn, row: IFluidLayoutRowMethods<TContent>) => TReturn,
        initialValue: TReturn,
    ): TReturn => {
        const rowFacades = this.getRowFacades();
        return rowFacades.reduce(callback, initialValue);
    };

    public find = (
        pred: (row: IFluidLayoutRowMethods<TContent>) => boolean,
    ): IFluidLayoutRowMethods<TContent> | undefined => {
        const rowFacades = this.getRowFacades();
        return rowFacades.find(pred);
    };

    public every = (pred: (row: IFluidLayoutRowMethods<TContent>) => boolean): boolean => {
        const rowFacades = this.getRowFacades();
        return rowFacades.every(pred);
    };

    public some = (pred: (row: IFluidLayoutRowMethods<TContent>) => boolean): boolean => {
        const rowFacades = this.getRowFacades();
        return rowFacades.some(pred);
    };

    public filter = (
        pred: (row: IFluidLayoutRowMethods<TContent>) => boolean,
    ): IFluidLayoutRowMethods<TContent>[] => {
        const rowFacades = this.getRowFacades();
        return rowFacades.filter(pred);
    };

    public all = (): IFluidLayoutRowMethods<TContent>[] => {
        return this.getRowFacades();
    };
}
