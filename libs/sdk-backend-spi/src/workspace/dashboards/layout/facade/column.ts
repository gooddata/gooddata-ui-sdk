// (C) 2019-2021 GoodData Corporation
import isEqual from "lodash/isEqual";
import isNil from "lodash/isNil";
import {
    IFluidLayoutColumn,
    IFluidLayoutRow,
    IFluidLayoutSize,
    IFluidLayoutSizeByScreen,
    ResponsiveScreenType,
} from "../fluidLayout";

import {
    IFluidLayoutColumnFacade,
    IFluidLayoutColumnFacadeImpl,
    IFluidLayoutRowFacade,
    IFluidLayoutRowFacadeImpl,
} from "./interfaces";

/**
 * @alpha
 */
export class FluidLayoutColumnFacade<
    TContent,
    TColumn extends IFluidLayoutColumn<TContent>,
    TRow extends IFluidLayoutRow<TContent>,
    TRowFacade extends IFluidLayoutRowFacade<TContent, TRow>
> implements IFluidLayoutColumnFacade<TContent, TColumn> {
    protected constructor(
        protected readonly rowFacade: TRowFacade,
        protected readonly column: TColumn,
        protected readonly columnIndex: number,
    ) {}

    public static for<TContent>(
        rowFacade: IFluidLayoutRowFacadeImpl<TContent>,
        column: IFluidLayoutColumn<TContent>,
        index: number,
    ): IFluidLayoutColumnFacadeImpl<TContent> {
        return new FluidLayoutColumnFacade(rowFacade, column, index);
    }

    public raw(): TColumn {
        return this.column;
    }

    public index(): number {
        return this.columnIndex;
    }

    public indexIs(index: number): boolean {
        return this.index() === index;
    }

    public size(): IFluidLayoutSizeByScreen {
        return this.column.size;
    }

    public sizeForScreen(screen: ResponsiveScreenType): IFluidLayoutSize | undefined {
        return this.size()[screen];
    }

    public hasSizeForScreen(screen: ResponsiveScreenType): boolean {
        return !isNil(this.sizeForScreen(screen));
    }

    public hasContent(): boolean {
        return !isNil(this.content());
    }

    public content(): TContent | undefined {
        return this.column.content;
    }

    public contentEquals(content: TContent | undefined): boolean {
        return isEqual(this.content(), content);
    }

    public contentIs(content: TContent): boolean {
        return this.content() === content;
    }

    public isFirstInRow(): boolean {
        return this.indexIs(0);
    }

    public isLastInRow(): boolean {
        return this.indexIs(this.rowFacade.columns().count() - 1);
    }

    public testRaw(pred: (column: TColumn) => boolean): boolean {
        return pred(this.raw());
    }

    public test(pred: (column: this) => boolean): boolean {
        return pred(this);
    }

    public isEmpty(): boolean {
        return isNil(this.content);
    }

    public row(): IFluidLayoutRowFacadeImpl<TContent> {
        return this.rowFacade;
    }
}
