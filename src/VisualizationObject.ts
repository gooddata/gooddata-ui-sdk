import { IObjectMeta } from './Meta';

export namespace VisualizationObject {
    export type SortDirection = 'asc' | 'desc';
    export type Identifier = string;
    export type MeasureAggregation = 'sum' | 'count' | 'avg' | 'min' | 'max' | 'median' | 'runsum';
    export type TotalType = 'sum' | 'avg' | 'max' | 'min' | 'nat' | 'med';
    export type VisualizationType = 'table' | 'line' | 'column' | 'bar' | 'pie' | 'doughnut' | 'combo';

    export type BucketItem = IMeasure | IVisualizationAttribute;

    export type VisualizationObjectFilter = VisualizationObjectDateFilter | VisualizationObjectAttributeFilter;

    export type VisualizationObjectDateFilter =
        IVisualizationObjectRelativeDateFilter | IVisualizationObjectAbsoluteDateFilter;

    export type VisualizationObjectAttributeFilter =
        IVisualizationObjectPositiveAttributeFilter | IVisualizationObjectNegativeAttributeFilter;

    export interface IObjUriQualifier {
        uri: string;
    }

    export interface IObjIdentifierQualifier {
        identifier: string;
    }

    export type ObjQualifier = IObjUriQualifier | IObjIdentifierQualifier;

    export interface IVisualizationObjectPositiveAttributeFilter {
        positiveAttributeFilter: {
            displayForm: ObjQualifier;
            in: string[];
        };
    }

    export interface IVisualizationObjectNegativeAttributeFilter {
        negativeAttributeFilter: {
            displayForm: ObjQualifier;
            notIn: string[];
        };
    }

    export interface IVisualizationObjectAbsoluteDateFilter {
        absoluteDateFilter: {
            dataSet: ObjQualifier;
            from?: string;
            to?: string;
        };
    }

    export interface IVisualizationObjectRelativeDateFilter {
        relativeDateFilter: {
            dataSet: ObjQualifier
            granularity: string;
            from?: number;
            to?: number;
        };
    }

    export interface IVisualizationObjectContent {
        visualizationClass: IObjUriQualifier;
        buckets: IBucket[];
        filters?: VisualizationObjectFilter[];
        properties?: string;
        references?: IReferenceItems;
    }

    export interface IReferenceItems {
        [identifier: string]: string;
    }

    export interface IBucket {
        localIdentifier?: Identifier;
        items: BucketItem[];
        totals?: IVisualizationTotal[];
    }

    export interface IVisualizationTotal {
        type: TotalType;
        measureIdentifier: string;
        attributeIdentifier: string;
        alias?: string;
    }

    export interface IMeasure {
        measure: {
            localIdentifier: Identifier;
            definition: IMeasureDefinition | IPoPMeasureDefinition;
            alias?: string;
            title?: string;
            format?: string;
        };
    }

    export interface IVisualizationAttribute {
        visualizationAttribute: {
            localIdentifier: Identifier;
            displayForm: ObjQualifier;
            alias?: string
        };
    }

    export interface IMeasureDefinition {
        measureDefinition: {
            item: ObjQualifier;
            aggregation?: MeasureAggregation;
            filters?: VisualizationObjectFilter[];
            computeRatio?: boolean;
        };
    }

    export interface IPoPMeasureDefinition {
        popMeasureDefinition: {
            measureIdentifier: Identifier;
            popAttribute: ObjQualifier;
        };
    }

    export interface IVisualizationObject {
        meta: IObjectMeta;
        content: IVisualizationObjectContent;
    }

    export interface IVisualization {
        visualizationObject: IVisualizationObject;
    }

    export interface IVisualizationObjectResponse {
        visualizationObject: IVisualizationObject;
    }


    export function isMeasure(bucketItem: IMeasure | IVisualizationAttribute): bucketItem is IMeasure {
        return (bucketItem as IMeasure).measure !== undefined;
    }

    export function isVisualizationAttribute(
        bucketItem: IMeasure | IVisualizationAttribute
    ): bucketItem is IVisualizationAttribute {
            return (bucketItem as IVisualizationAttribute).visualizationAttribute !== undefined;
    }

    export function isMeasureDefinition(
        definition: IMeasureDefinition | IPoPMeasureDefinition,
    ): definition is IMeasureDefinition {
        return (definition as IMeasureDefinition).measureDefinition !== undefined;
    }

    export function isAttributeFilter(filter: VisualizationObjectFilter): filter is VisualizationObjectAttributeFilter {
        return (filter as IVisualizationObjectPositiveAttributeFilter).positiveAttributeFilter !== undefined ||
            (filter as IVisualizationObjectNegativeAttributeFilter).negativeAttributeFilter !== undefined;
    }

    export function isPositiveAttributeFilter(filter: VisualizationObjectAttributeFilter): filter is IVisualizationObjectPositiveAttributeFilter {
        return (filter as IVisualizationObjectPositiveAttributeFilter).positiveAttributeFilter !== undefined;
    }

    export function isAbsoluteDateFilter(filter: VisualizationObjectDateFilter): filter is IVisualizationObjectAbsoluteDateFilter {
        return (filter as IVisualizationObjectAbsoluteDateFilter).absoluteDateFilter !== undefined;
    }

    export function isAttribute(bucketItem: BucketItem): bucketItem is IVisualizationAttribute {
        return (bucketItem as IVisualizationAttribute).visualizationAttribute !== undefined;
    }
}
