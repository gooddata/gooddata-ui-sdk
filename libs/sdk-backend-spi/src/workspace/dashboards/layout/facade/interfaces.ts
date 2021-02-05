// (C) 2019-2021 GoodData Corporation
import {
    IFluidLayout,
    IFluidLayoutColumn,
    IFluidLayoutRow,
    IFluidLayoutSectionHeader,
    IFluidLayoutSize,
    IFluidLayoutSizeByScreen,
    ResponsiveScreenType,
} from "../fluidLayout";

/**
 * TODO: RAIL-2869 add docs
 * @alpha
 */
export interface IFluidLayoutColumnMethods<TContent> {
    raw(): IFluidLayoutColumn<TContent>;

    testRaw(pred: (column: IFluidLayoutColumn<TContent>) => boolean): boolean;
    test(pred: (column: IFluidLayoutColumnMethods<TContent>) => boolean): boolean;

    index(): number;
    indexIs(index: number): boolean;

    size(): IFluidLayoutSizeByScreen;
    sizeForScreen(screen: ResponsiveScreenType): IFluidLayoutSize | undefined;
    hasSizeForScreen(screen: ResponsiveScreenType): boolean;

    content(): TContent | undefined;
    hasContent(): boolean;
    contentEquals(content: TContent): boolean;
    contentIs(content: TContent): boolean;

    isFirstInRow(): boolean;
    isLastInRow(): boolean;

    row(): IFluidLayoutRowMethods<TContent>;
}

/**
 * TODO: RAIL-2869 add docs
 * @alpha
 */
export interface IFluidLayoutColumnsMethods<TContent> {
    raw(): IFluidLayoutColumn<TContent>[];
    column(columnIndex: number): IFluidLayoutColumnMethods<TContent> | undefined;
    map<TReturn>(callback: (column: IFluidLayoutColumnMethods<TContent>) => TReturn): TReturn[];
    flatMap<TReturn>(callback: (row: IFluidLayoutColumnMethods<TContent>) => TReturn[]): TReturn[];
    reduce<TReturn>(
        callback: (acc: TReturn, column: IFluidLayoutColumnMethods<TContent>) => TReturn,
        initialValue: TReturn,
    ): TReturn;
    find(
        pred: (column: IFluidLayoutColumnMethods<TContent>) => boolean,
    ): IFluidLayoutColumnMethods<TContent> | undefined;
    every(pred: (column: IFluidLayoutColumnMethods<TContent>) => boolean): boolean;
    some(pred: (column: IFluidLayoutColumnMethods<TContent>) => boolean): boolean;
    filter(
        pred: (row: IFluidLayoutColumnMethods<TContent>) => boolean,
    ): IFluidLayoutColumnMethods<TContent>[];
    all(): IFluidLayoutColumnMethods<TContent>[];
    count(): number;
}

/**
 * TODO: RAIL-2869 add docs
 * @alpha
 */
export interface IFluidLayoutRowMethods<TContent> {
    raw(): IFluidLayoutRow<TContent>;

    testRaw(pred: (column: IFluidLayoutRow<TContent>) => boolean): boolean;
    test(pred: (column: IFluidLayoutRowMethods<TContent>) => boolean): boolean;

    index(): number;
    indexIs(index: number): boolean;

    header(): IFluidLayoutSectionHeader | undefined;
    title(): string | undefined;
    description(): string | undefined;
    headerEquals(header: IFluidLayoutSectionHeader): boolean;
    hasHeader(): boolean;
    hasTitle(): boolean;
    hasDescription(): boolean;
    titleEquals(title: string): boolean;
    descriptionEquals(title: string): boolean;

    columns(): IFluidLayoutColumnsMethods<TContent>;

    isFirst(): boolean;
    isLast(): boolean;

    layout(): IFluidLayoutFacade<TContent>;
}

/**
 * TODO: RAIL-2869 add docs
 * @alpha
 */
export interface IFluidLayoutRowsMethods<TContent> {
    raw(): IFluidLayoutRow<TContent>[];
    row(rowIndex: number): IFluidLayoutRowMethods<TContent> | undefined;
    map<TReturn>(callback: (row: IFluidLayoutRowMethods<TContent>) => TReturn): TReturn[];
    flatMap<TReturn>(callback: (row: IFluidLayoutRowMethods<TContent>) => TReturn[]): TReturn[];
    reduce<TReturn>(
        callback: (acc: TReturn, row: IFluidLayoutRowMethods<TContent>) => TReturn,
        initialValue: TReturn,
    ): TReturn;
    find(
        pred: (row: IFluidLayoutRowMethods<TContent>) => boolean,
    ): IFluidLayoutRowMethods<TContent> | undefined;
    every(pred: (row: IFluidLayoutRowMethods<TContent>) => boolean): boolean;
    some(pred: (row: IFluidLayoutRowMethods<TContent>) => boolean): boolean;
    filter(pred: (row: IFluidLayoutRowMethods<TContent>) => boolean): IFluidLayoutRowMethods<TContent>[];
    all(): IFluidLayoutRowMethods<TContent>[];
    count(): number;
}

/**
 * TODO: RAIL-2869 add docs
 * @alpha
 */
export interface IFluidLayoutFacade<TContent> {
    size(): IFluidLayoutSize | undefined;
    rows(): IFluidLayoutRowsMethods<TContent>;
    raw(): IFluidLayout<TContent>;
}
