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

    export type MeasureDefinition = ISimpleMeasureDefinition | IPopMeasureDefinition;

    export interface ISimpleMeasureDefinition {
        measure: ISimpleMeasure;
    }

    export interface IPopMeasureDefinition {
        popMeasure: IPopMeasure;
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

    export type VisualizationStyleType = 'common' | 'table' | 'line' | 'column' | 'bar';
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
        return !!(qualifier as AFM.IObjUriQualifier).uri;
    }

    export function isSimpleMeasureDefinition(
        definition: AFM.ISimpleMeasureDefinition | AFM.IPopMeasureDefinition
    ): definition is AFM.ISimpleMeasureDefinition {
        return !!(definition as AFM.ISimpleMeasureDefinition).measure;
    }

    export function isPopMeasureDefinition(
        definition: AFM.ISimpleMeasureDefinition | AFM.IPopMeasureDefinition
    ): definition is AFM.IPopMeasureDefinition {
        return !!(definition as AFM.IPopMeasureDefinition).popMeasure;
    }

    export function isAttributeSortItem(sortItem: AFM.SortItem): sortItem is AFM.IAttributeSortItem {
        return !!(sortItem as AFM.IAttributeSortItem).attributeSortItem;
    }

    export function isMeasureSortItem(sortItem: AFM.SortItem): sortItem is AFM.IMeasureSortItem {
        return !!(sortItem as AFM.IMeasureSortItem).measureSortItem;
    }

    export function isMeasureLocatorItem(locator: AFM.LocatorItem): locator is AFM.IMeasureLocatorItem {
        return !!(locator as AFM.IMeasureLocatorItem).measureLocatorItem;
    }

    export function isPositiveAttributeFilter(filter: AFM.CompatibilityFilter): filter is AFM.IPositiveAttributeFilter {
        return !!(filter as AFM.IPositiveAttributeFilter).positiveAttributeFilter;
    }

    export function isNegativeAttributeFilter(filter: AFM.CompatibilityFilter): filter is AFM.INegativeAttributeFilter {
        return !!(filter as AFM.INegativeAttributeFilter).negativeAttributeFilter;
    }
}
