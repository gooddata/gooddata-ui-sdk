// (C) 2007-2026 GoodData Corporation

import { isEmpty, isPlainObject, omit } from "lodash-es";
import { createSelector, createStructuredSelector } from "reselect";

import {
    type IActiveCalendars,
    type IAttributeFilterConfigs,
    type IInsightLayerDefinition,
    type ISortItem,
    type IVisualizationClass,
    type ObjRef,
} from "@gooddata/sdk-model";

import { COMPUTED_ATTRIBUTE, FACT, METRIC } from "../constants/bucket.js";
import { LOCAL_CHOROPLETH, LOCAL_PUSHPIN } from "../constants/visualization_types.js";
import { isArithmeticMeasure, isComputedAttributeItem, isMeasure } from "../models/bucket_item.js";
import { decoratedBuckets } from "../models/decorated_bucket.js";
import { isSupportedDisplayFormType } from "../models/display_form.js";
import { bucketsToMetadata, filtersToMetadata, parametersToMetadata, pickValid } from "../models/metadata.js";
import { BucketItemService } from "../services/bucket_item_service.js";
import {
    getBuckets,
    getBucketsMeta,
    getMeasures,
    getUsedDateDatasets,
    isRenamingBucketItem,
} from "../services/buckets_service.js";
import { DateDatasetsService } from "../services/date_datasets_service.js";
import { getActiveGeoLabelType, isLocationIconEnabled } from "../services/reference_point_service.js";
import {
    getEnabledVisualizationClasses,
    getVisualizationClass,
} from "../services/visualization_class_service.js";
import { isDateBucketItem } from "../store/buckets/helpers/bucket_item_predicates.js";
import { getAppliedSort } from "../store/chart_sort/chart_sort_selector.js";
import { isConfigurationPanelCollapsed } from "../store/configuration_panel/configuration_panel_selectors.js";
import { getDraggedCatalogItem } from "../store/drag_and_drop/dnd_selectors.js";
import {
    getAttributeFilterConfigs,
    getFilterItems,
    getFilterItemsExtended,
    getParameterFilters,
} from "../store/filter_bar/filter_bar_selector.js";
import { FilterBar, type IFilter } from "../store/filter_bar/filter_bar_types.js";
import { type IParameterFilter } from "../store/filter_bar/parameter_filter_types.js";
import { getInsightLayers, getInsightLayersOwner } from "../store/insight/insight_selectors.js";
import { getLastSavedObject } from "../store/report/report_selectors.js";
import { getRouteQuerySourceInsight } from "../store/router/router_selectors.js";
import { type IAppState } from "../store/types.js";
import { getVisualizationClassUrl } from "../store/visualization_classes/visualization_classes_selectors.js";
import {
    type IDecoratedBucket,
    type IDecoratedBucketItem,
    type IDecoratedBucketItems,
    type IDecoratedBuckets,
    type IRawBucketItem,
    type IRawBucketItems,
    type IRawBuckets,
} from "../typings/buckets.js";
import { type IDateDatasets, type IUsedDateDatasets } from "../typings/datasets.js";
import { type IStoredVisualizationProperties } from "../typings/properties.js";
import { type IReportContent } from "../typings/report.js";
import { type ICacheItemDisplayForm } from "../typings/state_objects.js";
import { getMeasuresDescriptions } from "../utils/measure_descriptions.js";

import { supportsAllAttributeValues } from "./backend_capabilities_selector.js";
import { getFormatLocale } from "./bootstrap_selector.js";
import { canApplyCustomSort } from "./chart_sort_selectors.js";
import { getBucketsExtended } from "./extended_reference_point_selector.js";
import {
    enableImprovedMetricDateFilter,
    getActiveCalendars,
    getFeatureFlags,
} from "./feature_flag_selector.js";
import { getIntl } from "./intl_selector.js";
import { getItemCache } from "./item_cache_selector.js";
import {
    getUsedDateDatasetsExtendedSelector,
    selectedDateDatasetsSelector,
} from "./selected_date_datasets_selector.js";
import {
    getReferencePointExtendedBucketsUiConfig,
    isStaticHyperLinkDisplayFormTextEnabled,
    selectAllowsInlineVisualizations,
    selectDisableMeasureFilters,
    selectSupportedInlineVisualizationTypes,
} from "./ui_config_selector.js";
import { VisualizationPropertiesSelectors } from "./visualization_properties_selector.js";

export const getAllMeasures = createSelector(getBuckets, (buckets: IRawBuckets): IRawBucketItems => {
    // `?? []`: flatMap of a missing `items` key would append `undefined` AS AN ITEM
    const measures = buckets.flatMap((bucket) => bucket?.items ?? []).filter(isMeasure);
    return measures as IRawBucketItems;
});

const getSavedInsightIdentifier = (state: IAppState) =>
    getLastSavedObject(state).visualizationObject?.meta?.identifier;
const getRoutedSourceInsightIdentifier = (state: IAppState) => getRouteQuerySourceInsight(state);

const getCurrentInsightIdentifier = createSelector(
    getSavedInsightIdentifier,
    getRoutedSourceInsightIdentifier,
    (savedIdentifier, sourceInsightId): string | undefined => savedIdentifier ?? sourceInsightId,
);

const getCurrentVisualizationUrl = (state: IAppState): string | undefined => getVisualizationClassUrl(state);

const LAYER_SUPPORTED_VISUALIZATIONS = new Set<string>([LOCAL_PUSHPIN, LOCAL_CHOROPLETH]);

/**
 * Gets stored layers from insight.
 * Layers are used for multi-layer geo visualizations.
 * Returns layers only when:
 * 1. The stored owner matches the currently opened insight identifier
 * 2. The current visualization type supports layers (e.g., pushpin)
 * This prevents layers from being persisted when switching to other visualizations.
 */
export const getStoredLayers = createSelector(
    getInsightLayers,
    getInsightLayersOwner,
    getCurrentInsightIdentifier,
    getCurrentVisualizationUrl,
    (layersRaw, layersOwner, currentInsightIdentifier, visualizationUrl): IInsightLayerDefinition[] => {
        if (!layersOwner || layersOwner !== currentInsightIdentifier) {
            return [];
        }

        if (!visualizationUrl || !LAYER_SUPPORTED_VISUALIZATIONS.has(visualizationUrl)) {
            return [];
        }

        return [...layersRaw];
    },
);

export const isArithmeticMeasurePresent = createSelector(getBuckets, (buckets: IRawBuckets): boolean => {
    return buckets.flatMap((bucket) => bucket?.items ?? []).some(isArithmeticMeasure);
});

export const getDecoratedBuckets = createSelector(
    getBuckets,
    getBucketsMeta,
    getItemCache,
    selectedDateDatasetsSelector,
    getReferencePointExtendedBucketsUiConfig,
    getAttributeFilterConfigs,
    getIntl,
    isLocationIconEnabled,
    getActiveGeoLabelType,
    (
        buckets,
        bucketsMeta,
        itemCache,
        selectedDateDatasets,
        uiSettings,
        attributeFilterConfigs,
        intl,
        isLocationIconEnabled,
        geoLabelType,
    ) =>
        decoratedBuckets(
            buckets,
            bucketsMeta,
            itemCache,
            selectedDateDatasets,
            uiSettings,
            attributeFilterConfigs,
            intl,
            isLocationIconEnabled,
            undefined,
            geoLabelType,
        ),
);

export const getDecoratedBucketItems = createSelector(
    getDecoratedBuckets,
    (decoratedBuckets): IDecoratedBucketItems => {
        return decoratedBuckets.flatMap((bucket: IDecoratedBucket) => bucket.items);
    },
);

export const getDecoratedBucketsExtended = createSelector(
    getBuckets,
    getBucketsExtended,
    getBucketsMeta,
    getItemCache,
    selectedDateDatasetsSelector,
    getReferencePointExtendedBucketsUiConfig,
    getAttributeFilterConfigs,
    getIntl,
    isLocationIconEnabled,
    getActiveGeoLabelType,
    getFormatLocale,
    (
        buckets,
        bucketsExtended,
        bucketsMeta,
        itemCache,
        selectedDateDatasets,
        uiSettings,
        attributeFilterConfigs,
        intl,
        isLocationIconEnabled,
        geoLabelType,
        formatLocale,
    ) =>
        decoratedBuckets(
            // `bucketsExtended` is UNDEFINED until a pluggable visualization answers, and that is
            // what selects the regular buckets — an `[]` default on the accessor would be truthy
            // and hide them
            (bucketsExtended || buckets) as IRawBuckets,
            bucketsMeta,
            itemCache,
            selectedDateDatasets,
            uiSettings,
            attributeFilterConfigs,
            intl,
            isLocationIconEnabled,
            formatLocale,
            geoLabelType,
        ),
);

// ReadonlyArray: the item cache's `displayForms` is readonly, and filtering never mutates, so the
// wider parameter costs nothing.
export const filterSupportedDisplayForms = (displayForms: ReadonlyArray<ICacheItemDisplayForm>) =>
    displayForms.filter(isSupportedDisplayFormType);

export const getAttributeIdentifier = (
    _state: IAppState,
    { bucketItem }: { bucketItem: IDecoratedBucketItem },
) => {
    if (!bucketItem) {
        return undefined;
    }

    if (isDateBucketItem(bucketItem.original)) {
        return bucketItem.granularity?.granularity;
    }

    return bucketItem.original?.attribute as string;
};

const getAttributeType = (_state: IAppState, { bucketItem }: { bucketItem: IDecoratedBucketItem }) => {
    if (!bucketItem) {
        return null;
    }

    if (isDateBucketItem(bucketItem.original)) {
        return "date";
    }

    // an attribute item built from a computed attribute is cached in the computed attribute namespace
    return isComputedAttributeItem(bucketItem.original) ? COMPUTED_ATTRIBUTE : "attribute";
};

export const getDisplayFormsForBucketItemSelector = createSelector(
    getItemCache,
    getAttributeIdentifier,
    getAttributeType,
    (itemCache, attributeIdentifier, type): ICacheItemDisplayForm[] => {
        const itemCacheId = type === "date" ? attributeIdentifier : `${type}.${attributeIdentifier}`;
        const displayForms = itemCache?.[itemCacheId]?.displayForms || [];
        return filterSupportedDisplayForms(displayForms);
    },
);

export const propertiesContainTooltipTextSelector = createSelector(
    VisualizationPropertiesSelectors.getExtendedReferencePointProperties,
    (extendedReferencePointProperties) => !!extendedReferencePointProperties?.controls?.["tooltipText"],
);

export const isFiscalCalendarActive = createSelector(
    getActiveCalendars,
    (activeCalendars) => activeCalendars?.fiscal === true,
);

export const isStandardCalendarActive = createSelector(
    getActiveCalendars,
    (activeCalendars) => activeCalendars?.standard !== false,
);

export const bucketsSelector = createStructuredSelector({
    isRenamingBucketItem,
    buckets: getDecoratedBuckets,
    visualizationClass: getVisualizationClass,
    visualizationClasses: getEnabledVisualizationClasses,
    configurationPanelCollapsed: isConfigurationPanelCollapsed,
    isLocationIconEnabled,
    areAllAttributeValuesEnabled: supportsAllAttributeValues,
    displayForms: getDisplayFormsForBucketItemSelector,
    propertiesContainTooltipText: propertiesContainTooltipTextSelector,
    isStaticHyperLinkDisplayFormTextEnabled: isStaticHyperLinkDisplayFormTextEnabled,
    isFiscalCalendarActive,
    isStandardCalendarActive,
});

function constructVisualizationMDObj(
    buckets: IDecoratedBuckets,
    filters: ReadonlyArray<IFilter>,
    parameterFilters: ReadonlyArray<IParameterFilter>,
    attributeFilterConfigs: IAttributeFilterConfigs,
    visualizationClass: IVisualizationClass | null | undefined,
    dateDatasets: IDateDatasets,
    usedDateDatasets: IUsedDateDatasets,
    currentVisualizationProperties: IStoredVisualizationProperties,
    canApplySort: boolean,
    appliedSort: ISortItem[] | undefined,
    activeCalendars: IActiveCalendars | undefined,
    useEmptyValueHandling: boolean,
): IReportContent {
    const dateFilter = filters.find(FilterBar.isDateFilter);
    const dateFilterDateDatasetRef = dateFilter ? dateFilter.dateDatasetRef : undefined; // for PoP measures
    const bucketsMDObj = bucketsToMetadata(buckets, {
        dateDatasets,
        usedDateDatasets,
        dateFilterDateDatasetRef,
        activeCalendars,
    });
    const filtersMDObj = filtersToMetadata(
        filters,
        attributeFilterConfigs,
        dateDatasets,
        useEmptyValueHandling,
    );
    const filtersProp = isEmpty(filtersMDObj) ? {} : { filters: filtersMDObj };

    const parametersMDObj = parametersToMetadata(parameterFilters);
    const parametersProp = isEmpty(parametersMDObj) ? {} : { parameters: parametersMDObj };

    const attributeFilterConfigsProp = isEmpty(attributeFilterConfigs)
        ? {}
        : { attributeFilterConfigs: attributeFilterConfigs };

    // An EMPTY controls bag is dropped; a missing one is left alone (the test is
    // `is(controls, Map())`, true only for a present-and-empty Map).
    const controls = currentVisualizationProperties?.controls;
    const sanitized =
        isPlainObject(controls) && isEmpty(controls)
            ? omit(currentVisualizationProperties, "controls")
            : currentVisualizationProperties;

    // A COPY, deliberately: assigning `sortItems` onto the stored properties would write THROUGH
    // the store-shared reference, and the ERP subtree is not immer-frozen, so it would not even
    // throw. Pinned by "does not mutate the extended reference point properties" in
    // test/buckets_selector.test.ts.
    const sanitizedProperties: IStoredVisualizationProperties = canApplySort
        ? // use even empty sorting to override sort from properties appState
          // sanitization of empty sort done later
          { ...sanitized, sortItems: appliedSort }
        : sanitized;

    const stringifiedProperties =
        sanitizedProperties && !isEmpty(sanitizedProperties) ? JSON.stringify(sanitizedProperties) : null;

    return pickValid({
        buckets: bucketsMDObj,
        ...filtersProp,
        ...parametersProp,
        ...attributeFilterConfigsProp,
        visualizationClass: {
            // optional chaining, not a default parameter: with no visualization classes
            // loaded the domain accessor yields null, which does not trigger a
            // default parameter — `?.` yields undefined here
            uri: visualizationClass?.visualizationClass?.uri,
        },
        properties: stringifiedProperties,
    }) as IReportContent;
}

export const currentReportMDObject = createSelector(
    getDecoratedBuckets,
    getFilterItems,
    getParameterFilters,
    getAttributeFilterConfigs,
    getVisualizationClass,
    DateDatasetsService.getPlainDateDatasets,
    getUsedDateDatasets,
    VisualizationPropertiesSelectors.getExtendedReferencePointProperties,
    canApplyCustomSort,
    getActiveCalendars,
    enableImprovedMetricDateFilter,
    (
        buckets,
        filters,
        parameterFilters,
        attributeFilterConfigs,
        visualizationClass,
        dateDatasets,
        usedDateDatasets,
        currentVisualizationProperties,
        applySort,
        activeCalendars,
        useEmptyValueHandling,
    ) =>
        constructVisualizationMDObj(
            buckets,
            filters,
            parameterFilters,
            attributeFilterConfigs,
            visualizationClass,
            dateDatasets,
            usedDateDatasets,
            currentVisualizationProperties,
            applySort,
            undefined,
            activeCalendars,
            useEmptyValueHandling,
        ),
);

export const currentReportMDObjectExtended = createSelector(
    getDecoratedBucketsExtended,
    getFilterItemsExtended,
    getParameterFilters,
    getAttributeFilterConfigs,
    getVisualizationClass,
    DateDatasetsService.getPlainDateDatasets,
    getUsedDateDatasetsExtendedSelector,
    VisualizationPropertiesSelectors.getExtendedReferencePointProperties,
    canApplyCustomSort,
    getAppliedSort,
    getActiveCalendars,
    enableImprovedMetricDateFilter,
    (
        buckets,
        filtersExtended,
        parameterFilters,
        attributeFilterConfigs,
        visualizationClass,
        dateDatasets,
        usedDateDatasets,
        currentVisualizationProperties,
        applySort,
        appliedSort,
        activeCalendars,
        useEmptyValueHandling,
    ) =>
        constructVisualizationMDObj(
            buckets,
            filtersExtended,
            parameterFilters,
            attributeFilterConfigs,
            visualizationClass,
            dateDatasets,
            usedDateDatasets,
            currentVisualizationProperties,
            applySort,
            appliedSort,
            activeCalendars,
            useEmptyValueHandling,
        ),
);

function isMeasuresBucket(bucket: IDecoratedBucket): boolean {
    const acceptedBucketItemTypes = bucket.accepts;

    return (
        acceptedBucketItemTypes &&
        (acceptedBucketItemTypes.includes(METRIC) || acceptedBucketItemTypes.includes(FACT))
    );
}

function isAtLeastTwoMeasuresInBuckets(state: IAppState): boolean {
    return (getMeasures(state)?.length ?? 0) >= 2;
}

function showAddItemButtonSelector(state: IAppState, props: { bucket: IDecoratedBucket }): boolean {
    return isMeasuresBucket(props.bucket) && isAtLeastTwoMeasuresInBuckets(state);
}

export const bucketContentSelector = createSelector(
    getDraggedCatalogItem,
    showAddItemButtonSelector,
    getFeatureFlags,
    (draggedItem, showAddItemButton, featureFlags) => ({
        isItemDragged: draggedItem !== null,
        showAddItemButton,
        featureFlags,
    }),
);

export const measureBucketItemSelector = createSelector(
    isRenamingBucketItem,
    selectAllowsInlineVisualizations,
    selectSupportedInlineVisualizationTypes,
    selectDisableMeasureFilters,
    (isRenaming, allowMetricVisualizations, supportedMetricVisualizationTypes, disableMeasureFilters) => ({
        isRenamingBucketItem: isRenaming,
        allowMetricVisualizations,
        supportedMetricVisualizationTypes,
        disableMeasureFilters,
    }),
);

export const getBucketItemsSelector = createSelector(getBuckets, (buckets: IRawBuckets): IRawBucketItems =>
    // `?? []` matters: Array.concat(undefined) appends `undefined` AS AN ITEM for a bucket
    // with no `items` key, and every composed selector then trips on it
    buckets.reduce((acc: IRawBucketItems, bucket) => acc.concat(bucket.items ?? []), []),
);

export const getBucketsSelector = createSelector(getBuckets, (buckets: IRawBuckets) => buckets);

export const getMeasureDescriptions = createSelector(
    getBucketsSelector,
    getItemCache,
    getIntl,
    (buckets, itemCache, intl) => getMeasuresDescriptions(buckets, itemCache, intl),
);

export const getAllMeasureBucketItems = createSelector(
    getBucketItemsSelector,
    (bucketItems): IRawBucketItems =>
        bucketItems.filter(
            (bucketItem) =>
                BucketItemService.isMeasureItem(bucketItem) &&
                BucketItemService.isCompleteBucketItem(bucketItem),
        ),
);

export const getAllSlicingAttributeBucketItems = createSelector(
    getBucketItemsSelector,
    (bucketItems): IRawBucketItems =>
        bucketItems.filter(
            (bucketItem) =>
                (BucketItemService.isAttributeItem(bucketItem) || BucketItemService.isDateItem(bucketItem)) &&
                BucketItemService.isCompleteBucketItem(bucketItem),
        ),
);

export const getAttributeBucketItems = createSelector(
    getBucketItemsSelector,
    (bucketItems): IRawBucketItems =>
        bucketItems.filter((bucketItem) => BucketItemService.isAttributeItem(bucketItem)),
);

export const getDateBucketItem = createSelector(getBucketItemsSelector, (bucketItems): IRawBucketItem =>
    bucketItems.find(BucketItemService.isDateItem),
);

export const getDateBucketItems = createSelector(getBucketItemsSelector, (bucketItems): IRawBucketItems =>
    bucketItems.filter(BucketItemService.isDateItem),
);

export const areMeasureFiltersSetUp = createSelector(
    getAllMeasureBucketItems,
    (measureBucketItems): boolean => !!measureBucketItems.find(BucketItemService.hasFiltersSetUp),
);

export const getDateBucketItemDateDatasetRefs = createSelector(
    getDateBucketItems,
    (dateBucketItems: IRawBucketItems): ObjRef[] =>
        dateBucketItems.map((dateBucketItem) => dateBucketItem.dateDatasetRef),
);

export const getExpandedDateLocalId = createSelector(getBucketsMeta, (bucketsMeta) =>
    bucketsMeta?.attributeExpanded ? bucketsMeta?.attributeExpanded : undefined,
);
