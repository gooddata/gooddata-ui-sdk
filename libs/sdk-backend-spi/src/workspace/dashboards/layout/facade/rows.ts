// (C) 2019-2021 GoodData Corporation
import flatMap from "lodash/flatMap";
import { IFluidLayout, IFluidLayoutRow } from "../fluidLayout";
import {
    IFluidLayoutRowsFacade,
    IFluidLayoutRowFacade,
    IFluidLayoutRowsFacadeImpl,
    IFluidLayoutFacadeImpl,
    IFluidLayoutFacade,
} from "./interfaces";
import { FluidLayoutRowFacade } from "./row";

/**
 * @alpha
 */
export class FluidLayoutRowsFacade<
    TContent,
    TRow extends IFluidLayoutRow<TContent>,
    TRowFacade extends IFluidLayoutRowFacade<TContent, TRow>,
    TLayout extends IFluidLayout<TContent>,
    TLayoutFacade extends IFluidLayoutFacade<TContent, TLayout>
> implements IFluidLayoutRowsFacade<TContent, TRow, TRowFacade> {
    protected constructor(
        protected readonly layoutFacade: TLayoutFacade,
        protected readonly rowFacades: TRowFacade[],
    ) {}

    public static for<TContent>(
        layoutFacade: IFluidLayoutFacadeImpl<TContent>,
        rows: IFluidLayoutRow<TContent>[],
    ): IFluidLayoutRowsFacadeImpl<TContent> {
        const rowFacades = rows.map((row, index) => FluidLayoutRowFacade.for(layoutFacade, row, index));
        return new FluidLayoutRowsFacade(layoutFacade, rowFacades);
    }

    public raw(): TRow[] {
        return this.rowFacades.map((row) => row.raw());
    }

    public row(rowIndex: number): TRowFacade | undefined {
        return this.rowFacades[rowIndex];
    }

    public map<TReturn>(callback: (row: TRowFacade) => TReturn): TReturn[] {
        return this.rowFacades.map(callback);
    }

    public flatMap<TReturn>(callback: (row: TRowFacade) => TReturn[]): TReturn[] {
        return flatMap(this.rowFacades, callback);
    }

    public reduce<TReturn>(
        callback: (acc: TReturn, row: TRowFacade) => TReturn,
        initialValue: TReturn,
    ): TReturn {
        return this.rowFacades.reduce(callback, initialValue);
    }

    public find(pred: (row: TRowFacade) => boolean): TRowFacade | undefined {
        return this.rowFacades.find(pred);
    }

    public every(pred: (row: TRowFacade) => boolean): boolean {
        return this.rowFacades.every(pred);
    }

    public some(pred: (row: TRowFacade) => boolean): boolean {
        return this.rowFacades.some(pred);
    }

    public filter(pred: (row: TRowFacade) => boolean): TRowFacade[] {
        return this.rowFacades.filter(pred);
    }

    public all(): TRowFacade[] {
        return this.rowFacades;
    }

    public count(): number {
        return this.rowFacades.length;
    }
}
