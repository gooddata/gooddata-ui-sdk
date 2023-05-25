// (C) 2007-2023 GoodData Corporation
import isEmpty from "lodash/isEmpty.js";
import { IObjectMeta } from "../meta/GdcMetadata.js";

/**
 * @public
 */
export type SortDirection = "asc" | "desc";

/**
 * @public
 */
export type Identifier = string;

/**
 * @public
 */
export type MeasureAggregation = "sum" | "count" | "avg" | "min" | "max" | "median" | "runsum";

/**
 * @public
 */
export type TotalType = "sum" | "avg" | "max" | "min" | "nat" | "med";

/**
 * @public
 */
export type VisualizationType = "table" | "line" | "column" | "bar" | "pie" | "doughnut" | "combo" | "area";

/**
 * @public
 */
export type ArithmeticMeasureOperator = "sum" | "difference" | "multiplication" | "ratio" | "change";

/**
 * @public
 */
export type BucketItem = IMeasure | IAttribute;

/**
 * @public
 */
export type ExtendedFilter = Filter | IMeasureValueFilter | IRankingFilter;

/**
 * @public
 */
export type Filter = DateFilter | AttributeFilter;

/**
 * @public
 */
export type DateFilter = IRelativeDateFilter | IAbsoluteDateFilter;

/**
 * @public
 */
export type AttributeFilter = IPositiveAttributeFilter | INegativeAttributeFilter;

/**
 * @public
 */
export interface IObjUriQualifier {
    uri: string;
}

/**
 * @public
 */
export interface IObjIdentifierQualifier {
    identifier: string;
}

/**
 * @public
 */
export type ObjQualifier = IObjUriQualifier | IObjIdentifierQualifier;

/**
 * @public
 */
export function isObjUriQualifier(objQualifier: ObjQualifier): objQualifier is IObjUriQualifier {
    return !isEmpty(objQualifier) && (objQualifier as IObjUriQualifier).uri !== undefined;
}

/**
 * @public
 */
export function isObjIdentifierQualifier(
    objQualifier: ObjQualifier,
): objQualifier is IObjIdentifierQualifier {
    return !isEmpty(objQualifier) && (objQualifier as IObjIdentifierQualifier).identifier !== undefined;
}

/**
 * @public
 */
export interface IPositiveAttributeFilter {
    positiveAttributeFilter: {
        displayForm: ObjQualifier;
        in: string[];
    };
}

/**
 * @public
 */
export interface INegativeAttributeFilter {
    negativeAttributeFilter: {
        displayForm: ObjQualifier;
        notIn: string[];
    };
}

/**
 * @public
 */
export interface IAbsoluteDateFilter {
    absoluteDateFilter: {
        dataSet: ObjQualifier;
        from?: string;
        to?: string;
    };
}

/**
 * @public
 */
export interface IRelativeDateFilter {
    relativeDateFilter: {
        dataSet: ObjQualifier;
        granularity: string;
        from?: number;
        to?: number;
    };
}

/**
 * @public
 */
export type ComparisonConditionOperator =
    | "GREATER_THAN"
    | "GREATER_THAN_OR_EQUAL_TO"
    | "LESS_THAN"
    | "LESS_THAN_OR_EQUAL_TO"
    | "EQUAL_TO"
    | "NOT_EQUAL_TO";

/**
 * @public
 */
export interface IComparisonCondition {
    comparison: {
        operator: ComparisonConditionOperator;
        value: number;
        treatNullValuesAs?: number;
    };
}

/**
 * @public
 */
export type RangeConditionOperator = "BETWEEN" | "NOT_BETWEEN";

/**
 * @public
 */
export interface IRangeCondition {
    range: {
        operator: RangeConditionOperator;
        from: number;
        to: number;
        treatNullValuesAs?: number;
    };
}

/**
 * @public
 */
export type MeasureValueFilterCondition = IComparisonCondition | IRangeCondition;

/**
 * @public
 */
export interface ILocalIdentifierQualifier {
    localIdentifier: string;
}

/**
 * @public
 */
export interface IMeasureValueFilter {
    measureValueFilter: {
        measure: IObjUriQualifier | ILocalIdentifierQualifier;
        condition?: MeasureValueFilterCondition;
    };
}

/**
 * @public
 */
export type RankingFilterOperator = "TOP" | "BOTTOM";

/**
 * @public
 */
export interface IRankingFilter {
    rankingFilter: {
        measures: (IObjUriQualifier | ILocalIdentifierQualifier)[];
        attributes?: (IObjUriQualifier | ILocalIdentifierQualifier)[];
        operator: RankingFilterOperator;
        value: number;
    };
}

/**
 * @public
 */
export interface IVisualizationObjectContent {
    visualizationClass: IObjUriQualifier;
    buckets: IBucket[];
    filters?: ExtendedFilter[];
    properties?: string;
    references?: IReferenceItems;
}

/**
 * @public
 */
export interface IReferenceItems {
    [identifier: string]: string;
}

/**
 * @public
 */
export interface IBucket {
    localIdentifier?: Identifier;
    items: BucketItem[];
    totals?: ITotal[];
}

/**
 * @public
 */
export interface ITotal {
    type: TotalType;
    measureIdentifier: string;
    attributeIdentifier: string;
    alias?: string;
}

/**
 * @public
 */
export type IMeasureDefinitionType =
    | IMeasureDefinition
    | IArithmeticMeasureDefinition
    | IPoPMeasureDefinition
    | IPreviousPeriodMeasureDefinition;

/**
 * @public
 */
export interface IMeasure {
    measure: IMeasureContent;
}

/**
 * @public
 */
export interface IMeasureContent {
    localIdentifier: Identifier;
    definition: IMeasureDefinitionType;
    alias?: string;
    title?: string;
    format?: string;
}

/**
 * @public
 */
export interface IAttribute {
    visualizationAttribute: IVisualizationAttributeContent;
}

/**
 * @public
 */
export interface IVisualizationAttributeContent {
    localIdentifier: Identifier;
    displayForm: ObjQualifier;
    alias?: string;
    showAllValues?: boolean;
}

/**
 * @public
 */
export interface IMeasureDefinition {
    measureDefinition: {
        item: ObjQualifier;
        aggregation?: MeasureAggregation;
        filters?: Filter[];
        computeRatio?: boolean;
    };
}

/**
 * @public
 */
export interface IArithmeticMeasureDefinition {
    arithmeticMeasure: {
        measureIdentifiers: Identifier[];
        operator: ArithmeticMeasureOperator;
    };
}

/**
 * @public
 */
export interface IPoPMeasureDefinition {
    popMeasureDefinition: {
        measureIdentifier: Identifier;
        popAttribute: ObjQualifier;
    };
}

/**
 * @public
 */
export interface IPreviousPeriodMeasureDefinition {
    previousPeriodMeasure: {
        measureIdentifier: Identifier;
        dateDataSets: IPreviousPeriodDateDataSet[];
    };
}

/**
 * @public
 */
export interface IPreviousPeriodDateDataSet {
    dataSet: ObjQualifier;
    periodsAgo: number;
}

/**
 * @public
 */
export interface IVisualizationObject {
    meta: IObjectMeta;
    content: IVisualizationObjectContent;
}

/**
 * @public
 */
export interface IVisualization {
    visualizationObject: IVisualizationObject;
}

/**
 * @public
 */
export interface IVisualizationObjectResponse {
    visualizationObject: IVisualizationObject;
}

/**
 * @public
 */
export function isVisualization(obj: unknown): obj is IVisualization {
    return !isEmpty(obj) && (obj as IVisualization).visualizationObject !== undefined;
}

/**
 * @public
 */
export function isMeasure(bucketItem: IMeasure | IAttribute): bucketItem is IMeasure {
    return !isEmpty(bucketItem) && (bucketItem as IMeasure).measure !== undefined;
}

/**
 * @public
 */
export function isAttribute(bucketItem: IMeasure | IAttribute): bucketItem is IAttribute {
    return !isEmpty(bucketItem) && (bucketItem as IAttribute).visualizationAttribute !== undefined;
}

/**
 * @public
 */
export function isMeasureDefinition(definition: IMeasureDefinitionType): definition is IMeasureDefinition {
    return !isEmpty(definition) && (definition as IMeasureDefinition).measureDefinition !== undefined;
}

/**
 * @public
 */
export function isArithmeticMeasureDefinition(
    definition: IMeasureDefinitionType,
): definition is IArithmeticMeasureDefinition {
    return (
        !isEmpty(definition) && (definition as IArithmeticMeasureDefinition).arithmeticMeasure !== undefined
    );
}

/**
 * @public
 */
export function isPopMeasureDefinition(
    definition: IMeasureDefinitionType,
): definition is IPoPMeasureDefinition {
    return !isEmpty(definition) && (definition as IPoPMeasureDefinition).popMeasureDefinition !== undefined;
}

/**
 * @public
 */
export function isPreviousPeriodMeasureDefinition(
    definition: IMeasureDefinitionType,
): definition is IPreviousPeriodMeasureDefinition {
    return (
        !isEmpty(definition) &&
        (definition as IPreviousPeriodMeasureDefinition).previousPeriodMeasure !== undefined
    );
}

/**
 * @public
 */
export function isAttributeFilter(filter: ExtendedFilter): filter is AttributeFilter {
    return (
        !isEmpty(filter) &&
        ((filter as IPositiveAttributeFilter).positiveAttributeFilter !== undefined ||
            (filter as INegativeAttributeFilter).negativeAttributeFilter !== undefined)
    );
}

/**
 * @public
 */
export function isDateFilter(filter: ExtendedFilter): filter is DateFilter {
    return (
        !isEmpty(filter) &&
        ((filter as IAbsoluteDateFilter).absoluteDateFilter !== undefined ||
            (filter as IRelativeDateFilter).relativeDateFilter !== undefined)
    );
}

/**
 * @public
 */
export function isPositiveAttributeFilter(filter: AttributeFilter): filter is IPositiveAttributeFilter {
    return !isEmpty(filter) && (filter as IPositiveAttributeFilter).positiveAttributeFilter !== undefined;
}

/**
 * @public
 */
export function isNegativeAttributeFilter(filter: AttributeFilter): filter is INegativeAttributeFilter {
    return !isEmpty(filter) && (filter as INegativeAttributeFilter).negativeAttributeFilter !== undefined;
}

/**
 * @public
 */
export function isMeasureValueFilter(filter: ExtendedFilter): filter is IMeasureValueFilter {
    return !isEmpty(filter) && (filter as IMeasureValueFilter).measureValueFilter !== undefined;
}

/**
 * @public
 */
export function isRankingFilter(filter: ExtendedFilter): filter is IRankingFilter {
    return !isEmpty(filter) && (filter as IRankingFilter).rankingFilter !== undefined;
}

/**
 * @public
 */
export function isAbsoluteDateFilter(filter: DateFilter): filter is IAbsoluteDateFilter {
    return !isEmpty(filter) && (filter as IAbsoluteDateFilter).absoluteDateFilter !== undefined;
}

/**
 * @public
 */
export function isRelativeDateFilter(filter: DateFilter): filter is IRelativeDateFilter {
    return !isEmpty(filter) && (filter as IRelativeDateFilter).relativeDateFilter !== undefined;
}

/**
 * @public
 */
export function isLocalIdentifierQualifier(
    objectQualifier: unknown,
): objectQualifier is ILocalIdentifierQualifier {
    return (
        !isEmpty(objectQualifier) &&
        (objectQualifier as ILocalIdentifierQualifier).localIdentifier !== undefined
    );
}

/**
 * @public
 */
export function isComparisonCondition(
    condition: MeasureValueFilterCondition,
): condition is IComparisonCondition {
    return !isEmpty(condition) && (condition as IComparisonCondition).comparison !== undefined;
}

/**
 * @public
 */
export function isRangeCondition(condition: MeasureValueFilterCondition): condition is IRangeCondition {
    return !isEmpty(condition) && (condition as IRangeCondition).range !== undefined;
}
