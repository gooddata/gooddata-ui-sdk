// (C) 2019-2020 GoodData Corporation
import isArray from "lodash/isArray.js";
import isEmpty from "lodash/isEmpty.js";

import {
    Identifier,
    SortDirection,
    MeasureAggregation,
    TotalType,
    ArithmeticMeasureOperator,
    ObjQualifier,
    MeasureValueFilterCondition,
    RankingFilterOperator,
    Qualifier,
    IPreviousPeriodDateDataSet,
} from "../base/GdcTypes.js";

/**
 * @public
 */
export interface IExecution {
    execution: {
        afm: IAfm;
        resultSpec?: IResultSpec;
    };
}

/**
 * @public
 */
export interface IAfm {
    attributes?: IAttribute[];
    measures?: IMeasure[];
    filters?: CompatibilityFilter[];
    nativeTotals?: INativeTotalItem[];
}

/**
 * @public
 */
export interface IResultSpec {
    dimensions?: IDimension[];
    sorts?: SortItem[];
}

/**
 * @public
 */
export interface IAttribute {
    localIdentifier: Identifier;
    displayForm: ObjQualifier;
    alias?: string;
}

/**
 * @public
 */
export interface IMeasure {
    localIdentifier: Identifier;
    definition: MeasureDefinition;
    alias?: string;
    format?: string;
}

/**
 * @public
 */
export type MeasureDefinition =
    | ISimpleMeasureDefinition
    | IArithmeticMeasureDefinition
    | IPopMeasureDefinition
    | IPreviousPeriodMeasureDefinition;

/**
 * @public
 */
export interface ISimpleMeasureDefinition {
    measure: ISimpleMeasure;
}

/**
 * @public
 */
export interface IArithmeticMeasureDefinition {
    arithmeticMeasure: IArithmeticMeasure;
}

/**
 * @public
 */
export interface IPopMeasureDefinition {
    popMeasure: IPopMeasure;
}

/**
 * @public
 */
export interface IPreviousPeriodMeasureDefinition {
    previousPeriodMeasure: IPreviousPeriodMeasure;
}

/**
 * @public
 */
export interface ISimpleMeasure {
    item: ObjQualifier;
    aggregation?: MeasureAggregation;
    filters?: FilterItem[];
    computeRatio?: boolean;
}

/**
 * @public
 */
export interface IArithmeticMeasure {
    measureIdentifiers: Identifier[];
    operator: ArithmeticMeasureOperator;
}

/**
 * @public
 */
export interface IPopMeasure {
    measureIdentifier: Identifier;
    popAttribute: ObjQualifier;
}

/**
 * @public
 */
export interface IPreviousPeriodMeasure {
    measureIdentifier: Identifier;
    dateDataSets: IPreviousPeriodDateDataSet[];
}

/**
 * @public
 */
export type ExtendedFilter = FilterItem | IMeasureValueFilter | IRankingFilter;

/**
 * @public
 */
export type CompatibilityFilter = IExpressionFilter | ExtendedFilter;

/**
 * @public
 */
export type FilterItem = DateFilterItem | AttributeFilterItem;

/**
 * @public
 */
export type AttributeFilterItem = IPositiveAttributeFilter | INegativeAttributeFilter;

/**
 * @public
 */
export type DateFilterItem = IAbsoluteDateFilter | IRelativeDateFilter;

/**
 * @public
 */
export interface IAttributeElementsByRef {
    uris: string[];
}

/**
 * @public
 */
export interface IAttributeElementsByValue {
    values: string[];
}

/**
 * @public
 */
export type AttributeElements = string[] | IAttributeElementsByRef | IAttributeElementsByValue;

/**
 * @public
 */
export interface IPositiveAttributeFilter {
    positiveAttributeFilter: {
        displayForm: ObjQualifier;
        in: AttributeElements;
    };
}

/**
 * @public
 */
export interface INegativeAttributeFilter {
    negativeAttributeFilter: {
        displayForm: ObjQualifier;
        notIn: AttributeElements;
    };
}

/**
 * @public
 */
export interface IAbsoluteDateFilter {
    absoluteDateFilter: {
        dataSet: ObjQualifier;
        from: string;
        to: string;
    };
}

/**
 * @public
 */
export interface IRelativeDateFilter {
    relativeDateFilter: {
        dataSet: ObjQualifier;
        granularity: string;
        from: number;
        to: number;
    };
}

/**
 * @public
 */
export interface IMeasureValueFilter {
    measureValueFilter: {
        measure: Qualifier;
        condition?: MeasureValueFilterCondition;
    };
}

/**
 * @public
 */
export interface IRankingFilter {
    rankingFilter: {
        measures: Qualifier[];
        attributes?: Qualifier[];
        operator: RankingFilterOperator;
        value: number;
    };
}

/**
 * @public
 * @deprecated Expression filter in AFM can be used only by legacy code
 */
export interface IExpressionFilter {
    expression: {
        value: string;
    };
}

/**
 * @public
 */
export interface ITotalItem {
    measureIdentifier: Identifier;
    type: TotalType;
    attributeIdentifier: Identifier;
}

/**
 * @public
 */
export interface INativeTotalItem {
    measureIdentifier: Identifier;
    attributeIdentifiers: Identifier[];
}

/**
 * @public
 */
export interface IDimension {
    itemIdentifiers: Identifier[];
    totals?: ITotalItem[];
}

/**
 * @public
 */
export type SortItem = IAttributeSortItem | IMeasureSortItem;

/**
 * @public
 */
export interface IAttributeSortItem {
    attributeSortItem: {
        direction: SortDirection;
        attributeIdentifier: Identifier;
        aggregation?: "sum";
    };
}

/**
 * @public
 */
export type VisualizationStyleType = "common" | "table" | "line" | "column" | "bar" | "area";

/**
 * @public
 */
export interface IVisualizationStyle {
    visualizationStyle: {
        type: VisualizationStyleType;
        colorPalette: {
            measure?: {
                color: string;
                periodOverPeriod: string;
            };

            stack?: any;
        };
    };
}

/**
 * @public
 */
export interface IMeasureSortItem {
    measureSortItem: {
        direction: SortDirection;
        locators: LocatorItem[];
    };
}

/**
 * @public
 */
export type LocatorItem = IAttributeLocatorItem | IMeasureLocatorItem;

/**
 * @public
 */
export interface IAttributeLocatorItem {
    attributeLocatorItem: {
        attributeIdentifier: Identifier;
        element: string;
    };
}

/**
 * @public
 */
export interface IMeasureLocatorItem {
    measureLocatorItem: {
        measureIdentifier: Identifier;
    };
}

/**
 * @public
 */
export function isSimpleMeasureDefinition(
    definition: MeasureDefinition,
): definition is ISimpleMeasureDefinition {
    return !isEmpty(definition) && (definition as ISimpleMeasureDefinition).measure !== undefined;
}

/**
 * @public
 */
export function isArithmeticMeasureDefinition(
    definition: MeasureDefinition,
): definition is IArithmeticMeasureDefinition {
    return (
        !isEmpty(definition) && (definition as IArithmeticMeasureDefinition).arithmeticMeasure !== undefined
    );
}

/**
 * @public
 */
export function isPopMeasureDefinition(definition: MeasureDefinition): definition is IPopMeasureDefinition {
    return !isEmpty(definition) && (definition as IPopMeasureDefinition).popMeasure !== undefined;
}

/**
 * @public
 */
export function isPreviousPeriodMeasureDefinition(
    definition: MeasureDefinition,
): definition is IPreviousPeriodMeasureDefinition {
    return (
        !isEmpty(definition) &&
        (definition as IPreviousPeriodMeasureDefinition).previousPeriodMeasure !== undefined
    );
}

/**
 * @public
 */
export function isAttributeSortItem(sortItem: SortItem): sortItem is IAttributeSortItem {
    return !isEmpty(sortItem) && (sortItem as IAttributeSortItem).attributeSortItem !== undefined;
}

/**
 * @public
 */
export function isMeasureSortItem(sortItem: SortItem): sortItem is IMeasureSortItem {
    return !isEmpty(sortItem) && (sortItem as IMeasureSortItem).measureSortItem !== undefined;
}

/**
 * @public
 */
export function isAttributeLocatorItem(locator: LocatorItem): locator is IAttributeLocatorItem {
    return !isEmpty(locator) && (locator as IAttributeLocatorItem).attributeLocatorItem !== undefined;
}

/**
 * @public
 */
export function isMeasureLocatorItem(locator: LocatorItem): locator is IMeasureLocatorItem {
    return !isEmpty(locator) && (locator as IMeasureLocatorItem).measureLocatorItem !== undefined;
}

/**
 * @public
 */
export function isDateFilter(filter: CompatibilityFilter): filter is DateFilterItem {
    return !isEmpty(filter) && (isRelativeDateFilter(filter) || isAbsoluteDateFilter(filter));
}

/**
 * @public
 */
export function isRelativeDateFilter(filter: CompatibilityFilter): filter is IRelativeDateFilter {
    return !isEmpty(filter) && (filter as IRelativeDateFilter).relativeDateFilter !== undefined;
}

/**
 * @public
 */
export function isAbsoluteDateFilter(filter: CompatibilityFilter): filter is IAbsoluteDateFilter {
    return !isEmpty(filter) && (filter as IAbsoluteDateFilter).absoluteDateFilter !== undefined;
}

/**
 * @public
 */
export function isAttributeFilter(filter: CompatibilityFilter): filter is AttributeFilterItem {
    return !isEmpty(filter) && (isPositiveAttributeFilter(filter) || isNegativeAttributeFilter(filter));
}

/**
 * @public
 */
export function isPositiveAttributeFilter(filter: CompatibilityFilter): filter is IPositiveAttributeFilter {
    return !isEmpty(filter) && (filter as IPositiveAttributeFilter).positiveAttributeFilter !== undefined;
}

/**
 * @public
 */
export function isNegativeAttributeFilter(filter: CompatibilityFilter): filter is INegativeAttributeFilter {
    return !isEmpty(filter) && (filter as INegativeAttributeFilter).negativeAttributeFilter !== undefined;
}

/**
 * @public
 */
export function isMeasureValueFilter(filter: CompatibilityFilter): filter is IMeasureValueFilter {
    return !isEmpty(filter) && (filter as IMeasureValueFilter).measureValueFilter !== undefined;
}

/**
 * @public
 */
export function isRankingFilter(filter: CompatibilityFilter): filter is IRankingFilter {
    return !isEmpty(filter) && (filter as IRankingFilter).rankingFilter !== undefined;
}

/**
 * @public
 */
export function isExpressionFilter(filter: CompatibilityFilter): filter is IExpressionFilter {
    return !isEmpty(filter) && (filter as IExpressionFilter).expression !== undefined;
}

/**
 * @public
 */
export function isAttributeElementsArray(
    attributeElements: AttributeElements,
): attributeElements is string[] {
    return attributeElements !== undefined && attributeElements instanceof Array;
}

/**
 * @public
 */
export function isAttributeElementsByRef(
    attributeElements: AttributeElements,
): attributeElements is IAttributeElementsByRef {
    return !isEmpty(attributeElements) && (attributeElements as IAttributeElementsByRef).uris !== undefined;
}

/**
 * @public
 */
export function isAttributeElementsByValue(
    attributeElements: AttributeElements,
): attributeElements is IAttributeElementsByValue {
    return (
        !isEmpty(attributeElements) &&
        !isArray(attributeElements) &&
        (attributeElements as IAttributeElementsByValue).values !== undefined
    );
}
