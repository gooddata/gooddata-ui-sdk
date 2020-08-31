// (C) 2019-2020 GoodData Corporation
import isArray from "lodash/isArray";
import isEmpty from "lodash/isEmpty";

/**
 * Types defined here exactly match types accepted by the executeAfm resource.
 *
 * Types currently map executeAfm version 3.
 *
 * @public
 */
export namespace GdcExecuteAFM {
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

    export type SimpleMeasureAggregation = "sum" | "count" | "avg" | "min" | "max" | "median" | "runsum";

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

    export type Identifier = string;
    export type ObjQualifier = IObjUriQualifier | IObjIdentifierQualifier;

    export interface IObjIdentifierQualifier {
        identifier: string;
    }

    export interface IObjUriQualifier {
        uri: string;
    }

    export type ExtendedFilter = FilterItem | IMeasureValueFilter;
    export type CompatibilityFilter = IExpressionFilter | ExtendedFilter;
    export type FilterItem = DateFilterItem | AttributeFilterItem;
    export type AttributeFilterItem = IPositiveAttributeFilter | INegativeAttributeFilter;
    export type DateFilterItem = IAbsoluteDateFilter | IRelativeDateFilter;

    export interface IAttributeElementsByRef {
        uris: string[];
    }

    export interface IAttributeElementsByValue {
        values: string[];
    }

    export type AttributeElements = string[] | IAttributeElementsByRef | IAttributeElementsByValue;

    export interface IPositiveAttributeFilter {
        positiveAttributeFilter: {
            displayForm: ObjQualifier;
            in: AttributeElements;
        };
    }

    export interface INegativeAttributeFilter {
        negativeAttributeFilter: {
            displayForm: ObjQualifier;
            notIn: AttributeElements;
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

    export type Qualifier = ObjQualifier | ILocalIdentifierQualifier;

    export interface IMeasureValueFilter {
        measureValueFilter: {
            measure: Qualifier;
            condition?: MeasureValueFilterCondition;
        };
    }

    /**
     * @deprecated Expression filter in AFM can be used only by legacy code
     */
    export interface IExpressionFilter {
        expression: {
            value: string;
        };
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

    export type VisualizationStyleType = "common" | "table" | "line" | "column" | "bar" | "area";

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

    export function isObjectUriQualifier(
        qualifier: GdcExecuteAFM.ObjQualifier,
    ): qualifier is GdcExecuteAFM.IObjUriQualifier {
        return !isEmpty(qualifier) && (qualifier as GdcExecuteAFM.IObjUriQualifier).uri !== undefined;
    }

    export function isObjIdentifierQualifier(
        qualifier: GdcExecuteAFM.ObjQualifier,
    ): qualifier is GdcExecuteAFM.IObjIdentifierQualifier {
        return (
            !isEmpty(qualifier) &&
            (qualifier as GdcExecuteAFM.IObjIdentifierQualifier).identifier !== undefined
        );
    }

    export function isSimpleMeasureDefinition(
        definition: GdcExecuteAFM.MeasureDefinition,
    ): definition is GdcExecuteAFM.ISimpleMeasureDefinition {
        return (
            !isEmpty(definition) &&
            (definition as GdcExecuteAFM.ISimpleMeasureDefinition).measure !== undefined
        );
    }

    export function isArithmeticMeasureDefinition(
        definition: GdcExecuteAFM.MeasureDefinition,
    ): definition is GdcExecuteAFM.IArithmeticMeasureDefinition {
        return (
            !isEmpty(definition) &&
            (definition as GdcExecuteAFM.IArithmeticMeasureDefinition).arithmeticMeasure !== undefined
        );
    }

    export function isPopMeasureDefinition(
        definition: GdcExecuteAFM.MeasureDefinition,
    ): definition is GdcExecuteAFM.IPopMeasureDefinition {
        return (
            !isEmpty(definition) &&
            (definition as GdcExecuteAFM.IPopMeasureDefinition).popMeasure !== undefined
        );
    }

    export function isPreviousPeriodMeasureDefinition(
        definition: GdcExecuteAFM.MeasureDefinition,
    ): definition is GdcExecuteAFM.IPreviousPeriodMeasureDefinition {
        return (
            !isEmpty(definition) &&
            (definition as GdcExecuteAFM.IPreviousPeriodMeasureDefinition).previousPeriodMeasure !== undefined
        );
    }

    export function isAttributeSortItem(
        sortItem: GdcExecuteAFM.SortItem,
    ): sortItem is GdcExecuteAFM.IAttributeSortItem {
        return (
            !isEmpty(sortItem) &&
            (sortItem as GdcExecuteAFM.IAttributeSortItem).attributeSortItem !== undefined
        );
    }

    export function isMeasureSortItem(
        sortItem: GdcExecuteAFM.SortItem,
    ): sortItem is GdcExecuteAFM.IMeasureSortItem {
        return (
            !isEmpty(sortItem) && (sortItem as GdcExecuteAFM.IMeasureSortItem).measureSortItem !== undefined
        );
    }

    export function isAttributeLocatorItem(
        locator: GdcExecuteAFM.LocatorItem,
    ): locator is GdcExecuteAFM.IAttributeLocatorItem {
        return (
            !isEmpty(locator) &&
            (locator as GdcExecuteAFM.IAttributeLocatorItem).attributeLocatorItem !== undefined
        );
    }

    export function isMeasureLocatorItem(
        locator: GdcExecuteAFM.LocatorItem,
    ): locator is GdcExecuteAFM.IMeasureLocatorItem {
        return (
            !isEmpty(locator) &&
            (locator as GdcExecuteAFM.IMeasureLocatorItem).measureLocatorItem !== undefined
        );
    }

    export function isDateFilter(
        filter: GdcExecuteAFM.CompatibilityFilter,
    ): filter is GdcExecuteAFM.DateFilterItem {
        return !isEmpty(filter) && (isRelativeDateFilter(filter) || isAbsoluteDateFilter(filter));
    }

    export function isRelativeDateFilter(
        filter: GdcExecuteAFM.CompatibilityFilter,
    ): filter is GdcExecuteAFM.IRelativeDateFilter {
        return !isEmpty(filter) && (filter as IRelativeDateFilter).relativeDateFilter !== undefined;
    }

    export function isAbsoluteDateFilter(
        filter: GdcExecuteAFM.CompatibilityFilter,
    ): filter is GdcExecuteAFM.IAbsoluteDateFilter {
        return !isEmpty(filter) && (filter as IAbsoluteDateFilter).absoluteDateFilter !== undefined;
    }

    export function isAttributeFilter(
        filter: GdcExecuteAFM.CompatibilityFilter,
    ): filter is GdcExecuteAFM.AttributeFilterItem {
        return !isEmpty(filter) && (isPositiveAttributeFilter(filter) || isNegativeAttributeFilter(filter));
    }

    export function isPositiveAttributeFilter(
        filter: GdcExecuteAFM.CompatibilityFilter,
    ): filter is GdcExecuteAFM.IPositiveAttributeFilter {
        return (
            !isEmpty(filter) &&
            (filter as GdcExecuteAFM.IPositiveAttributeFilter).positiveAttributeFilter !== undefined
        );
    }

    export function isNegativeAttributeFilter(
        filter: GdcExecuteAFM.CompatibilityFilter,
    ): filter is GdcExecuteAFM.INegativeAttributeFilter {
        return (
            !isEmpty(filter) &&
            (filter as GdcExecuteAFM.INegativeAttributeFilter).negativeAttributeFilter !== undefined
        );
    }

    export function isMeasureValueFilter(
        filter: GdcExecuteAFM.CompatibilityFilter,
    ): filter is GdcExecuteAFM.IMeasureValueFilter {
        return (
            !isEmpty(filter) && (filter as GdcExecuteAFM.IMeasureValueFilter).measureValueFilter !== undefined
        );
    }

    export function isExpressionFilter(
        filter: GdcExecuteAFM.CompatibilityFilter,
    ): filter is GdcExecuteAFM.IExpressionFilter {
        return !isEmpty(filter) && (filter as GdcExecuteAFM.IExpressionFilter).expression !== undefined;
    }

    export function isAttributeElementsArray(
        attributeElements: AttributeElements,
    ): attributeElements is string[] {
        return attributeElements !== undefined && attributeElements instanceof Array;
    }

    export function isAttributeElementsByRef(
        attributeElements: GdcExecuteAFM.AttributeElements,
    ): attributeElements is GdcExecuteAFM.IAttributeElementsByRef {
        return (
            !isEmpty(attributeElements) &&
            (attributeElements as GdcExecuteAFM.IAttributeElementsByRef).uris !== undefined
        );
    }

    export function isAttributeElementsByValue(
        attributeElements: GdcExecuteAFM.AttributeElements,
    ): attributeElements is GdcExecuteAFM.IAttributeElementsByValue {
        return (
            !isEmpty(attributeElements) &&
            !isArray(attributeElements) &&
            (attributeElements as GdcExecuteAFM.IAttributeElementsByValue).values !== undefined
        );
    }
}
