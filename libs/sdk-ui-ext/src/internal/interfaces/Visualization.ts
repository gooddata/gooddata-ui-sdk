// (C) 2019-2020 GoodData Corporation
import { ISeparators } from "@gooddata/numberjs";
import { IAnalyticalBackend, IExecutionFactory, ISettings } from "@gooddata/sdk-backend-spi";
import {
    IColorPalette,
    IInsightDefinition,
    ITotal,
    VisualizationProperties,
    ObjRef,
} from "@gooddata/sdk-model";
import {
    ChartType,
    IDrillableItem,
    ILocale,
    IPushData,
    IVisualizationCallbacks,
    OverTimeComparisonType,
    VisualizationEnvironment,
    IHeaderPredicate,
} from "@gooddata/sdk-ui";

export type RenderFunction = (component: any, target: Element) => void;

export interface IVisConstruct {
    backend: IAnalyticalBackend;
    // TODO: rename to workspace
    projectId: string;
    element: string;
    configPanelElement: string;

    callbacks: IVisCallbacks;
    environment?: VisualizationEnvironment;
    locale?: ILocale;
    // TODO: rename to settings
    featureFlags?: ISettings;
    visualizationProperties: VisualizationProperties;
    renderFun: RenderFunction;
}

export interface ICustomProps {
    stickyHeaderOffset?: number;
    drillableItems?: Array<IDrillableItem | IHeaderPredicate>;
    totalsEditAllowed?: boolean;
}

export interface IDimensions {
    width?: number; // Note: will not be optional once we start sending it
    height: number;
}

/**
 * @alpha
 */
export interface IVisProps {
    dimensions?: IDimensions;
    custom?: ICustomProps;
    locale?: ILocale;
    config?: IGdcConfig;

    /*
     * This can be used to override configuration of visualization when embedding through InsightView. The pluggable
     * visualization implementation MUST take these custom properties and override the the effective visualization
     * config with them.
     *
     * It is important that the override happens just before sending the config to the underlying chart -
     * the custom config passed through here will be in the format that is understood by the underlying chart.
     */
    customVisualizationConfig?: any;
}

export interface IVisualizationOptions {
    dateOptionsDisabled: boolean;
}

export interface IVisCallbacks extends IVisualizationCallbacks {
    pushData(data: IPushData, options?: IVisualizationOptions): void;
}

export interface IBucketFilterElement {
    title: string;
    uri: string;
}

export type ComparisonConditionOperator =
    | "GREATER_THAN"
    | "GREATER_THAN_OR_EQUAL_TO"
    | "LESS_THAN"
    | "LESS_THAN_OR_EQUAL_TO"
    | "EQUAL_TO"
    | "NOT_EQUAL_TO";

export interface IComparisonCondition {
    readonly comparison: {
        readonly operator: ComparisonConditionOperator;
        readonly value: number;
    };
}

export type RangeConditionOperator = "BETWEEN" | "NOT_BETWEEN";

export interface IRangeCondition {
    readonly range: {
        readonly operator: RangeConditionOperator;
        readonly from: number;
        readonly to: number;
    };
}

export type IMeasureValueFilterCondition = IComparisonCondition | IRangeCondition;

export interface IBucketFilterInterval {
    granularity: string;
    interval: string[];
    name: string;
}

export interface IAttributeFilter {
    attribute: string;
    isInverted: boolean;
    totalElementsCount: number;
    selectedElements: Array<{
        title: string;
        uri: string;
    }>;
}

export const DATE_DATASET_ATTRIBUTE = "attr.datedataset";

export interface IDateFilter {
    attribute: "attr.datedataset";
    overTimeComparisonType: OverTimeComparisonType;
    interval: {
        granularity: string;
        interval: [string, string] | [number, number];
        name: string;
        type: "relative" | "absolute";
    };
}

export interface IMeasureValueFilter {
    measureLocalIdentifier: string;
    condition?: IMeasureValueFilterCondition;
}

export type IBucketFilter = IAttributeFilter | IDateFilter | IMeasureValueFilter;

export interface ISort {
    direction: "asc" | "desc";
}

export interface IBucketItem {
    localIdentifier: string;
    type?: string;
    aggregation?: boolean;
    attribute?: string;
    filters?: IBucketFilter[];
    format?: string;
    granularity?: string;
    showInPercent?: boolean;
    showOnSecondaryAxis?: boolean;
    sort?: ISort;
    masterLocalIdentifier?: string;
    overTimeComparisonType?: OverTimeComparisonType;
    operandLocalIdentifiers?: Array<string | null> | null;
    operator?: string | null;

    dfRef?: ObjRef;
    locationDisplayFormRef?: ObjRef;
}

export interface IFiltersBucketItem extends IBucketItem {
    autoCreated?: boolean;
}

// TODO: SDK8: rename this :) the original name IBucket conflicted with what we have in model;
// this interface and all the other similar interface (bucket item, filters etc) are specifically used
// in the reference point
export interface IBucketOfFun {
    localIdentifier: string;
    items: IBucketItem[];
    totals?: ITotal[];
    chartType?: string;
}

export interface IFilters {
    localIdentifier: "filters";
    items: IFiltersBucketItem[];
}

export interface IRecommendations {
    [key: string]: boolean;
}

export interface IBucketUiConfig {
    accepts?: string[];
    canAddItems?: boolean;
    warningMessage?: string;
    title?: string;
    subtitle?: string;
    icon?: string;
    allowsDuplicateItems?: boolean;
    allowsReordering?: boolean;
    allowsSwapping?: boolean;
    enabled?: boolean;
    itemsLimit?: number;
    isShowInPercentEnabled?: boolean;
    isShowInPercentVisible?: boolean;
    isShowOnSecondaryAxisVisible?: boolean;
    allowShowOnSecondaryAxis?: boolean;
    allowSelectChartType?: boolean;
    allowOptionalStacking?: boolean;
}

export interface IBucketsUiConfig {
    [localIdentifier: string]: IBucketUiConfig;
}

export interface IExportUiConfig {
    supported?: boolean;
}

export interface INoMetricUiConfig {
    supported?: boolean;
}

export interface IOpenAsReportUiConfig {
    supported?: boolean;
    warningMessage?: string;
}

export interface ICustomError {
    heading: string;
    text: string;
}

export interface IOptionalStacking {
    supported?: boolean;
    disabled?: boolean;
    stackMeasures?: boolean;
    stackMeasuresToPercent?: boolean;
    canStackInPercent?: boolean;
}

export interface ISupportedLocationIcon {
    supported?: boolean;
}

export interface IUiConfig {
    buckets: IBucketsUiConfig;
    recommendations?: IRecommendations;
    exportConfig?: IExportUiConfig;
    noMetricAccepted?: INoMetricUiConfig;
    openAsReport?: IOpenAsReportUiConfig;
    customError?: ICustomError;
    supportedOverTimeComparisonTypes?: OverTimeComparisonType[];
    supportedChartTypes?: ChartType[];
    axis?: string;
    optionalStacking?: IOptionalStacking;
    supportedLocationIcon?: ISupportedLocationIcon;
}

export interface IVisualizationProperties {
    // This can be anything depending on a visualization type
    // perhaps consider adding: sortItems?: AFM.SortItem[]
    [property: string]: any;
}

export interface IReferencePoint {
    buckets: IBucketOfFun[];
    filters: IFilters;
    properties?: IVisualizationProperties; // properties are under plugvis creator's control
}

export interface IReferences {
    [identifier: string]: string;
}

export interface IExtendedReferencePoint {
    buckets: IBucketOfFun[];
    filters: IFilters;
    properties?: IVisualizationProperties; // properties are under plugvis creator's control
    uiConfig: IUiConfig;
}

/**
 * @alpha
 */
export interface IVisualization {
    /**
     * Update and re-render visualization to reflect change of insight state.
     *
     * Currently it is possible that context (AD/KD) will send insight that is not in a valid state:
     *
     * -  insight might be empty
     * -  insight might not be completely defined (user did not yet specify measures etc)
     *
     * It is the responsibility of the implementation to verify the state of insight during the update and
     * if there is anything amiss communicate with the context using the onError callback which it
     * received during construction time via {@link IVisConstruct}
     *
     * The loading state of the visualization must be communicated using the onLoadingChanged callback which
     * is also passed during construction time.
     *
     * @param props - some runtime properties
     * @param insight - new state of insight
     * @param insightPropertiesMeta - new state of insight properties meta
     * @param executionFactory - execution factory to use when triggering calculation on backend
     */
    update(
        props: IVisProps,
        insight: IInsightDefinition,
        insightPropertiesMeta: any,
        executionFactory: IExecutionFactory,
    ): void;

    unmount(): void;

    addNewDerivedBucketItems(
        referencePoint: IReferencePoint,
        newDerivedBucketItems: IBucketItem[],
    ): Promise<IReferencePoint>;

    /**
     * Called every time the reference point or the visualization class change
     * to allow visualizations to get updated ExtendedReferencePoint.
     * @param referencePoint The new value of the reference point.
     * @param previousReferencePoint The previous value of the reference point.
     * This value is only provided if the visualization class was not changed
     * (i. e. both points are related to the same visualization class).
     * @returns Promise of the new ExtendedReferencePoint.
     */
    getExtendedReferencePoint(
        referencePoint: IReferencePoint,
        previousReferencePoint?: IReferencePoint,
    ): Promise<IExtendedReferencePoint>;
}

export interface IGdcConfig {
    separators?: ISeparators;
    colorPalette?: IColorPalette;
    isExportMode?: boolean;
    isInEditMode?: boolean;
    mapboxToken?: string;
    maxWidth?: number;
    maxHeight?: number;
    forceDisableDrillOnAxes?: boolean;
}

/**
 * Class name of element where pluggable visualization is supposed to render its configuration
 * panels.
 *
 * @alpha
 */
export const ConfigPanelClassName = "gd-configuration-panel-content";

/**
 * @alpha
 */
export const PluggableVisualizationErrorCodes = {
    /**
     * If pluggable visualization is asked to render itself but its buckets do not contain the right 'stuff',
     * then this is the error code to communicate the fact.
     */
    INVALID_BUCKETS: "INVALID_BUCKETS",

    /**
     * This error means that empty AFM was went to the GoodData.UI and as such can't be executed.
     */
    EMPTY_AFM: "EMPTY_AFM",
};
