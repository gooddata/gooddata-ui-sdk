// (C) 2019-2021 GoodData Corporation
import {
    IDashboardLayoutItem,
    IDashboardLayoutSectionHeader,
    IDashboardLayoutSize,
    IDashboardLayoutSizeByScreenSize,
    IInsightWidget,
    IInsightWidgetDefinition,
    IKpiWidget,
    IKpiWidgetDefinition,
    IWidget,
    IWidgetDefinition,
    ScreenSize,
    IDashboardLayout,
    IDashboardLayoutSection,
    IDashboardWidget,
} from "@gooddata/sdk-backend-spi";
import { ObjRef } from "@gooddata/sdk-model";

/**
 * Set of convenience methods for a {@link @gooddata/sdk-backend-spi#IDashboardLayoutItem}.
 *
 * @beta
 */
export interface IDashboardLayoutItemFacade<TWidget> {
    raw(): IDashboardLayoutItem<TWidget>;
    index(): number;
    size(): IDashboardLayoutSizeByScreenSize;
    sizeForScreen(screen: ScreenSize): IDashboardLayoutSize | undefined;
    widget(): TWidget | undefined;
    section(): IDashboardLayoutSectionFacade<TWidget>;
    // item predicates
    indexIs(index: number): boolean;
    isFirst(): boolean;
    isLast(): boolean;
    isEmpty(): boolean;
    testRaw(pred: (item: IDashboardLayoutItem<TWidget>) => boolean): boolean;
    test(pred: (item: IDashboardLayoutItemFacade<TWidget>) => boolean): boolean;
    hasSizeForScreen(screen: ScreenSize): boolean;
    // widget predicates
    widgetEquals(widget: TWidget): boolean;
    widgetIs(widget: TWidget): boolean;
    isWidgetItem(): this is IDashboardLayoutItemFacade<IWidget>;
    isWidgetDefinitionItem(): this is IDashboardLayoutItemFacade<IWidgetDefinition>;
    isKpiWidgetItem(): this is IDashboardLayoutItemFacade<IKpiWidget>;
    isKpiWidgetDefinitionItem(): this is IDashboardLayoutItemFacade<IKpiWidgetDefinition>;
    isInsightWidgetItem(): this is IDashboardLayoutItemFacade<IInsightWidget>;
    isInsightWidgetDefinitionItem(): this is IDashboardLayoutItemFacade<IInsightWidgetDefinition>;
    isLayoutItem(): this is IDashboardLayoutItemFacade<IDashboardLayout<TWidget>>;
    isCustomItem(): this is IDashboardLayoutItemFacade<Exclude<TWidget, IDashboardWidget>>;
    isWidgetItemWithRef(ref: ObjRef): boolean;
    isWidgetItemWithInsightRef(ref: ObjRef): boolean;
    isWidgetItemWithKpiRef(ref: ObjRef): boolean;
}

/**
 * Set of convenience methods for a collection of {@link @gooddata/sdk-backend-spi#IDashboardLayoutItem} items.
 *
 * @beta
 */
export interface IDashboardLayoutItemsFacade<TWidget> {
    raw(): IDashboardLayoutItem<TWidget>[];
    item(index: number): IDashboardLayoutItemFacade<TWidget> | undefined;
    all(): IDashboardLayoutItemFacade<TWidget>[];
    asGridRows(screen: ScreenSize): IDashboardLayoutItemFacade<TWidget>[][];
    count(): number;
    flatMap<TReturn>(callback: (widgetFacade: IDashboardLayoutItemFacade<TWidget>) => TReturn[]): TReturn[];
    map<TReturn>(callback: (item: IDashboardLayoutItemFacade<TWidget>) => TReturn): TReturn[];
    reduce<TReturn>(
        callback: (acc: TReturn, item: IDashboardLayoutItemFacade<TWidget>) => TReturn,
        initialValue: TReturn,
    ): TReturn;
    every(pred: (item: IDashboardLayoutItemFacade<TWidget>) => boolean): boolean;
    some(pred: (item: IDashboardLayoutItemFacade<TWidget>) => boolean): boolean;
    find(
        pred: (item: IDashboardLayoutItemFacade<TWidget>) => boolean,
    ): IDashboardLayoutItemFacade<TWidget> | undefined;
    filter(
        pred: (item: IDashboardLayoutItemFacade<TWidget>) => boolean,
    ): IDashboardLayoutItemFacade<TWidget>[];
}

/**
 * Set of convenience methods for a {@link @gooddata/sdk-backend-spi#IDashboardLayoutSection}.
 *
 * @beta
 */
export interface IDashboardLayoutSectionFacade<TWidget> {
    raw(): IDashboardLayoutSection<TWidget>;
    index(): number;
    header(): IDashboardLayoutSectionHeader | undefined;
    title(): string | undefined;
    description(): string | undefined;
    item(itemIndex: number): IDashboardLayoutItemFacade<TWidget> | undefined;
    items(): IDashboardLayoutItemsFacade<TWidget>;
    layout(): IDashboardLayoutFacade<TWidget>;
    // section predicates
    indexIs(index: number): boolean;
    isFirst(): boolean;
    isLast(): boolean;
    isEmpty(): boolean;
    headerEquals(header: IDashboardLayoutSectionHeader): boolean;
    hasHeader(): boolean;
    hasTitle(): boolean;
    hasDescription(): boolean;
    titleEquals(title: string): boolean;
    descriptionEquals(title: string): boolean;
    testRaw(pred: (section: IDashboardLayoutSection<TWidget>) => boolean): boolean;
    test(pred: (section: IDashboardLayoutSectionFacade<TWidget>) => boolean): boolean;
}

/**
 * Set of convenience methods for a collection of {@link @gooddata/sdk-backend-spi#IDashboardLayoutSection} items.
 *
 * @beta
 */
export interface IDashboardLayoutSectionsFacade<TWidget> {
    raw(): IDashboardLayoutSection<TWidget>[];
    section(sectionIndex: number): IDashboardLayoutSectionFacade<TWidget> | undefined;
    all(): IDashboardLayoutSectionFacade<TWidget>[];
    count(): number;
    flatMap<TReturn>(callback: (section: IDashboardLayoutSectionFacade<TWidget>) => TReturn[]): TReturn[];
    map<TReturn>(callback: (section: IDashboardLayoutSectionFacade<TWidget>) => TReturn): TReturn[];
    reduce<TReturn>(
        callback: (acc: TReturn, section: IDashboardLayoutSectionFacade<TWidget>) => TReturn,
        initialValue: TReturn,
    ): TReturn;
    every(pred: (section: IDashboardLayoutSectionFacade<TWidget>) => boolean): boolean;
    some(pred: (section: IDashboardLayoutSectionFacade<TWidget>) => boolean): boolean;
    find(
        pred: (section: IDashboardLayoutSectionFacade<TWidget>) => boolean,
    ): IDashboardLayoutSectionFacade<TWidget> | undefined;
    filter(
        pred: (section: IDashboardLayoutSectionFacade<TWidget>) => boolean,
    ): IDashboardLayoutSectionFacade<TWidget>[];
}

/**
 * Layout facade is simple wrapper around {@link @gooddata/sdk-backend-spi#IDashboardLayout},
 * that allows to query dashboard sections, items & widgets with ease thanks to set of common predicates & helper methods.
 * If you are extending the dashboard layout with some new functionality,
 * this is the place where you can put the new methods to cover it.
 *
 * Note: This class serves mainly for getting data from the layout.
 *       If you are looking for the layout transformations, check {@link IDashboardLayoutBuilder}
 *
 * @beta
 */
export interface IDashboardLayoutFacade<TWidget> {
    size(): IDashboardLayoutSize | undefined;
    sections(): IDashboardLayoutSectionsFacade<TWidget>;
    section(sectionIndex: number): IDashboardLayoutSectionFacade<TWidget> | undefined;
    raw(): IDashboardLayout<TWidget>;
}
