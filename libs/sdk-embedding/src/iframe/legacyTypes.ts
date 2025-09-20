// (C) 2020-2024 GoodData Corporation

import { isEmpty } from "lodash-es";

/**
 * @public
 */
export interface ILegacyBaseExportConfig {
    /**
     * Specify title of the exported file.
     */
    title?: string;

    /**
     * Specify format of the exported file (default CSV).
     */
    format?: "xlsx" | "csv" | "raw";

    /**
     * When exporting to XLSX, specify whether to merge table headers or not.
     */
    mergeHeaders?: boolean;
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
export type VisualizationObjectAttributeFilter =
    | IVisualizationObjectPositiveAttributeFilter
    | IVisualizationObjectNegativeAttributeFilter;

/**
 * @public
 */
export type VisualizationObjectDateFilter =
    | IVisualizationObjectRelativeDateFilter
    | IVisualizationObjectAbsoluteDateFilter;

/**
 * @public
 */
export type VisualizationObjectFilter = VisualizationObjectDateFilter | VisualizationObjectAttributeFilter;

/**
 * @public
 */
export type ArithmeticMeasureOperator = "sum" | "difference" | "multiplication" | "ratio" | "change";

/**
 * @public
 */
export type MeasureAggregation = "sum" | "count" | "avg" | "min" | "max" | "median" | "runsum";

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
export type VisualizationObjectMeasureDefinitionType =
    | IVisualizationObjectMeasureDefinition
    | IVisualizationObjectArithmeticMeasureDefinition
    | IVisualizationObjectPoPMeasureDefinition
    | IVisualizationObjectPreviousPeriodMeasureDefinition;

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
export interface IVisualizationObjectMeasure {
    measure: IMeasureContent;
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
export type BucketItem = IVisualizationObjectMeasure | IVisualizationObjectAttribute;

/**
 * @public
 */
export type Identifier = string;

/**
 * @public
 */
export type TotalType = "sum" | "avg" | "max" | "min" | "nat" | "med";

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
export interface IBucket {
    localIdentifier?: Identifier;
    items: BucketItem[];
    totals?: ITotal[];
}

/**
 * @public
 */
export interface IObjUriQualifier {
    uri: string;
}

/**
 * @public
 */
export interface ILocalIdentifierQualifier {
    localIdentifier: string;
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
export interface IVisualizationObjectMeasureValueFilter {
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
export type VisualizationObjectExtendedFilter =
    | VisualizationObjectFilter
    | IVisualizationObjectMeasureValueFilter
    | IVisualizationObjectRankingFilter;

/**
 * @public
 */
export interface IReferenceItems {
    [identifier: string]: string;
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
export type ObjectCategory =
    | "analyticalDashboard"
    | "attribute"
    | "attributeDisplayForm"
    | "column"
    | "dashboardPlugin"
    | "dataLoadingColumn"
    | "dataSet"
    | "dateFilterConfig"
    | "dimension"
    | "domain"
    | "elementMasking"
    | "etlFile"
    | "executionContext"
    | "fact"
    | "filterContext"
    | "filter"
    | "folder"
    | "kpi"
    | "kpiAlert"
    | "metric"
    | "projectDashboard"
    | "prompt"
    | "reportDefinition"
    | "report"
    | "scheduledMail"
    | "tableDataload"
    | "table"
    | "userFilter"
    | "visualizationClass"
    | "visualizationObject"
    | "visualizationWidget"
    | "theme"
    | "colorPalette"
    | "attributeHierarchy"
    | "user"
    | "userGroup"
    | "dateHierarchyTemplate"
    | "dateAttributeHierarchy";

/**
 * @public
 */
export type Timestamp = string; // YYYY-MM-DD HH:mm:ss

/**
 * @public
 */
export interface ILegacyObjectMeta {
    category?: ObjectCategory;
    title: string;
    summary?: string;
    tags?: string;
    author?: string;
    contributor?: string;
    identifier?: string;
    uri?: string;
    deprecated?: "0" | "1";
    isProduction?: 1 | 0;
    created?: Timestamp;
    updated?: Timestamp;
    flags?: string[];
    locked?: boolean;
    projectTemplate?: string;
    sharedWithSomeone?: 1 | 0;
    unlisted?: 1 | 0;
}

/**
 * @public
 */
export interface IVisualizationObject {
    meta: ILegacyObjectMeta;
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
export function isObjIdentifierQualifier(qualifier: ObjQualifier): qualifier is IObjIdentifierQualifier {
    return !isEmpty(qualifier) && (qualifier as IObjIdentifierQualifier).identifier !== undefined;
}

/**
 * @public
 */
export function isObjectUriQualifier(qualifier: ObjQualifier): qualifier is IObjUriQualifier {
    return !isEmpty(qualifier) && (qualifier as IObjUriQualifier).uri !== undefined;
}

/**
 * @public
 */
export function isLocalIdentifierQualifier(qualifier: unknown): qualifier is ILocalIdentifierQualifier {
    return !isEmpty(qualifier) && (qualifier as ILocalIdentifierQualifier).localIdentifier !== undefined;
}
