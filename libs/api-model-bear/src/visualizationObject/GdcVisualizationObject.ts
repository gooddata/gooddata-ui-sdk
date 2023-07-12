// (C) 2007-2023 GoodData Corporation
import isEmpty from "lodash/isEmpty.js";
import { IObjectMeta } from "../meta/GdcMetadata.js";

import {
    Identifier,
    MeasureAggregation,
    TotalType,
    ArithmeticMeasureOperator,
    ObjQualifier,
    IObjUriQualifier,
    MeasureValueFilterCondition,
    RankingFilterOperator,
    ILocalIdentifierQualifier,
    IPreviousPeriodDateDataSet,
} from "../base/GdcTypes.js";

/**
 * @public
 */
export type VisualizationType = "table" | "line" | "column" | "bar" | "pie" | "doughnut" | "combo" | "area";

/**
 * @public
 */
export type BucketItem = IVisualizationObjectMeasure | IVisualizationObjectAttribute;

/**
 * @public
 */
export type VisualizationObjectExtendedFilter =
    | VisualizationObjectFilter
    | IVisualizationObjectMeasureValueFilter
    | IVisualizationObjectRankingFilter;

/**
 * @public
 */
export type VisualizationObjectFilter = VisualizationObjectDateFilter | VisualizationObjectAttributeFilter;

/**
 * @public
 */
export type VisualizationObjectDateFilter =
    | IVisualizationObjectRelativeDateFilter
    | IVisualizationObjectAbsoluteDateFilter;

/**
 * @public
 */
export type VisualizationObjectAttributeFilter =
    | IVisualizationObjectPositiveAttributeFilter
    | IVisualizationObjectNegativeAttributeFilter;

/**
 * @public
 */
export interface IVisualizationObjectPositiveAttributeFilter {
    positiveAttributeFilter: {
        displayForm: ObjQualifier;
        in: string[];
    };
}

/**
 * @public
 */
export interface IVisualizationObjectNegativeAttributeFilter {
    negativeAttributeFilter: {
        displayForm: ObjQualifier;
        notIn: string[];
    };
}

/**
 * @public
 */
export interface IVisualizationObjectAbsoluteDateFilter {
    absoluteDateFilter: {
        dataSet: ObjQualifier;
        from?: string;
        to?: string;
    };
}

/**
 * @public
 */
export interface IVisualizationObjectRelativeDateFilter {
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
export interface IVisualizationObjectMeasureValueFilter {
    measureValueFilter: {
        measure: IObjUriQualifier | ILocalIdentifierQualifier;
        condition?: MeasureValueFilterCondition;
    };
}

/**
 * @public
 */
export interface IVisualizationObjectRankingFilter {
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
    filters?: VisualizationObjectExtendedFilter[];
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
export type VisualizationObjectMeasureDefinitionType =
    | IVisualizationObjectMeasureDefinition
    | IVisualizationObjectArithmeticMeasureDefinition
    | IVisualizationObjectPoPMeasureDefinition
    | IVisualizationObjectPreviousPeriodMeasureDefinition;

/**
 * @public
 */
export interface IVisualizationObjectMeasure {
    measure: IMeasureContent;
}

/**
 * @public
 */
export interface IMeasureContent {
    localIdentifier: Identifier;
    definition: VisualizationObjectMeasureDefinitionType;
    alias?: string;
    title?: string;
    format?: string;
}

/**
 * @public
 */
export interface IVisualizationObjectAttribute {
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
export interface IVisualizationObjectMeasureDefinition {
    measureDefinition: {
        item: ObjQualifier;
        aggregation?: MeasureAggregation;
        filters?: VisualizationObjectFilter[];
        computeRatio?: boolean;
    };
}

/**
 * @public
 */
export interface IVisualizationObjectArithmeticMeasureDefinition {
    arithmeticMeasure: {
        measureIdentifiers: Identifier[];
        operator: ArithmeticMeasureOperator;
    };
}

/**
 * @public
 */
export interface IVisualizationObjectPoPMeasureDefinition {
    popMeasureDefinition: {
        measureIdentifier: Identifier;
        popAttribute: ObjQualifier;
    };
}

/**
 * @public
 */
export interface IVisualizationObjectPreviousPeriodMeasureDefinition {
    previousPeriodMeasure: {
        measureIdentifier: Identifier;
        dateDataSets: IPreviousPeriodDateDataSet[];
    };
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
export function isVisualizationObjectMeasure(
    bucketItem: IVisualizationObjectMeasure | IVisualizationObjectAttribute,
): bucketItem is IVisualizationObjectMeasure {
    return !isEmpty(bucketItem) && (bucketItem as IVisualizationObjectMeasure).measure !== undefined;
}

/**
 * @public
 */
export function isVisualizationObjectAttribute(
    bucketItem: IVisualizationObjectMeasure | IVisualizationObjectAttribute,
): bucketItem is IVisualizationObjectAttribute {
    return (
        !isEmpty(bucketItem) &&
        (bucketItem as IVisualizationObjectAttribute).visualizationAttribute !== undefined
    );
}

/**
 * @public
 */
export function isVisualizationObjectMeasureDefinition(
    definition: VisualizationObjectMeasureDefinitionType,
): definition is IVisualizationObjectMeasureDefinition {
    return (
        !isEmpty(definition) &&
        (definition as IVisualizationObjectMeasureDefinition).measureDefinition !== undefined
    );
}

/**
 * @public
 */
export function isVisualizationObjectArithmeticMeasureDefinition(
    definition: VisualizationObjectMeasureDefinitionType,
): definition is IVisualizationObjectArithmeticMeasureDefinition {
    return (
        !isEmpty(definition) &&
        (definition as IVisualizationObjectArithmeticMeasureDefinition).arithmeticMeasure !== undefined
    );
}

/**
 * @public
 */
export function isVisualizationObjectPoPMeasureDefinition(
    definition: VisualizationObjectMeasureDefinitionType,
): definition is IVisualizationObjectPoPMeasureDefinition {
    return (
        !isEmpty(definition) &&
        (definition as IVisualizationObjectPoPMeasureDefinition).popMeasureDefinition !== undefined
    );
}

/**
 * @public
 */
export function isVisualizationObjectPreviousPeriodMeasureDefinition(
    definition: VisualizationObjectMeasureDefinitionType,
): definition is IVisualizationObjectPreviousPeriodMeasureDefinition {
    return (
        !isEmpty(definition) &&
        (definition as IVisualizationObjectPreviousPeriodMeasureDefinition).previousPeriodMeasure !==
            undefined
    );
}

/**
 * @public
 */
export function isVisualizationObjectAttributeFilter(
    filter: VisualizationObjectExtendedFilter,
): filter is VisualizationObjectAttributeFilter {
    return (
        !isEmpty(filter) &&
        ((filter as IVisualizationObjectPositiveAttributeFilter).positiveAttributeFilter !== undefined ||
            (filter as IVisualizationObjectNegativeAttributeFilter).negativeAttributeFilter !== undefined)
    );
}

/**
 * @public
 */
export function isVisualizationObjectDateFilter(
    filter: VisualizationObjectExtendedFilter,
): filter is VisualizationObjectDateFilter {
    return (
        !isEmpty(filter) &&
        ((filter as IVisualizationObjectAbsoluteDateFilter).absoluteDateFilter !== undefined ||
            (filter as IVisualizationObjectRelativeDateFilter).relativeDateFilter !== undefined)
    );
}

/**
 * @public
 */
export function isVisualizationObjectPositiveAttributeFilter(
    filter: VisualizationObjectAttributeFilter,
): filter is IVisualizationObjectPositiveAttributeFilter {
    return (
        !isEmpty(filter) &&
        (filter as IVisualizationObjectPositiveAttributeFilter).positiveAttributeFilter !== undefined
    );
}

/**
 * @public
 */
export function isVisualizationObjectNegativeAttributeFilter(
    filter: VisualizationObjectAttributeFilter,
): filter is IVisualizationObjectNegativeAttributeFilter {
    return (
        !isEmpty(filter) &&
        (filter as IVisualizationObjectNegativeAttributeFilter).negativeAttributeFilter !== undefined
    );
}

/**
 * @public
 */
export function isVisualizationObjectMeasureValueFilter(
    filter: VisualizationObjectExtendedFilter,
): filter is IVisualizationObjectMeasureValueFilter {
    return (
        !isEmpty(filter) &&
        (filter as IVisualizationObjectMeasureValueFilter).measureValueFilter !== undefined
    );
}

/**
 * @public
 */
export function isVisualizationObjectRankingFilter(
    filter: VisualizationObjectExtendedFilter,
): filter is IVisualizationObjectRankingFilter {
    return !isEmpty(filter) && (filter as IVisualizationObjectRankingFilter).rankingFilter !== undefined;
}

/**
 * @public
 */
export function isVisualizationObjectAbsoluteDateFilter(
    filter: VisualizationObjectDateFilter,
): filter is IVisualizationObjectAbsoluteDateFilter {
    return (
        !isEmpty(filter) &&
        (filter as IVisualizationObjectAbsoluteDateFilter).absoluteDateFilter !== undefined
    );
}

/**
 * @public
 */
export function isVisualizationObjectRelativeDateFilter(
    filter: VisualizationObjectDateFilter,
): filter is IVisualizationObjectRelativeDateFilter {
    return (
        !isEmpty(filter) &&
        (filter as IVisualizationObjectRelativeDateFilter).relativeDateFilter !== undefined
    );
}
