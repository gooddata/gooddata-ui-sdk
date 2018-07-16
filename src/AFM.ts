import isEmpty = require('lodash/isEmpty');

export namespace AFM {
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

    export type MeasureDefinition = ISimpleMeasureDefinition | IPopMeasureDefinition | IPreviousPeriodMeasureDefinition;

    export interface ISimpleMeasureDefinition {
        measure: ISimpleMeasure;
    }

    export interface IPopMeasureDefinition {
        popMeasure: IPopMeasure;
    }

    export interface IPreviousPeriodMeasureDefinition {
        previousPeriodMeasure: IPreviousPeriodMeasure;
    }

    export interface ISimpleMeasure {
        item: ObjQualifier;
        aggregation?: 'sum' | 'count' | 'avg' | 'min' | 'max' | 'median' | 'runsum';
        filters?: FilterItem[];
        computeRatio?: boolean;
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
    export type CompatibilityFilter = IExpressionFilter | FilterItem;
    export type FilterItem = DateFilterItem | AttributeFilterItem;
    export type AttributeFilterItem = IPositiveAttributeFilter | INegativeAttributeFilter;
    export type DateFilterItem = IAbsoluteDateFilter | IRelativeDateFilter;

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

    export function isObjectUriQualifier(qualifier: AFM.ObjQualifier): qualifier is AFM.IObjUriQualifier {
        return !isEmpty(qualifier) && (qualifier as AFM.IObjUriQualifier).uri !== undefined;
    }

    export function isSimpleMeasureDefinition(
        definition: AFM.MeasureDefinition
    ): definition is AFM.ISimpleMeasureDefinition {
        return !isEmpty(definition) && (definition as AFM.ISimpleMeasureDefinition).measure !== undefined;
    }

    export function isPopMeasureDefinition(
        definition: AFM.MeasureDefinition
    ): definition is AFM.IPopMeasureDefinition {
        return !isEmpty(definition) && (definition as AFM.IPopMeasureDefinition).popMeasure !== undefined;
    }

    export function isPreviousPeriodMeasureDefinition(
        definition: AFM.MeasureDefinition
    ): definition is AFM.IPreviousPeriodMeasureDefinition {
        return !isEmpty(definition)
            && (definition as AFM.IPreviousPeriodMeasureDefinition).previousPeriodMeasure !== undefined;
    }

    export function isAttributeSortItem(sortItem: AFM.SortItem): sortItem is AFM.IAttributeSortItem {
        return !isEmpty(sortItem) && (sortItem as AFM.IAttributeSortItem).attributeSortItem !== undefined;
    }

    export function isMeasureSortItem(sortItem: AFM.SortItem): sortItem is AFM.IMeasureSortItem {
        return !isEmpty(sortItem) && (sortItem as AFM.IMeasureSortItem).measureSortItem !== undefined;
    }

    export function isMeasureLocatorItem(locator: AFM.LocatorItem): locator is AFM.IMeasureLocatorItem {
        return !isEmpty(locator) && (locator as AFM.IMeasureLocatorItem).measureLocatorItem !== undefined;
    }

    export function isPositiveAttributeFilter(filter: AFM.CompatibilityFilter): filter is AFM.IPositiveAttributeFilter {
        return !isEmpty(filter) && (filter as AFM.IPositiveAttributeFilter).positiveAttributeFilter !== undefined;
    }

    export function isNegativeAttributeFilter(filter: AFM.CompatibilityFilter): filter is AFM.INegativeAttributeFilter {
        return !isEmpty(filter) && (filter as AFM.INegativeAttributeFilter).negativeAttributeFilter !== undefined;
    }
}
