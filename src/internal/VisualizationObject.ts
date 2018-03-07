import { IObjectMeta } from '../Meta';

export namespace Internal {
    /**
     * Internal Visualization Object
     *
     * It differs from the public visualization object by restricting object qualifiers
     * to be defined via URI only.
     *
     * That means while using identifiers in UI SDK is possible, e.g.:
     *
     * ```
     *  const filter = {
     *      positiveAttributeFilter: {
     *          displayForm: {
     *              identifier: 'my.identifier'
     *          },
     *          in: ['foo', 'bar']
     *      }
     *  };
     * ```
     *
     * It's not possible to save such object in the GoodData platform,
     * as there are inherent problems to storing metadata objects with identifiers.
     *
     * Therefore we have an alternative interface that is used solely for the purpose of saving Visualizations.
     */
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

        export interface IVisualizationObjectPositiveAttributeFilter {
            positiveAttributeFilter: {
                displayForm: IObjUriQualifier;
                in: string[];
            };
        }

        export interface IVisualizationObjectNegativeAttributeFilter {
            negativeAttributeFilter: {
                displayForm: IObjUriQualifier;
                notIn: string[];
            };
        }

        export interface IVisualizationObjectAbsoluteDateFilter {
            absoluteDateFilter: {
                dataSet: IObjUriQualifier;
                from?: string;
                to?: string;
            };
        }

        export interface IVisualizationObjectRelativeDateFilter {
            relativeDateFilter: {
                dataSet: IObjUriQualifier
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
                displayForm: IObjUriQualifier;
                alias?: string
            };
        }

        export interface IMeasureDefinition {
            measureDefinition: {
                item: IObjUriQualifier;
                aggregation?: MeasureAggregation;
                filters?: VisualizationObjectFilter[];
                computeRatio?: boolean;
            };
        }

        export interface IPoPMeasureDefinition {
            popMeasureDefinition: {
                measureIdentifier: Identifier;
                popAttribute: IObjUriQualifier;
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
}
