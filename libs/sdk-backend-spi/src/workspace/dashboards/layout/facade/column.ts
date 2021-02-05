// (C) 2019-2021 GoodData Corporation
import isEqual from "lodash/isEqual";
import isNil from "lodash/isNil";
import {
    IFluidLayoutColumn,
    IFluidLayoutSize,
    IFluidLayoutSizeByScreen,
    ResponsiveScreenType,
} from "../fluidLayout";

import { IFluidLayoutColumnMethods, IFluidLayoutRowMethods } from "./interfaces";

/**
 * TODO: RAIL-2869 add docs
 * @alpha
 */
export class FluidLayoutColumnMethods<TContent> implements IFluidLayoutColumnMethods<TContent> {
    private constructor(
        private readonly rowFacade: IFluidLayoutRowMethods<TContent>,
        private readonly column: IFluidLayoutColumn<TContent>,
        private readonly columnIndex: number,
    ) {}

    public static for<TContent>(
        rowFacade: IFluidLayoutRowMethods<TContent>,
        column: IFluidLayoutColumn<TContent>,
        index: number,
    ): FluidLayoutColumnMethods<TContent> {
        return new FluidLayoutColumnMethods(rowFacade, column, index);
    }

    public raw = (): IFluidLayoutColumn<TContent> => this.column;

    public index = (): number => this.columnIndex;

    public indexIs = (index: number): boolean => this.index() === index;

    public size = (): IFluidLayoutSizeByScreen => this.column.size;

    public sizeForScreen = (screen: ResponsiveScreenType): IFluidLayoutSize | undefined =>
        this.size()[screen];

    public hasSizeForScreen = (screen: ResponsiveScreenType): boolean => !isNil(this.sizeForScreen(screen));

    public hasContent = (): boolean => !isNil(this.content());

    public content = (): TContent | undefined => this.column.content;

    public contentEquals = (content: TContent | undefined): boolean => isEqual(this.content(), content);

    public contentIs = (content: TContent): boolean => this.content() === content;

    public row = (): IFluidLayoutRowMethods<TContent> => this.rowFacade;

    public isFirstInRow = (): boolean => this.indexIs(0);

    public isLastInRow = (): boolean => this.indexIs(this.rowFacade.columns().raw().length - 1);

    public testRaw = (pred: (column: IFluidLayoutColumn<TContent>) => boolean): boolean => pred(this.raw());

    public test = (pred: (column: IFluidLayoutColumnMethods<TContent>) => boolean): boolean => pred(this);
}
