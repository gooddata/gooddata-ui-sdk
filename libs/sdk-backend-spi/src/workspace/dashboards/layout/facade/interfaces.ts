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
 * @alpha
 */
export interface IFluidLayoutColumnFacade<TContent, TColumn extends IFluidLayoutColumn<TContent>> {
    raw(): TColumn;

    testRaw(pred: (column: TColumn) => boolean): boolean;
    test(pred: (column: this) => boolean): boolean;

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

    isEmpty(): boolean;

    // override
    row(): IFluidLayoutRowFacade<TContent, IFluidLayoutRow<TContent>>;
}

/**
 * @alpha
 */
export interface IFluidLayoutColumnsFacade<
    TContent,
    TColumn extends IFluidLayoutColumn<TContent>,
    TColumnFacade extends IFluidLayoutColumnFacade<TContent, TColumn>
> {
    raw(): TColumn[];
    column(columnIndex: number): TColumnFacade | undefined;
    map<TReturn>(callback: (column: TColumnFacade) => TReturn): TReturn[];
    flatMap<TReturn>(callback: (row: TColumnFacade) => TReturn[]): TReturn[];
    reduce<TReturn>(
        callback: (acc: TReturn, column: TColumnFacade) => TReturn,
        initialValue: TReturn,
    ): TReturn;
    find(pred: (column: TColumnFacade) => boolean): TColumnFacade | undefined;
    every(pred: (column: TColumnFacade) => boolean): boolean;
    some(pred: (column: TColumnFacade) => boolean): boolean;
    filter(pred: (row: TColumnFacade) => boolean): TColumnFacade[];
    all(): TColumnFacade[];
    count(): number;
}

/**
 * @alpha
 */
export interface IFluidLayoutRowFacade<TContent, TRow extends IFluidLayoutRow<TContent>> {
    raw(): TRow;

    testRaw(pred: (column: TRow) => boolean): boolean;
    test(pred: (column: this) => boolean): boolean;

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

    isFirst(): boolean;
    isLast(): boolean;
    isEmpty(): boolean;

    // overrides
    columns(): IFluidLayoutColumnsFacade<
        TContent,
        IFluidLayoutColumn<TContent>,
        IFluidLayoutColumnFacade<TContent, IFluidLayoutColumn<TContent>>
    >;
    layout(): IFluidLayoutFacade<TContent, IFluidLayout<TContent>>;
}

/**
 * @alpha
 */
export interface IFluidLayoutRowsFacade<
    TContent,
    TRow extends IFluidLayoutRow<TContent>,
    TRowFacade extends IFluidLayoutRowFacade<TContent, TRow>
> {
    raw(): TRow[];
    row(rowIndex: number): TRowFacade | undefined;
    map<TReturn>(callback: (row: TRowFacade) => TReturn): TReturn[];
    flatMap<TReturn>(callback: (row: TRowFacade) => TReturn[]): TReturn[];
    reduce<TReturn>(callback: (acc: TReturn, row: TRowFacade) => TReturn, initialValue: TReturn): TReturn;
    find(pred: (row: TRowFacade) => boolean): TRowFacade | undefined;
    every(pred: (row: TRowFacade) => boolean): boolean;
    some(pred: (row: TRowFacade) => boolean): boolean;
    filter(pred: (row: TRowFacade) => boolean): TRowFacade[];
    all(): TRowFacade[];
    count(): number;
}

/**
 * @alpha
 */
export interface IFluidLayoutFacade<TContent, TLayout extends IFluidLayout<TContent>> {
    size(): IFluidLayoutSize | undefined;
    rows(): IFluidLayoutRowsFacade<
        TContent,
        IFluidLayoutRow<TContent>,
        IFluidLayoutRowFacade<TContent, IFluidLayoutRow<TContent>>
    >;
    raw(): TLayout;
}

/**
 * @alpha
 */
export type IFluidLayoutFacadeImpl<TContent> = IFluidLayoutFacade<TContent, IFluidLayout<TContent>>;

/**
 * @alpha
 */
export type IFluidLayoutRowsFacadeImpl<TContent> = IFluidLayoutRowsFacade<
    TContent,
    IFluidLayoutRow<TContent>,
    IFluidLayoutRowFacadeImpl<TContent>
>;

/**
 * @alpha
 */
export type IFluidLayoutRowFacadeImpl<TContent> = IFluidLayoutRowFacade<TContent, IFluidLayoutRow<TContent>>;

/**
 * @alpha
 */
export type IFluidLayoutColumnsFacadeImpl<TContent> = IFluidLayoutColumnsFacade<
    TContent,
    IFluidLayoutColumn<TContent>,
    IFluidLayoutColumnFacadeImpl<TContent>
>;

/**
 * @alpha
 */
export type IFluidLayoutColumnFacadeImpl<TContent> = IFluidLayoutColumnFacade<
    TContent,
    IFluidLayoutColumn<TContent>
>;
