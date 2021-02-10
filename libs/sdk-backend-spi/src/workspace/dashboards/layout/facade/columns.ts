// (C) 2019-2021 GoodData Corporation
import flatMap from "lodash/flatMap";
import { IFluidLayoutColumn } from "../fluidLayout";
import { IFluidLayoutColumnMethods, IFluidLayoutColumnsMethods, IFluidLayoutRowMethods } from "./interfaces";
import { FluidLayoutColumnMethods } from "./column";

/**
 * TODO: RAIL-2869 add docs
 * @alpha
 */
export class FluidLayoutColumnsMethods<TContent> implements IFluidLayoutColumnsMethods<TContent> {
    private columnFacades: IFluidLayoutColumnMethods<TContent>[] | undefined;

    private constructor(
        private readonly rowFacade: IFluidLayoutRowMethods<TContent>,
        private readonly rawColumns: IFluidLayoutColumn<TContent>[],
    ) {}

    public static for<TContent>(
        rowFacade: IFluidLayoutRowMethods<TContent>,
        columnFacades: IFluidLayoutColumn<TContent>[],
    ): FluidLayoutColumnsMethods<TContent> {
        return new FluidLayoutColumnsMethods(rowFacade, columnFacades);
    }

    private getColumnFacades = () => {
        if (!this.columnFacades) {
            this.columnFacades = this.rawColumns.map((column, index) =>
                FluidLayoutColumnMethods.for(this.rowFacade, column, index),
            );
        }

        return this.columnFacades;
    };

    public raw = (): IFluidLayoutColumn<TContent>[] => this.rawColumns;

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

    public count = (): number => {
        return this.getColumnFacades().length;
    };
}
