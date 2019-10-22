// (C) 2019 GoodData Corporation
import isEmpty = require('lodash/isEmpty');

/**
 * Types defined here exactly match types accepted by the executeAfm resource.
 *
 * >>> Note for developers: when you modify these structures, be sure to update gooddata-js execute-afm.convert.ts
 * with conversion from AFM types to the new/updated construct.
 *
 * Types currently map executeAfm version 3.
 */
export namespace ExecuteAFM {
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

    export type MeasureDefinition = ISimpleMeasureDefinition
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

    export type SimpleMeasureAggregation = 'sum' | 'count' | 'avg' | 'min' | 'max' | 'median' | 'runsum';

    export interface ISimpleMeasure {
        item: ObjQualifier;
        aggregation?: SimpleMeasureAggregation;
        filters?: FilterItem[];
        computeRatio?: boolean;
    }

    export type ArithmeticMeasureOperator = 'sum' | 'difference' | 'multiplication' | 'ratio' | 'change';

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

    export type ComparisonConditionOperator = 'GREATER_THAN'
        | 'GREATER_THAN_OR_EQUAL_TO'
        | 'LESS_THAN'
        | 'LESS_THAN_OR_EQUAL_TO'
        | 'EQUAL_TO'
        | 'NOT_EQUAL_TO';

    export interface IComparisonCondition {
        comparison: {
            operator: ComparisonConditionOperator
            value: number;
        };
    }

    export type RangeConditionOperator = 'BETWEEN' | 'NOT_BETWEEN';

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

    // Might be removed, as we don't know if expression filter is needed
    export interface IExpressionFilter {
        value: string;
    }

    export interface ITotalItem {
        measureIdentifier: Identifier;
        type: TotalType;
        attributeIdentifier: Identifier;
    }

    export type TotalType = 'sum' | 'avg' | 'max' | 'min' | 'nat' | 'med';

    export interface INativeTotalItem {
        measureIdentifier: Identifier;
        attributeIdentifiers: Identifier[];
    }

    export interface IDimension {
        itemIdentifiers: Identifier[];
        totals?: ITotalItem[];
    }

    export type SortItem = IAttributeSortItem | IMeasureSortItem;
    export type SortDirection = 'asc' | 'desc';

    export interface IAttributeSortItem {
        attributeSortItem: {
            direction: SortDirection;
            attributeIdentifier: Identifier;
            aggregation?: 'sum';
        };
    }

    export type VisualizationStyleType = 'common' | 'table' | 'line' | 'column' | 'bar' | 'area';

    export interface IVisualizationStyle {
        visualizationStyle: {
            type: VisualizationStyleType;
            colorPalette: {
                measure?: {
                    color: string;
                    periodOverPeriod: string;
                }

                stack?: any
            }
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
        qualifier: ExecuteAFM.ObjQualifier
    ): qualifier is ExecuteAFM.IObjUriQualifier {
        return !isEmpty(qualifier) && (qualifier as ExecuteAFM.IObjUriQualifier).uri !== undefined;
    }

    export function isObjIdentifierQualifier(
        qualifier: ExecuteAFM.ObjQualifier
    ): qualifier is ExecuteAFM.IObjIdentifierQualifier {
        return !isEmpty(qualifier) && (qualifier as ExecuteAFM.IObjIdentifierQualifier).identifier !== undefined;
    }

    export function isSimpleMeasureDefinition(
        definition: ExecuteAFM.MeasureDefinition
    ): definition is ExecuteAFM.ISimpleMeasureDefinition {
        return !isEmpty(definition) && (definition as ExecuteAFM.ISimpleMeasureDefinition).measure !== undefined;
    }

    export function isArithmeticMeasureDefinition(
        definition: ExecuteAFM.MeasureDefinition
    ): definition is ExecuteAFM.IArithmeticMeasureDefinition {
        return !isEmpty(definition)
            && (definition as ExecuteAFM.IArithmeticMeasureDefinition).arithmeticMeasure !== undefined;
    }

    export function isPopMeasureDefinition(
        definition: ExecuteAFM.MeasureDefinition
    ): definition is ExecuteAFM.IPopMeasureDefinition {
        return !isEmpty(definition) && (definition as ExecuteAFM.IPopMeasureDefinition).popMeasure !== undefined;
    }

    export function isPreviousPeriodMeasureDefinition(
        definition: ExecuteAFM.MeasureDefinition
    ): definition is ExecuteAFM.IPreviousPeriodMeasureDefinition {
        return !isEmpty(definition)
            && (definition as ExecuteAFM.IPreviousPeriodMeasureDefinition).previousPeriodMeasure !== undefined;
    }

    export function isAttributeSortItem(
        sortItem: ExecuteAFM.SortItem
    ): sortItem is ExecuteAFM.IAttributeSortItem {
        return !isEmpty(sortItem) && (sortItem as ExecuteAFM.IAttributeSortItem).attributeSortItem !== undefined;
    }

    export function isMeasureSortItem(
        sortItem: ExecuteAFM.SortItem
    ): sortItem is ExecuteAFM.IMeasureSortItem {
        return !isEmpty(sortItem) && (sortItem as ExecuteAFM.IMeasureSortItem).measureSortItem !== undefined;
    }

    export function isMeasureLocatorItem(
        locator: ExecuteAFM.LocatorItem
    ): locator is ExecuteAFM.IMeasureLocatorItem {
        return !isEmpty(locator)
            && (locator as ExecuteAFM.IMeasureLocatorItem).measureLocatorItem !== undefined;
    }

    export function isDateFilter(
        filter: ExecuteAFM.CompatibilityFilter
    ): filter is ExecuteAFM.DateFilterItem {
        return !isEmpty(filter) && (isRelativeDateFilter(filter) || isAbsoluteDateFilter(filter));
    }

    export function isRelativeDateFilter(
        filter: ExecuteAFM.CompatibilityFilter
    ): filter is ExecuteAFM.IRelativeDateFilter {
        return !isEmpty(filter) && (filter as IRelativeDateFilter).relativeDateFilter !== undefined;
    }

    export function isAbsoluteDateFilter(
        filter: ExecuteAFM.CompatibilityFilter
    ): filter is ExecuteAFM.IAbsoluteDateFilter {
        return !isEmpty(filter) && (filter as IAbsoluteDateFilter).absoluteDateFilter !== undefined;
    }

    export function isAttributeFilter(
        filter: ExecuteAFM.CompatibilityFilter
    ): filter is ExecuteAFM.AttributeFilterItem {
        return !isEmpty(filter) && (isPositiveAttributeFilter(filter) || isNegativeAttributeFilter(filter));
    }

    export function isPositiveAttributeFilter(
        filter: ExecuteAFM.CompatibilityFilter
    ): filter is ExecuteAFM.IPositiveAttributeFilter {
        return !isEmpty(filter)
            && (filter as ExecuteAFM.IPositiveAttributeFilter).positiveAttributeFilter !== undefined;
    }

    export function isNegativeAttributeFilter(
        filter: ExecuteAFM.CompatibilityFilter
    ): filter is ExecuteAFM.INegativeAttributeFilter {
        return !isEmpty(filter)
            && (filter as ExecuteAFM.INegativeAttributeFilter).negativeAttributeFilter !== undefined;
    }

    export function isMeasureValueFilter(
        filter: ExecuteAFM.CompatibilityFilter
    ): filter is ExecuteAFM.IMeasureValueFilter {
        return !isEmpty(filter)
            && (filter as ExecuteAFM.IMeasureValueFilter).measureValueFilter !== undefined;
    }

    export function isExpressionFilter(filter: ExecuteAFM.CompatibilityFilter): filter is ExecuteAFM.IExpressionFilter {
        return !isEmpty(filter) && (filter as ExecuteAFM.IExpressionFilter).value !== undefined;
    }

    export function isAttributeElementsArray(attributeElements: AttributeElements): attributeElements is string[] {
        return attributeElements !== undefined && attributeElements instanceof Array;
    }

    export function isAttributeElementsByRef(
        attributeElements: ExecuteAFM.AttributeElements
    ): attributeElements is ExecuteAFM.IAttributeElementsByRef {
        return !isEmpty(attributeElements)
            && (attributeElements as ExecuteAFM.IAttributeElementsByRef).uris !== undefined;
    }

    export function isAttributeElementsByValue(
        attributeElements: ExecuteAFM.AttributeElements
    ): attributeElements is ExecuteAFM.IAttributeElementsByValue {
        return !isEmpty(attributeElements)
            && (attributeElements as ExecuteAFM.IAttributeElementsByValue).values !== undefined;
    }
}
