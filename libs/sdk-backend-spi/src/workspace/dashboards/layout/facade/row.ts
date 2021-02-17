// (C) 2019-2021 GoodData Corporation
import isEqual from "lodash/isEqual";
import isNil from "lodash/isNil";
import { IFluidLayout, IFluidLayoutRow, IFluidLayoutSectionHeader } from "../fluidLayout";
import { FluidLayoutColumnsFacade } from "./columns";
import {
    IFluidLayoutRowFacade,
    IFluidLayoutRowFacadeImpl,
    IFluidLayoutFacade,
    IFluidLayoutFacadeImpl,
    IFluidLayoutColumnsFacadeImpl,
} from "./interfaces";

/**
 * @alpha
 */
export class FluidLayoutRowFacade<
    TContent,
    TRow extends IFluidLayoutRow<TContent>,
    TLayout extends IFluidLayout<TContent>,
    TLayoutFacade extends IFluidLayoutFacade<TContent, TLayout>
> implements IFluidLayoutRowFacade<TContent, TRow> {
    protected constructor(
        protected readonly layoutFacade: TLayoutFacade,
        protected readonly row: TRow,
        protected readonly rowIndex: number,
    ) {}

    public static for<TContent>(
        layoutFacade: IFluidLayoutFacadeImpl<TContent>,
        row: IFluidLayoutRow<TContent>,
        index: number,
    ): IFluidLayoutRowFacadeImpl<TContent> {
        return new FluidLayoutRowFacade(layoutFacade, row, index);
    }

    public raw(): TRow {
        return this.row;
    }

    public header(): IFluidLayoutSectionHeader | undefined {
        return this.row.header;
    }

    public title(): string | undefined {
        return this.header()?.title;
    }

    public description(): string | undefined {
        return this.header()?.description;
    }

    public index(): number {
        return this.rowIndex;
    }

    public isFirst(): boolean {
        return this.indexIs(0);
    }

    public isLast(): boolean {
        return this.indexIs(this.layoutFacade.rows().count() - 1);
    }

    public testRaw(pred: (row: TRow) => boolean): boolean {
        return pred(this.raw());
    }

    public test(pred: (row: this) => boolean): boolean {
        return pred(this);
    }

    public indexIs(index: number): boolean {
        return this.index() === index;
    }

    public headerEquals(header: IFluidLayoutSectionHeader): boolean {
        return isEqual(this.header(), header);
    }

    public hasHeader(): boolean {
        return !isNil(this.header());
    }

    public hasTitle(): boolean {
        return !isNil(this.title());
    }

    public hasDescription(): boolean {
        return !isNil(this.description());
    }

    public titleEquals(title: string): boolean {
        return isEqual(this.title(), title);
    }

    public descriptionEquals(description: string): boolean {
        return isEqual(this.description(), description);
    }

    public isEmpty(): boolean {
        return this.columns().count() === 0;
    }

    public columns(): IFluidLayoutColumnsFacadeImpl<TContent> {
        return FluidLayoutColumnsFacade.for(this, this.row.columns);
    }

    public layout(): IFluidLayoutFacadeImpl<TContent> {
        return this.layoutFacade;
    }
}
