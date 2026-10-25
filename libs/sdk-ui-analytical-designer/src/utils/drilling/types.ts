// (C) 2020-2026 GoodData Corporation

import { isEmpty } from "lodash-es";

import { type ILowerBoundedFilter, type IUpperBoundedFilter, type ObjectType } from "@gooddata/sdk-model";
import { type ChartType, type VisElementType, type VisType } from "@gooddata/sdk-ui";

export interface ILegacyDrillEvent {
    executionContext: IAfm;
    drillContext: ILegacyDrillEventContext;
}

export interface ILegacyDrillEventContextBase {
    type: VisType; // type of visualization
    element: VisElementType; // type of visualization element drilled
    x?: number; // chart x coordinate (if supported)
    y?: number; // chart y coordinate (if supported)
    z?: number; // chart z coordinate (if supported)
    columnIndex?: number;
    rowIndex?: number;
    row?: unknown[]; // table row data of the drilled row
    value?: string; // cell or element value drilled
}

export interface ILegacyDrillEventContext extends ILegacyDrillEventContextBase {
    // A collection of chart series points (if available)
    points?: ILegacyDrillPoint[];
    // some drill headers that are relevant for current drill element
    intersection?: ILegacyDrillEventIntersectionElement[];
}

export interface ILegacyDrillPointBase {
    x: number;
    y: number;
    type?: ChartType;
}

export interface ILegacyDrillPoint extends ILegacyDrillPointBase, ILegacyDrillEventIntersection {}

export interface ILegacyDrillEventIntersection {
    intersection: ILegacyDrillEventIntersectionElement[];
}

export interface ILegacyDrillEventIntersectionElement {
    id: string;
    title: string;
    header?: {
        uri: string;
        identifier: string;
        /**
         * Type of the object the identifier names: `displayForm` for a label, `computedAttribute` for a
         * computed attribute (which has no labels and is referenced directly, so this is the only thing
         * telling it apart from a label with the same identifier), `measure` for a metric, `fact` for a
         * measure computed straight from a fact. Absent on element entries, whose `uri` carries the
         * element value.
         */
        type?: ObjectType;
    };
}

// Legacy AFM
export interface IExecution {
    execution: {
        afm: IAfm;
        resultSpec?: IResultSpec;
    };
}

export interface IAfm {
    attributes?: IAttribute[];
    measures?: IMeasure[];
    filters?: CompatibilityFilter[];
    nativeTotals?: INativeTotalItem[];
}

export interface IResultSpec {
    dimensions?: IDimension[];
    sorts?: SortItem[];
}

export interface IAttribute {
    localIdentifier: Identifier;
    displayForm: ObjQualifier;
    alias?: string;
}

export interface IMeasure {
    localIdentifier: Identifier;
    definition: MeasureDefinition;
    alias?: string;
    format?: string;
}

export type MeasureDefinition =
    | ISimpleMeasureDefinition
    | IArithmeticMeasureDefinition
    | IPopMeasureDefinition
    | IPreviousPeriodMeasureDefinition;

export interface ISimpleMeasureDefinition {
    measure: ISimpleMeasure;
}

export interface IArithmeticMeasureDefinition {
    arithmeticMeasure: IArithmeticMeasure;
}

export interface IPopMeasureDefinition {
    popMeasure: IPopMeasure;
}

export interface IPreviousPeriodMeasureDefinition {
    previousPeriodMeasure: IPreviousPeriodMeasure;
}

export type SimpleMeasureAggregation =
    | "sum"
    | "count"
    | "approximate_count"
    | "avg"
    | "min"
    | "max"
    | "median"
    | "runsum";

export interface ISimpleMeasure {
    item: ObjQualifier;
    aggregation?: SimpleMeasureAggregation;
    filters?: FilterItem[];
    computeRatio?: boolean;
}

export type ArithmeticMeasureOperator = "sum" | "difference" | "multiplication" | "ratio" | "change";

export interface IArithmeticMeasure {
    measureIdentifiers: Identifier[];
    operator: ArithmeticMeasureOperator;
}

export interface IPopMeasure {
    measureIdentifier: Identifier;
    popAttribute: ObjQualifier;
}

export interface IPreviousPeriodMeasure {
    measureIdentifier: Identifier;
    dateDataSets: IPreviousPeriodDateDataSet[];
}

export interface IPreviousPeriodDateDataSet {
    dataSet: ObjQualifier;
    periodsAgo: number;
}

// ObjQualifier type
export type Identifier = string;
export type ObjQualifier = IObjUriQualifier | IObjIdentifierQualifier;

export interface IObjIdentifierQualifier {
    identifier: string;
}

export interface IObjUriQualifier {
    uri: string;
}

// Filter types and interfaces
export type ExtendedFilter = FilterItem | IMeasureValueFilter | IRankingFilter;
export type CompatibilityFilter = IExpressionFilter | ExtendedFilter;
export type FilterItem = DateFilterItem | AttributeFilterItem;
export type AttributeFilterItem = IPositiveAttributeFilter | INegativeAttributeFilter;
export type DateFilterItem = IAbsoluteDateFilter | IRelativeDateFilter;

export interface IPositiveAttributeFilter {
    positiveAttributeFilter: {
        displayForm: ObjQualifier;
        in: string[];
        textFilter?: boolean;
    };
}

export interface INegativeAttributeFilter {
    negativeAttributeFilter: {
        displayForm: ObjQualifier;
        notIn: string[];
        textFilter?: boolean;
    };
}

export interface IAbsoluteDateFilter {
    absoluteDateFilter: {
        dataSet: ObjQualifier;
        from: string;
        to: string;
    };
}

export interface IRelativeDateFilter {
    relativeDateFilter: {
        dataSet: ObjQualifier;
        granularity: string;
        from: number;
        to: number;
        boundedFilter?: IUpperBoundedFilter | ILowerBoundedFilter;
    };
}

export type ComparisonConditionOperator =
    | "GREATER_THAN"
    | "GREATER_THAN_OR_EQUAL_TO"
    | "LESS_THAN"
    | "LESS_THAN_OR_EQUAL_TO"
    | "EQUAL_TO"
    | "NOT_EQUAL_TO";

export interface IComparisonCondition {
    comparison: {
        operator: ComparisonConditionOperator;
        value: number;
    };
}

export type RangeConditionOperator = "BETWEEN" | "NOT_BETWEEN";

export interface IRangeCondition {
    range: {
        operator: RangeConditionOperator;
        from: number;
        to: number;
    };
}

export type MeasureValueFilterCondition = IComparisonCondition | IRangeCondition;

export interface ILocalIdentifierQualifier {
    localIdentifier: string;
}

export type Qualifier = ObjQualifier | ILocalIdentifierQualifier;

export interface IMeasureValueFilter {
    measureValueFilter: {
        measure: Qualifier;
        condition?: MeasureValueFilterCondition;
    };
}

export type RankingFilterOperator = "TOP" | "BOTTOM";

export interface IRankingFilter {
    rankingFilter: {
        measures: Qualifier[];
        attributes?: Qualifier[];
        operator: RankingFilterOperator;
        value: number;
        strictLimitOfRows?: boolean;
    };
}

// Might be removed, as we don't know if expression filter is needed
export interface IExpressionFilter {
    value: string;
}

export interface ITotalItem {
    measureIdentifier: Identifier;
    type: TotalType;
    attributeIdentifier: Identifier;
}

export type TotalType = "sum" | "avg" | "max" | "min" | "nat" | "med";

export interface INativeTotalItem {
    measureIdentifier: Identifier;
    attributeIdentifiers: Identifier[];
}

export interface IDimension {
    itemIdentifiers: Identifier[];
    totals?: ITotalItem[];
}

export type SortItem = IAttributeSortItem | IMeasureSortItem;
export type SortDirection = "asc" | "desc";

export interface IAttributeSortItem {
    attributeSortItem: {
        direction: SortDirection;
        attributeIdentifier: Identifier;
        aggregation?: "sum";
    };
}

export interface IMeasureSortItem {
    measureSortItem: {
        direction: SortDirection;
        locators: LocatorItem[];
    };
}

export type LocatorItem = IAttributeLocatorItem | IMeasureLocatorItem;

export interface IAttributeLocatorItem {
    attributeLocatorItem: {
        attributeIdentifier: Identifier;
        element: string;
    };
}

export interface IMeasureLocatorItem {
    measureLocatorItem: {
        measureIdentifier: Identifier;
    };
}

export function isObjectUriQualifier(qualifier: ObjQualifier): qualifier is IObjUriQualifier {
    return !isEmpty(qualifier) && (qualifier as IObjUriQualifier).uri !== undefined;
}

export function isObjIdentifierQualifier(qualifier: ObjQualifier): qualifier is IObjIdentifierQualifier {
    return !isEmpty(qualifier) && (qualifier as IObjIdentifierQualifier).identifier !== undefined;
}

export function isSimpleMeasureDefinition(
    definition: MeasureDefinition,
): definition is ISimpleMeasureDefinition {
    return !isEmpty(definition) && (definition as ISimpleMeasureDefinition).measure !== undefined;
}

export function isArithmeticMeasureDefinition(
    definition: MeasureDefinition,
): definition is IArithmeticMeasureDefinition {
    return (
        !isEmpty(definition) && (definition as IArithmeticMeasureDefinition).arithmeticMeasure !== undefined
    );
}

export function isPreviousPeriodMeasureDefinition(
    definition: MeasureDefinition,
): definition is IPreviousPeriodMeasureDefinition {
    return (
        !isEmpty(definition) &&
        (definition as IPreviousPeriodMeasureDefinition).previousPeriodMeasure !== undefined
    );
}

export function isDateFilter(filter: CompatibilityFilter): filter is DateFilterItem {
    return !isEmpty(filter) && (isRelativeDateFilter(filter) || isAbsoluteDateFilter(filter));
}

export function isRelativeDateFilter(filter: CompatibilityFilter): filter is IRelativeDateFilter {
    return !isEmpty(filter) && (filter as IRelativeDateFilter).relativeDateFilter !== undefined;
}

export function isAbsoluteDateFilter(filter: CompatibilityFilter): filter is IAbsoluteDateFilter {
    return !isEmpty(filter) && (filter as IAbsoluteDateFilter).absoluteDateFilter !== undefined;
}

export function isAttributeFilter(filter: CompatibilityFilter): filter is AttributeFilterItem {
    return !isEmpty(filter) && (isPositiveAttributeFilter(filter) || isNegativeAttributeFilter(filter));
}

export function isPositiveAttributeFilter(filter: CompatibilityFilter): filter is IPositiveAttributeFilter {
    return !isEmpty(filter) && (filter as IPositiveAttributeFilter).positiveAttributeFilter !== undefined;
}

export function isNegativeAttributeFilter(filter: CompatibilityFilter): filter is INegativeAttributeFilter {
    return !isEmpty(filter) && (filter as INegativeAttributeFilter).negativeAttributeFilter !== undefined;
}

export function isMeasureValueFilter(filter: CompatibilityFilter): filter is IMeasureValueFilter {
    return !isEmpty(filter) && (filter as IMeasureValueFilter).measureValueFilter !== undefined;
}

export function isRankingFilter(filter: CompatibilityFilter): filter is IRankingFilter {
    return !isEmpty(filter) && (filter as IRankingFilter).rankingFilter !== undefined;
}

export function isExpressionFilter(filter: CompatibilityFilter): filter is IExpressionFilter {
    return !isEmpty(filter) && (filter as IExpressionFilter).value !== undefined;
}
