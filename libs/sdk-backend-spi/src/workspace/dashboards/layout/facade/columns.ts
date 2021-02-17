// (C) 2019-2021 GoodData Corporation
import flatMap from "lodash/flatMap";
import { IFluidLayoutColumn } from "../fluidLayout";
import {
    IFluidLayoutColumnFacade,
    IFluidLayoutColumnsFacade,
    IFluidLayoutColumnsFacadeImpl,
    IFluidLayoutRowFacadeImpl,
} from "./interfaces";
import { FluidLayoutColumnFacade } from "./column";

/**
 * @alpha
 */
export class FluidLayoutColumnsFacade<
    TContent,
    TColumn extends IFluidLayoutColumn<TContent>,
    TColumnFacade extends IFluidLayoutColumnFacade<TContent, TColumn>
> implements IFluidLayoutColumnsFacade<TContent, TColumn, TColumnFacade> {
    protected constructor(protected readonly columnFacades: TColumnFacade[]) {}

    public static for<TContent>(
        rowFacade: IFluidLayoutRowFacadeImpl<TContent>,
        columns: IFluidLayoutColumn<TContent>[],
    ): IFluidLayoutColumnsFacadeImpl<TContent> {
        const columnFacades = columns.map((column, index) =>
            FluidLayoutColumnFacade.for(rowFacade, column, index),
        );
        return new FluidLayoutColumnsFacade(columnFacades);
    }

    public raw(): TColumn[] {
        return this.columnFacades.map((columnFacade) => columnFacade.raw());
    }

    public column(columnIndex: number): TColumnFacade | undefined {
        return this.columnFacades[columnIndex];
    }

    public map<TReturn>(callback: (column: TColumnFacade) => TReturn): TReturn[] {
        return this.columnFacades.map(callback);
    }

    public flatMap<TReturn>(callback: (column: TColumnFacade) => TReturn[]): TReturn[] {
        return flatMap(this.columnFacades, callback);
    }

    public reduce<TReturn>(
        callback: (acc: TReturn, row: TColumnFacade) => TReturn,
        initialValue: TReturn,
    ): TReturn {
        return this.columnFacades.reduce(callback, initialValue);
    }

    public find(pred: (row: TColumnFacade) => boolean): TColumnFacade | undefined {
        return this.columnFacades.find(pred);
    }

    public every(pred: (row: TColumnFacade) => boolean): boolean {
        return this.columnFacades.every(pred);
    }

    public some(pred: (row: TColumnFacade) => boolean): boolean {
        return this.columnFacades.some(pred);
    }

    public filter(pred: (row: TColumnFacade) => boolean): TColumnFacade[] {
        return this.columnFacades.filter(pred);
    }

    public all(): TColumnFacade[] {
        return this.columnFacades;
    }

    public count(): number {
        return this.columnFacades.length;
    }
}
