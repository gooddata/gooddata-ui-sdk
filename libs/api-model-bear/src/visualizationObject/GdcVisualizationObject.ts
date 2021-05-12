// (C) 2007-2021 GoodData Corporation
import { GdcMetadata } from "../meta/GdcMetadata";
import isEmpty from "lodash/isEmpty";

/**
 * @public
 */
export namespace GdcVisualizationObject {
    export type SortDirection = "asc" | "desc";
    export type Identifier = string;
    export type MeasureAggregation =
        | "sum"
        | "count"
        | "approximate_count"
        | "avg"
        | "min"
        | "max"
        | "median"
        | "runsum";
    export type TotalType = "sum" | "avg" | "max" | "min" | "nat" | "med";
    export type VisualizationType =
        | "table"
        | "line"
        | "column"
        | "bar"
        | "pie"
        | "doughnut"
        | "combo"
        | "area";
    export type ArithmeticMeasureOperator = "sum" | "difference" | "multiplication" | "ratio" | "change";

    export type BucketItem = IMeasure | IAttribute;

    export type ExtendedFilter = Filter | IMeasureValueFilter | IRankingFilter;
    export type Filter = DateFilter | AttributeFilter;

    export type DateFilter = IRelativeDateFilter | IAbsoluteDateFilter;

    export type AttributeFilter = IPositiveAttributeFilter | INegativeAttributeFilter;

    export interface IObjUriQualifier {
        uri: string;
    }

    export interface IObjIdentifierQualifier {
        identifier: string;
    }

    export type ObjQualifier = IObjUriQualifier | IObjIdentifierQualifier;

    export function isObjUriQualifier(objQualifier: ObjQualifier): objQualifier is IObjUriQualifier {
        return !isEmpty(objQualifier) && (objQualifier as IObjUriQualifier).uri !== undefined;
    }

    export function isObjIdentifierQualifier(
        objQualifier: ObjQualifier,
    ): objQualifier is IObjIdentifierQualifier {
        return !isEmpty(objQualifier) && (objQualifier as IObjIdentifierQualifier).identifier !== undefined;
    }

    export interface IPositiveAttributeFilter {
        positiveAttributeFilter: {
            displayForm: ObjQualifier;
            in: string[];
        };
    }

    export interface INegativeAttributeFilter {
        negativeAttributeFilter: {
            displayForm: ObjQualifier;
            notIn: string[];
        };
    }

    export interface IAbsoluteDateFilter {
        absoluteDateFilter: {
            dataSet: ObjQualifier;
            from?: string;
            to?: string;
        };
    }

    export interface IRelativeDateFilter {
        relativeDateFilter: {
            dataSet: ObjQualifier;
            granularity: string;
            from?: number;
            to?: number;
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
            treatNullValuesAs?: number;
        };
    }

    export type RangeConditionOperator = "BETWEEN" | "NOT_BETWEEN";

    export interface IRangeCondition {
        range: {
            operator: RangeConditionOperator;
            from: number;
            to: number;
            treatNullValuesAs?: number;
        };
    }

    export type MeasureValueFilterCondition = IComparisonCondition | IRangeCondition;

    export interface ILocalIdentifierQualifier {
        localIdentifier: string;
    }

    export interface IMeasureValueFilter {
        measureValueFilter: {
            measure: IObjUriQualifier | ILocalIdentifierQualifier;
            condition?: MeasureValueFilterCondition;
        };
    }

    export type RankingFilterOperator = "TOP" | "BOTTOM";

    export interface IRankingFilter {
        rankingFilter: {
            measures: (IObjUriQualifier | ILocalIdentifierQualifier)[];
            attributes?: (IObjUriQualifier | ILocalIdentifierQualifier)[];
            operator: RankingFilterOperator;
            value: number;
        };
    }

    export interface IVisualizationObjectContent {
        visualizationClass: IObjUriQualifier;
        buckets: IBucket[];
        filters?: ExtendedFilter[];
        properties?: string;
        references?: IReferenceItems;
    }

    export interface IReferenceItems {
        [identifier: string]: string;
    }

    export interface IBucket {
        localIdentifier?: Identifier;
        items: BucketItem[];
        totals?: ITotal[];
    }

    export interface ITotal {
        type: TotalType;
        measureIdentifier: string;
        attributeIdentifier: string;
        alias?: string;
    }

    export type IMeasureDefinitionType =
        | IMeasureDefinition
        | IArithmeticMeasureDefinition
        | IPoPMeasureDefinition
        | IPreviousPeriodMeasureDefinition;

    export interface IMeasure {
        measure: IMeasureContent;
    }

    export interface IMeasureContent {
        localIdentifier: Identifier;
        definition: IMeasureDefinitionType;
        alias?: string;
        title?: string;
        format?: string;
    }

    export interface IAttribute {
        visualizationAttribute: IVisualizationAttributeContent;
    }

    export interface IVisualizationAttributeContent {
        localIdentifier: Identifier;
        displayForm: ObjQualifier;
        alias?: string;
    }

    export interface IMeasureDefinition {
        measureDefinition: {
            item: ObjQualifier;
            aggregation?: MeasureAggregation;
            filters?: Filter[];
            computeRatio?: boolean;
        };
    }

    export interface IArithmeticMeasureDefinition {
        arithmeticMeasure: {
            measureIdentifiers: Identifier[];
            operator: ArithmeticMeasureOperator;
        };
    }

    export interface IPoPMeasureDefinition {
        popMeasureDefinition: {
            measureIdentifier: Identifier;
            popAttribute: ObjQualifier;
        };
    }

    export interface IPreviousPeriodMeasureDefinition {
        previousPeriodMeasure: {
            measureIdentifier: Identifier;
            dateDataSets: IPreviousPeriodDateDataSet[];
        };
    }

    export interface IPreviousPeriodDateDataSet {
        dataSet: ObjQualifier;
        periodsAgo: number;
    }

    export interface IVisualizationObject {
        meta: GdcMetadata.IObjectMeta;
        content: IVisualizationObjectContent;
    }

    export interface IVisualization {
        visualizationObject: IVisualizationObject;
    }

    export interface IVisualizationObjectResponse {
        visualizationObject: IVisualizationObject;
    }

    export function isVisualization(obj: unknown): obj is IVisualization {
        return !isEmpty(obj) && (obj as IVisualization).visualizationObject !== undefined;
    }

    export function isMeasure(bucketItem: IMeasure | IAttribute): bucketItem is IMeasure {
        return !isEmpty(bucketItem) && (bucketItem as IMeasure).measure !== undefined;
    }

    export function isAttribute(bucketItem: IMeasure | IAttribute): bucketItem is IAttribute {
        return !isEmpty(bucketItem) && (bucketItem as IAttribute).visualizationAttribute !== undefined;
    }

    export function isMeasureDefinition(
        definition: IMeasureDefinitionType,
    ): definition is IMeasureDefinition {
        return !isEmpty(definition) && (definition as IMeasureDefinition).measureDefinition !== undefined;
    }

    export function isArithmeticMeasureDefinition(
        definition: IMeasureDefinitionType,
    ): definition is IArithmeticMeasureDefinition {
        return (
            !isEmpty(definition) &&
            (definition as IArithmeticMeasureDefinition).arithmeticMeasure !== undefined
        );
    }

    export function isPopMeasureDefinition(
        definition: IMeasureDefinitionType,
    ): definition is IPoPMeasureDefinition {
        return (
            !isEmpty(definition) && (definition as IPoPMeasureDefinition).popMeasureDefinition !== undefined
        );
    }

    export function isPreviousPeriodMeasureDefinition(
        definition: IMeasureDefinitionType,
    ): definition is IPreviousPeriodMeasureDefinition {
        return (
            !isEmpty(definition) &&
            (definition as IPreviousPeriodMeasureDefinition).previousPeriodMeasure !== undefined
        );
    }

    export function isAttributeFilter(filter: ExtendedFilter): filter is AttributeFilter {
        return (
            !isEmpty(filter) &&
            ((filter as IPositiveAttributeFilter).positiveAttributeFilter !== undefined ||
                (filter as INegativeAttributeFilter).negativeAttributeFilter !== undefined)
        );
    }

    export function isDateFilter(filter: ExtendedFilter): filter is DateFilter {
        return (
            !isEmpty(filter) &&
            ((filter as IAbsoluteDateFilter).absoluteDateFilter !== undefined ||
                (filter as IRelativeDateFilter).relativeDateFilter !== undefined)
        );
    }

    export function isPositiveAttributeFilter(filter: AttributeFilter): filter is IPositiveAttributeFilter {
        return !isEmpty(filter) && (filter as IPositiveAttributeFilter).positiveAttributeFilter !== undefined;
    }

    export function isNegativeAttributeFilter(filter: AttributeFilter): filter is INegativeAttributeFilter {
        return !isEmpty(filter) && (filter as INegativeAttributeFilter).negativeAttributeFilter !== undefined;
    }

    export function isMeasureValueFilter(filter: ExtendedFilter): filter is IMeasureValueFilter {
        return !isEmpty(filter) && (filter as IMeasureValueFilter).measureValueFilter !== undefined;
    }

    export function isRankingFilter(filter: ExtendedFilter): filter is IRankingFilter {
        return !isEmpty(filter) && (filter as IRankingFilter).rankingFilter !== undefined;
    }

    export function isAbsoluteDateFilter(filter: DateFilter): filter is IAbsoluteDateFilter {
        return !isEmpty(filter) && (filter as IAbsoluteDateFilter).absoluteDateFilter !== undefined;
    }

    export function isRelativeDateFilter(filter: DateFilter): filter is IRelativeDateFilter {
        return !isEmpty(filter) && (filter as IRelativeDateFilter).relativeDateFilter !== undefined;
    }

    export function isLocalIdentifierQualifier(
        objectQualifier: unknown,
    ): objectQualifier is ILocalIdentifierQualifier {
        return (
            !isEmpty(objectQualifier) &&
            (objectQualifier as ILocalIdentifierQualifier).localIdentifier !== undefined
        );
    }

    export function isComparisonCondition(
        condition: MeasureValueFilterCondition,
    ): condition is IComparisonCondition {
        return !isEmpty(condition) && (condition as IComparisonCondition).comparison !== undefined;
    }

    export function isRangeCondition(condition: MeasureValueFilterCondition): condition is IRangeCondition {
        return !isEmpty(condition) && (condition as IRangeCondition).range !== undefined;
    }
}
