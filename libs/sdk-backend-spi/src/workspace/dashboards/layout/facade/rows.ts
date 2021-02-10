// (C) 2019-2021 GoodData Corporation
import flatMap from "lodash/flatMap";
import { IFluidLayoutRow } from "../fluidLayout";
import { IFluidLayoutRowsMethods, IFluidLayoutFacade, IFluidLayoutRowMethods } from "./interfaces";
import { FluidLayoutRowMethods } from "./row";

/**
 * TODO: RAIL-2869 add docs
 * @alpha
 */
export class FluidLayoutRowsMethods<TContent> implements IFluidLayoutRowsMethods<TContent> {
    private rowFacades: IFluidLayoutRowMethods<TContent>[] | undefined;

    private constructor(
        private readonly layoutFacade: IFluidLayoutFacade<TContent>,
        private readonly rawRows: IFluidLayoutRow<TContent>[],
    ) {}

    public static for<TContent>(
        layoutFacade: IFluidLayoutFacade<TContent>,
        rows: IFluidLayoutRow<TContent>[],
    ): FluidLayoutRowsMethods<TContent> {
        return new FluidLayoutRowsMethods(layoutFacade, rows);
    }

    private getRowFacades = () => {
        if (!this.rowFacades) {
            this.rowFacades = this.rawRows.map((row, index) =>
                FluidLayoutRowMethods.for(this.layoutFacade, row, index),
            );
        }

        return this.rowFacades;
    };

    public raw = (): IFluidLayoutRow<TContent>[] => this.rawRows;

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

    public count = (): number => {
        return this.getRowFacades().length;
    };
}
