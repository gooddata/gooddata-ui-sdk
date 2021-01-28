// (C) 2019-2021 GoodData Corporation
import {
    IFluidLayout,
    IFluidLayoutColumn,
    IFluidLayoutRow,
    IFluidLayoutSectionHeader,
    IFluidLayoutSize,
    IFluidLayoutSizeByScreen,
    ResponsiveScreenType,
} from "./fluidLayout";

/**
 * TODO: RAIL-2869 add docs
 * @alpha
 */
export interface IFluidLayoutColumnMethods<TContent> {
    raw(): IFluidLayoutColumn<TContent>;
    index(): number;
    size(): IFluidLayoutSizeByScreen;
    sizeForScreen(screen: ResponsiveScreenType): IFluidLayoutSize | undefined;
    style(): IFluidLayoutColumn<TContent>["style"];
    content(): TContent | undefined;
    row(): IFluidLayoutRowMethods<TContent>;
    isLastInRow(): boolean;
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
}

/**
 * TODO: RAIL-2869 add docs
 * @alpha
 */
export interface IFluidLayoutRowMethods<TContent> {
    raw(): IFluidLayoutRow<TContent>;
    index(): number;
    header(): IFluidLayoutSectionHeader | undefined;
    style(): IFluidLayoutRow<TContent>["style"] | undefined;
    columns(): IFluidLayoutColumnsMethods<TContent>;
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
}

/**
 * TODO: RAIL-2869 add docs
 * @alpha
 */
export interface IFluidLayoutFacade<TContent> {
    rows(): IFluidLayoutRowsMethods<TContent>;
    raw(): IFluidLayout<TContent>;
}
