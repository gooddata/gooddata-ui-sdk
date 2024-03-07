// (C) 2019-2024 GoodData Corporation
import React from "react";
import isEmpty from "lodash/isEmpty.js";
import { IAnalyticalBackend, IExecutionFactory, IPreparedExecution } from "@gooddata/sdk-backend-spi";
import {
    ISettings,
    ITheme,
    IColorPalette,
    IInsight,
    IInsightDefinition,
    ITotal,
    ObjRef,
    VisualizationProperties,
    IExecutionConfig,
    LocalIdRef,
    ISortItem,
    ISeparators,
} from "@gooddata/sdk-model";
import {
    ChartType,
    ErrorCodes,
    GoodDataSdkError,
    ExplicitDrill,
    IDrillEvent,
    ILocale,
    IPushData,
    IVisualizationCallbacks,
    OverTimeComparisonType,
    SdkErrorType,
    VisualizationEnvironment,
    IOpenAsReportUiConfig,
} from "@gooddata/sdk-ui";
import { IAvailableSortsGroup, ISortConfig } from "./SortConfig.js";
import { IDefaultControlProperties } from "./ControlProperties.js";

export type RenderFunction = (component: any, target: Element) => void;

export type UnmountFunction = (elementsOrSelectors?: (string | HTMLElement)[]) => void;

export type ElementSelectorFunction = () => HTMLElement | null;

export interface IVisConstruct {
    backend: IAnalyticalBackend;
    // TODO: rename to workspace
    projectId: string;
    element: ElementSelectorFunction;
    configPanelElement: ElementSelectorFunction;

    callbacks: IVisCallbacks;
    environment?: VisualizationEnvironment;
    locale?: ILocale;
    // TODO: rename to settings
    featureFlags?: ISettings;
    visualizationProperties: VisualizationProperties;
    renderFun: RenderFunction;
    unmountFun: UnmountFunction;
}

/**
 * @internal
 */
export interface IConfigurationPanelRenderers {
    InteractionsDetailRenderer?: () => React.ReactNode;
}

/**
 * @internal
 */
export interface ICustomProps {
    drillableItems?: ExplicitDrill[];
    totalsEditAllowed?: boolean;
    lastSavedVisClassUrl?: string;
    sourceInsightId?: string;
    configurationPanelRenderers?: IConfigurationPanelRenderers;
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
    dateFormat?: string;
    config?: IGdcConfig;
    executionConfig?: IExecutionConfig;
    theme?: ITheme;

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
    displayFormRef: ObjRef;
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

export type RankingFilterOperator = "TOP" | "BOTTOM";

export interface IRankingFilter {
    measure: string;
    attributes?: string[];
    operator: RankingFilterOperator;
    value: number;
}

export type IBucketFilter = IAttributeFilter | IDateFilter | IMeasureValueFilter | IRankingFilter;

export interface ISort {
    direction: "asc" | "desc";
}

export interface IDisplayForm {
    id: string;
    ref: ObjRef;
    type: string;
    title: string;
    isDefault?: boolean;
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
    isTotalMeasure?: boolean;
    sort?: ISort;
    masterLocalIdentifier?: string;
    overTimeComparisonType?: OverTimeComparisonType;
    operandLocalIdentifiers?: Array<string | null> | null;
    operator?: string | null;

    dfRef?: ObjRef;
    locationDisplayFormRef?: ObjRef;
    dateDatasetRef?: ObjRef;
    displayForms?: IDisplayForm[];
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
    allowsDifferentAttributes?: boolean;
    transformAttributeToMeasure?: boolean;

    // allow more than one date item in the bucket, regardless of date dimension
    allowsDuplicateDates?: boolean;
    allowsReordering?: boolean;
    allowsSwapping?: boolean;
    enabled?: boolean;
    itemsLimit?: number;
    itemsLimitByType?: {
        date?: number;
        metric?: number;
        fact?: number;
        attribute?: number;
    };
    isShowInPercentEnabled?: boolean;
    isShowInPercentVisible?: boolean;
    isShowOnSecondaryAxisVisible?: boolean;
    allowShowOnSecondaryAxis?: boolean;
    allowSelectChartType?: boolean;
    allowOptionalStacking?: boolean;
    isTotalMeasureVisible?: boolean;
    isTotalMeasureEnabled?: boolean;

    // indicates that the visualization prefers date items in the bucket to have the same dimension
    preferSynchronizedDates?: boolean;
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

export interface IVisualizationProperties<
    ControlProperties extends IDefaultControlProperties = IDefaultControlProperties,
> {
    sortItems?: ISortItem[];
    controls?: IDefaultControlProperties & ControlProperties;
    [property: string]: any; // should not be used like this but to be backward compatible
}

export interface IReferencePoint {
    buckets: IBucketOfFun[];
    filters: IFilters;
    properties?: IVisualizationProperties; // properties are under plugvis creator's control
    availableSorts?: IAvailableSortsGroup[];
}

export interface IReferences {
    [identifier: string]: string;
}

export interface IExtendedReferencePoint extends IReferencePoint {
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

    /**
     * Get visualization execution based on provided props, insight and execution factory.
     *
     * @param props - visualization properties
     * @param insight - insight to be executed
     * @param executionFactory - execution factory to use when triggering calculation on backend
     */
    getExecution(
        props: IVisProps,
        insight: IInsightDefinition,
        executionFactory: IExecutionFactory,
    ): IPreparedExecution;

    unmount(): void;

    addNewDerivedBucketItems(
        referencePoint: IReferencePoint,
        newDerivedBucketItems: IBucketItem[],
    ): Promise<IReferencePoint>;

    /**
     * Called every time the reference point or the visualization class change
     * to allow visualizations to get updated ExtendedReferencePoint.
     * @param referencePoint - The new value of the reference point.
     * @param previousReferencePoint - The previous value of the reference point.
     * This value is only provided if the visualization class was not changed
     * (i. e. both points are related to the same visualization class).
     * @returns Promise of the new ExtendedReferencePoint.
     */
    getExtendedReferencePoint(
        referencePoint: IReferencePoint,
        previousReferencePoint?: IReferencePoint,
    ): Promise<IExtendedReferencePoint>;

    /**
     * Called when the Drill Down is performed, used to get the Drill Down target {@link IInsight} instance.
     *
     * The exact contract depends on individual {@link IInsight} type, but generally it should replace
     * the drilled attribute with the Drill Down target target attribute and include the filters from the
     * drill event into the returned {@link IInsight}.
     *
     * @param source - {@link IInsight} to be used for the the Drill Down execution
     * @param drillDownContext - Drill Down configuration used to properly create the result
     * @param backendSupportsElementUris - whether current backend supports elements by uri. Affects how filters for insight are created
     * @returns `source` as the Drill Down target {@link IInsight}
     */
    getInsightWithDrillDownApplied(
        source: IInsight,
        drillDownContext: IDrillDownContext,
        backendSupportsElementUris: boolean,
    ): IInsight;

    /**
     * Called whenever inputs for default sorts calculation changed and it should provide current sort and also all valid available sorts for actual reference point/properties
     * @param referencePoint - the reference point for which the sort config needs to be evaluated
     */
    getSortConfig(referencePoint: IReferencePoint): Promise<ISortConfig>;

    /**
     * Called whenever props of visualization changed. Detects if some of properties which affect also reference point did change. If so, reference point will be then recalculated.
     * @param currentReferencePoint - the current reference point
     * @param nextReferencePoint - the new reference point
     */
    haveSomePropertiesRelevantForReferencePointChanged(
        currentReferencePoint: IReferencePoint,
        nextReferencePoint: IReferencePoint,
    ): boolean;

    /**
     * Detects whether the reference point needs to update buckets from withing the pluggable visualization.
     *
     * @param currentReferencePoint - the current reference point
     * @param nextReferencePoint - the new reference point
     * @returns array of buckets to update
     */
    getBucketsToUpdate(
        currentReferencePoint: IReferencePoint,
        nextReferencePoint: IReferencePoint,
    ): IBucketItem[] | undefined;
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
     * If pluggable visualization is asked to render itself but its columns bucket do not contain the right 'stuff',
     * then this is the error code to communicate the fact.
     */
    INVALID_COLUMNS: "INVALID_COLUMNS",

    /**
     * This error means that empty AFM was went to the GoodData.UI and as such can't be executed.
     */
    EMPTY_AFM: "EMPTY_AFM",
};

/**
 * @alpha
 */
export type PluggableVisualizationErrorType = keyof typeof PluggableVisualizationErrorCodes;

/**
 * @alpha
 */
export class InvalidBucketsSdkError extends GoodDataSdkError {
    public readonly pveType: PluggableVisualizationErrorType;

    constructor(cause?: Error) {
        super(ErrorCodes.UNKNOWN_ERROR as SdkErrorType, undefined, cause);

        this.pveType = "INVALID_BUCKETS";
    }

    public getErrorCode(): string {
        return this.pveType;
    }
}

/**
 * @alpha
 */
export class InvalidColumnsSdkError extends GoodDataSdkError {
    public readonly pveType: PluggableVisualizationErrorType;

    constructor(cause?: Error) {
        super(ErrorCodes.UNKNOWN_ERROR as SdkErrorType, undefined, cause);

        this.pveType = "INVALID_COLUMNS";
    }

    public getErrorCode(): string {
        return this.pveType;
    }
}

/**
 * @alpha
 */
export class EmptyAfmSdkError extends GoodDataSdkError {
    public readonly pveType: PluggableVisualizationErrorType;

    constructor(cause?: Error) {
        super(ErrorCodes.UNKNOWN_ERROR as SdkErrorType, undefined, cause);

        this.pveType = "EMPTY_AFM";
    }

    public getErrorCode(): string {
        return this.pveType;
    }
}

/**
 * @alpha
 */
export type PluggableVisualizationError = InvalidBucketsSdkError | EmptyAfmSdkError;

/**
 * @alpha
 */
export function isPluggableVisualizationError(obj: unknown): obj is PluggableVisualizationError {
    return !isEmpty(obj) && (obj as any).pveType !== undefined;
}

/**
 * @alpha
 */
export function isInvalidBuckets(obj: unknown): obj is InvalidBucketsSdkError {
    return !isEmpty(obj) && (obj as InvalidBucketsSdkError).pveType === "INVALID_BUCKETS";
}

/**
 * @alpha
 */
export function isInvalidColumns(obj: unknown): obj is InvalidColumnsSdkError {
    return !isEmpty(obj) && (obj as InvalidColumnsSdkError).pveType === "INVALID_COLUMNS";
}

/**
 * @alpha
 */
export function isEmptyAfm(obj: unknown): obj is EmptyAfmSdkError {
    return !isEmpty(obj) && (obj as EmptyAfmSdkError).pveType === "EMPTY_AFM";
}

/**
 * Implicit drill down context
 *
 * @alpha
 */
export interface IDrillDownContext {
    drillDefinition: IDrillDownDefinition;
    event: IDrillEvent;
}

/**
 * Information about the DrillDown interaction - the attribute that is next in the drill down hierarchy.
 * @beta
 */
export interface IDrillDownDefinition {
    type: "drillDown";

    /**
     * Local identifier of the attribute that triggered the drill down.
     */
    origin: LocalIdRef;

    /**
     * Target attribute display form for drill down.
     */
    target: ObjRef;
}

/**
 * Type-guard testing whether the provided object is an instance of {@link IDrillDownDefinition}.
 * @beta
 */
export function isDrillDownDefinition(obj: unknown): obj is IDrillDownDefinition {
    return !isEmpty(obj) && (obj as IDrillDownDefinition).type === "drillDown";
}
