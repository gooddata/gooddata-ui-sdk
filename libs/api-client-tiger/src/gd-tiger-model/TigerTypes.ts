// (C) 2025-2026 GoodData Corporation

/**
 * Tiger-specific type definitions for analytical objects.
 *
 * @remarks
 * These types are manually defined duplicates of platform-agnostic types from @gooddata/sdk-model.
 * They exist as separate types to establish proper architectural boundaries between:
 * - Layer 1 (api-client-tiger): Platform-specific API client and models
 * - Layer 2 (sdk-model): Platform-agnostic domain model
 *
 * Why not auto-generated from OpenAPI spec?
 * The Tiger backend API stores these objects as free-form JSON in the "content" field of metadata objects.
 * The OpenAPI spec defines this field as a generic object without type constraints. Therefore, these
 * types must be defined manually to provide type safety for the structured data within that free-form field.
 *
 * Dangerous: These tiger types needs to be in sync with BE types defined in https://github.com/gooddata/gdc-nas/tree/master/libraries/analytical-model-data-contracts/src/main/kotlin
 * as all these analytical entities are read by BE services.
 *
 * Future plans include moving away from the free-form approach to properly typed API contracts,
 * at which point these types can be auto-generated from the OpenAPI specification.
 *
 * Current state:
 * - These Tiger types are structurally identical to their sdk-model counterparts
 * - Converters in sdk-backend-tiger use cloning to transform between Tiger and sdk-model types
 * - In the future, these types may diverge to accommodate platform-specific features
 *
 * @public
 */

import { type DateFilterGranularity, type ObjRef } from "@gooddata/sdk-model";

import { type DashboardFilter } from "../generated/metadata-json-api/index.js";

//
// =====================================================================================================================
// Bucket Types
// =====================================================================================================================
//

/**
 * Tiger-specific attribute definition
 * @public
 */
export interface ITigerAttribute {
    attribute: {
        localIdentifier: string;
        displayForm: ObjRef;
        alias?: string;
        showAllValues?: boolean;
    };
}

/**
 * Tiger-specific simple measure definition
 * @public
 */
export interface ITigerSimpleMeasure {
    localIdentifier: string;
    definition: ITigerSimpleMeasureDefinition;
    alias?: string;
    format?: string;
    title?: string;
}

/**
 * @public
 */
export interface ITigerSimpleMeasureDefinition {
    measure: {
        item: ObjRef;
        aggregation?: "sum" | "count" | "avg" | "min" | "max" | "median" | "runsum";
        filters?: ITigerFilter[];
        computeRatio?: boolean;
    };
}

/**
 * Tiger-specific arithmetic measure definition
 * @public
 */
export interface ITigerArithmeticMeasure {
    localIdentifier: string;
    definition: ITigerArithmeticMeasureDefinition;
    alias?: string;
    format?: string;
    title?: string;
}

/**
 * @public
 */
export interface ITigerArithmeticMeasureDefinition {
    arithmeticMeasure: {
        measureIdentifiers: string[];
        operator: "sum" | "difference" | "multiplication" | "ratio" | "change";
    };
}

/**
 * Tiger-specific POP measure definition
 * @public
 */
export interface ITigerPopMeasure {
    localIdentifier: string;
    definition: ITigerPopMeasureDefinition;
    alias?: string;
    format?: string;
    title?: string;
}

/**
 * @public
 */
export interface ITigerPopMeasureDefinition {
    popMeasure: {
        measureIdentifier: string;
        popAttribute: ObjRef;
    };
}

/**
 * Tiger-specific previous period measure definition
 * @public
 */
export interface ITigerPreviousPeriodMeasure {
    localIdentifier: string;
    definition: ITigerPreviousPeriodMeasureDefinition;
    alias?: string;
    format?: string;
    title?: string;
}

/**
 * @public
 */
export interface ITigerPreviousPeriodMeasureDefinition {
    previousPeriodMeasure: {
        measureIdentifier: string;
        dateDataSets: Array<{
            dataSet: ObjRef;
            periodsAgo: number;
        }>;
    };
}

/**
 * Tiger-specific measure types union
 * @public
 */
export type ITigerMeasure =
    | ITigerSimpleMeasure
    | ITigerArithmeticMeasure
    | ITigerPopMeasure
    | ITigerPreviousPeriodMeasure;

/**
 * Tiger-specific attribute or measure union
 * @public
 */
export type ITigerAttributeOrMeasure = ITigerMeasure | ITigerAttribute;

/**
 * Tiger-specific total definition
 * @public
 */
export interface ITigerTotal {
    type: "sum" | "avg" | "max" | "min" | "nat" | "med";
    measureIdentifier: string;
    attributeIdentifier: string;
    alias?: string;
}

/**
 * Tiger-specific bucket definition
 * @public
 */
export interface ITigerBucket {
    localIdentifier?: string;
    items: ITigerAttributeOrMeasure[];
    totals?: ITigerTotal[];
}

//
// =====================================================================================================================
// Filter Types
// =====================================================================================================================
//

/**
 * Tiger-specific attribute elements by reference
 * @public
 */
export interface ITigerAttributeElementsByRef {
    uris: Array<string | null>;
}

/**
 * Tiger-specific attribute elements by value
 * @public
 */
export interface ITigerAttributeElementsByValue {
    values: Array<string | null>;
}

/**
 * @public
 */
export type ITigerAttributeElements = ITigerAttributeElementsByRef | ITigerAttributeElementsByValue;

/**
 * Tiger-specific positive attribute filter
 * @public
 */
export interface ITigerPositiveAttributeFilter {
    positiveAttributeFilter: {
        displayForm: ObjRef;
        in: ITigerAttributeElements;
        localIdentifier?: string;
    };
}

/**
 * Tiger-specific negative attribute filter
 * @public
 */
export interface ITigerNegativeAttributeFilter {
    negativeAttributeFilter: {
        displayForm: ObjRef;
        notIn: ITigerAttributeElements;
        localIdentifier?: string;
    };
}

/**
 * Tiger-specific absolute date filter
 * @public
 */
export interface ITigerAbsoluteDateFilter {
    absoluteDateFilter: {
        dataSet: ObjRef;
        from: string;
        to: string;
        localIdentifier?: string;
    };
}

/**
 * Tiger-specific relative date filter
 * @public
 */
export interface ITigerRelativeDateFilter {
    relativeDateFilter: {
        dataSet: ObjRef;
        granularity: string;
        from: number;
        to: number;
        localIdentifier?: string;
    };
}

/**
 * Tiger-specific comparison condition
 * @public
 */
export interface ITigerComparisonCondition {
    comparison: {
        operator:
            | "GREATER_THAN"
            | "GREATER_THAN_OR_EQUAL_TO"
            | "LESS_THAN"
            | "LESS_THAN_OR_EQUAL_TO"
            | "EQUAL_TO"
            | "NOT_EQUAL_TO";
        value: number;
        treatNullValuesAs?: number;
    };
}

/**
 * Tiger-specific comparison condition in the compound condition
 * @public
 */
export interface ITigerComparisonConditionInCompound {
    comparison: {
        operator:
            | "GREATER_THAN"
            | "GREATER_THAN_OR_EQUAL_TO"
            | "LESS_THAN"
            | "LESS_THAN_OR_EQUAL_TO"
            | "EQUAL_TO"
            | "NOT_EQUAL_TO";
        value: number;
    };
}

/**
 * Tiger-specific range condition
 * @public
 */
export interface ITigerRangeCondition {
    range: {
        operator: "BETWEEN" | "NOT_BETWEEN";
        from: number;
        to: number;
        treatNullValuesAs?: number;
    };
}

/**
 * Tiger-specific range condition in the compound condition
 * @public
 */
export interface ITigerRangeConditionInCompound {
    range: {
        operator: "BETWEEN" | "NOT_BETWEEN";
        from: number;
        to: number;
    };
}

/**
 * Tiger-specific compound condition
 * @public
 */
export interface ITigerCompoundCondition {
    compound: {
        conditions: Array<ITigerComparisonConditionInCompound | ITigerRangeConditionInCompound>;
        treatNullValuesAs?: number;
    };
}

/**
 * @public
 */
export type ITigerMeasureValueFilterCondition =
    | ITigerComparisonCondition
    | ITigerRangeCondition
    | ITigerCompoundCondition;

/**
 * Tiger-specific measure value filter
 * @public
 */
export interface ITigerMeasureValueFilter {
    measureValueFilter: {
        measure: ObjRef;
        condition?: ITigerMeasureValueFilterCondition;
        localIdentifier?: string;
    };
}

/**
 * Tiger-specific ranking filter
 * @public
 */
export interface ITigerRankingFilter {
    rankingFilter: {
        measure: ObjRef;
        attributes?: ObjRef[];
        operator: "TOP" | "BOTTOM";
        value: number;
        localIdentifier?: string;
    };
}

/**
 * Tiger-specific filter types union
 * @public
 */
export type ITigerFilter =
    | ITigerAbsoluteDateFilter
    | ITigerRelativeDateFilter
    | ITigerPositiveAttributeFilter
    | ITigerNegativeAttributeFilter
    | ITigerMeasureValueFilter
    | ITigerRankingFilter;

//
// =====================================================================================================================
// Sort Types
// =====================================================================================================================
//

/**
 * Tiger-specific attribute sort item
 * @public
 */
export interface ITigerAttributeSortItem {
    attributeSortItem: {
        attributeIdentifier: string;
        direction: "asc" | "desc";
        aggregation?: "sum";
    };
}

/**
 * Tiger-specific attribute locator
 * @public
 */
export interface ITigerAttributeLocatorItem {
    attributeLocatorItem: {
        attributeIdentifier: string;
        element: string | null;
    };
}

/**
 * Tiger-specific total locator
 * @public
 */
export interface ITigerTotalLocatorItem {
    totalLocatorItem: {
        attributeIdentifier: string;
        totalFunction: string;
    };
}

/**
 * Tiger-specific measure locator
 * @public
 */
export interface ITigerMeasureLocatorItem {
    measureLocatorItem: {
        measureIdentifier: string;
    };
}

/**
 * @public
 */
export type ITigerLocatorItem =
    | ITigerAttributeLocatorItem
    | ITigerMeasureLocatorItem
    | ITigerTotalLocatorItem;

/**
 * Tiger-specific measure sort item
 * @public
 */
export interface ITigerMeasureSortItem {
    measureSortItem: {
        direction: "asc" | "desc";
        locators: ITigerLocatorItem[];
    };
}

/**
 * Tiger-specific sort item union
 * @public
 */
export type ITigerSortItem = ITigerAttributeSortItem | ITigerMeasureSortItem;

//
// =====================================================================================================================
// Visualization and Insight Types
// =====================================================================================================================
//

/**
 * Tiger-specific visualization properties
 * @public
 */

export type ITigerVisualizationProperties = {
    [key: string]: any;
};

/**
 * Tiger-specific attribute filter config
 * @public
 */
export interface ITigerAttributeFilterConfig {
    mode?: "active" | "readonly" | "hidden";
    localIdentifier?: string;
    displayAsLabel?: ObjRef;
    filterElementsBy?: Array<{
        filterLocalIdentifier: string;
        over: {
            attributes: ObjRef[];
        };
    }>;
}

/**
 * Tiger-specific attribute filter configs
 * @public
 */
export type ITigerAttributeFilterConfigs = {
    [filterLocalIdentifier: string]: ITigerAttributeFilterConfig;
};

/**
 * Tiger-specific insight layer definition
 * @public
 */
export interface ITigerInsightLayerDefinition {
    id: string;
    type: string;
    name?: string;
    buckets: ITigerBucket[];
    filters?: ITigerFilter[];
    attributeFilterConfigs?: ITigerAttributeFilterConfigs;
    sorts?: ITigerSortItem[];
    properties?: ITigerVisualizationProperties;
}

//
// =====================================================================================================================
// Dashboard Layout Types
// =====================================================================================================================
//

/**
 * Tiger-specific dashboard layout size
 * @public
 */
export interface ITigerDashboardLayoutSize {
    gridWidth: number;
    gridHeight?: number;
    heightAsRatio?: number;
}

/**
 * Tiger-specific dashboard layout size by screen
 * @public
 */
export interface ITigerDashboardLayoutSizeByScreenSize {
    xs?: ITigerDashboardLayoutSize;
    sm?: ITigerDashboardLayoutSize;
    md?: ITigerDashboardLayoutSize;
    lg?: ITigerDashboardLayoutSize;
    xl?: ITigerDashboardLayoutSize;
}

/**
 * Tiger-specific base widget interface
 * @public
 */
export interface ITigerBaseWidget {
    type: string;
    localIdentifier?: string;
    size?: ITigerDashboardLayoutSize;
    sizeByScreen?: ITigerDashboardLayoutSizeByScreenSize;
}

/**
 * Tiger-specific insight widget
 * @public
 */
export interface ITigerInsightWidget extends ITigerBaseWidget {
    type: "insight";
    insight: ObjRef;
    ignoreDashboardFilters?: Array<{
        type: "attributeFilterReference" | "dateFilterReference";
        displayForm?: ObjRef;
        dataSet?: ObjRef;
    }>;

    drills?: any[];
    title?: string;
    description?: string;
}

/**
 * Tiger-specific KPI widget
 * @public
 */
export interface ITigerKpiWidget extends ITigerBaseWidget {
    type: "kpi";
    kpi: ObjRef;
    ignoreDashboardFilters?: Array<{
        type: "attributeFilterReference" | "dateFilterReference";
        displayForm?: ObjRef;
        dataSet?: ObjRef;
    }>;
    title?: string;
    description?: string;
}

/**
 * Tiger-specific rich text widget
 * @public
 */
export interface ITigerRichTextWidget extends ITigerBaseWidget {
    type: "richText";
    content?: string;
}

/**
 * @public
 */
export type ITigerWidget = ITigerInsightWidget | ITigerKpiWidget | ITigerRichTextWidget;

/**
 * Tiger-specific dashboard layout item
 * @public
 */
export interface ITigerDashboardLayoutItem<TWidget = ITigerWidget> {
    type: "IDashboardLayoutItem";
    size?: ITigerDashboardLayoutSize;
    sizeByScreen?: ITigerDashboardLayoutSizeByScreenSize;
    widget?: TWidget | ITigerDashboardLayout<TWidget>;
}

/**
 * Tiger-specific dashboard layout column
 * @public
 */
export interface ITigerDashboardLayoutColumn<TWidget = ITigerWidget> {
    type: "IDashboardLayoutColumn";
    size?: ITigerDashboardLayoutSize;
    sizeByScreen?: ITigerDashboardLayoutSizeByScreenSize;
    items?: Array<ITigerDashboardLayoutItem<TWidget>>;
}

/**
 * Tiger-specific dashboard layout section header
 * @public
 */
export interface ITigerDashboardLayoutSectionHeader {
    title?: string;
    description?: string;
}

/**
 * Tiger-specific dashboard layout section
 * @public
 */
export interface ITigerDashboardLayoutSection<TWidget = ITigerWidget> {
    type: "IDashboardLayoutSection";
    header?: ITigerDashboardLayoutSectionHeader;
    items?: Array<ITigerDashboardLayoutColumn<TWidget>>;
}

/**
 * Tiger-specific dashboard layout
 * @public
 */
export interface ITigerDashboardLayout<TWidget = ITigerWidget> {
    type: "IDashboardLayout";
    sections?: Array<ITigerDashboardLayoutSection<TWidget>>;
}

//
// =====================================================================================================================
// Dashboard Configuration Types
// =====================================================================================================================
//

/**
 * Tiger-specific dashboard date filter config
 * @public
 */
export interface ITigerDashboardDateFilterConfig {
    filterName: string;
    mode?: "readonly" | "hidden" | "active";
    hideOptions?: string[];
    hideGranularities?: string[];
    addPresets?: {
        absolutePresets?: Array<{
            from: string;
            to: string;
            name: string;
            localIdentifier?: string;
        }>;
        relativePresets?: Array<{
            from: number;
            to: number;
            granularity: string;
            name: string;
            localIdentifier?: string;
        }>;
    };
}

/**
 * Tiger-specific dashboard attribute filter config
 * @public
 */
export interface ITigerDashboardAttributeFilterConfig {
    localIdentifier: string;
    displayAsLabel?: ObjRef;
    title?: string;
    mode?: "active" | "readonly" | "hidden";
    filterElementsBy?: Array<{
        filterLocalIdentifier: string;
        over: {
            attributes: ObjRef[];
        };
    }>;
    selectionMode?: "single" | "multi";
}

/**
 * Tiger-specific dashboard filter group
 * @public
 */
export interface ITigerDashboardFilterGroup {
    title: string;
    localIdentifier?: string;
    filters: Array<{
        filterLocalIdentifier: string;
    }>;
}

/**
 * Tiger-specific dashboard filter groups config
 * @public
 */
export interface ITigerDashboardFilterGroupsConfig {
    groups: ITigerDashboardFilterGroup[];
}

//
// =====================================================================================================================
// Dashboard Filter Context Types
// =====================================================================================================================
//

/**
 * Tiger-specific dashboard attribute filter parent
 * @public
 */
export interface ITigerDashboardAttributeFilterParent {
    filterLocalIdentifier: string;
    over: {
        attributes: ObjRef[];
    };
}

/**
 * Tiger-specific dashboard attribute filter by date
 * @public
 */
export interface ITigerDashboardAttributeFilterByDate {
    filterLocalIdentifier: string;
    isCommonDate: boolean;
}

/**
 * Tiger-specific dashboard attribute filter
 * @public
 */
export interface ITigerDashboardAttributeFilter {
    attributeFilter: {
        displayForm: ObjRef;
        negativeSelection: boolean;
        attributeElements: ITigerAttributeElements;
        localIdentifier?: string;
        filterElementsBy?: ITigerDashboardAttributeFilterParent[];
        filterElementsByDate?: ITigerDashboardAttributeFilterByDate[];
        validateElementsBy?: ObjRef[];
        title?: string;
        selectionMode?: "single" | "multi";
    };
}

/**
 * Tiger-specific dashboard date filter
 * @public
 */
export interface ITigerDashboardDateFilter {
    dateFilter: {
        type: "relative" | "absolute";
        granularity: DateFilterGranularity;
        from?: string | number;
        to?: string | number;
        dataSet?: ObjRef;
        attribute?: ObjRef;
        localIdentifier?: string;
    };
}

/**
 * Tiger-specific filter context item
 * @public
 */
export type ITigerFilterContextItem = DashboardFilter;

//
// =====================================================================================================================
// Dashboard Tab Types
// =====================================================================================================================
//

/**
 * Tiger-specific dashboard tab
 * @public
 */
export interface ITigerDashboardTab {
    localIdentifier: string;
    title: string;
    layout: ITigerDashboardLayout;
    filterContextRef: ObjRef;
    dateFilterConfig?: ITigerDashboardDateFilterConfig;
    dateFilterConfigs?: Array<{
        dateDataSet: ObjRef;
        config: ITigerDashboardDateFilterConfig;
    }>;
    attributeFilterConfigs?: ITigerDashboardAttributeFilterConfig[];
    filterGroupsConfig?: ITigerDashboardFilterGroupsConfig;
}
