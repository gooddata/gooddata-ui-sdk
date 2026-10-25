// (C) 2007-2026 GoodData Corporation

import { createSelector } from "reselect";

import { type IAvailableSortsGroup } from "@gooddata/sdk-ui-ext/internal";

import { getDateFormatConfig, getFeatureFlags } from "../selectors/feature_flag_selector.js";
import { getBucketsMeta } from "../services/buckets_service.js";
import { PluggableVisualizationService } from "../services/pluggable_visualization_service.js";
import { isChartFillEnabled } from "../services/reference_point_service.js";
import { getColorPalette } from "../store/app_context/app_context_selectors.js";
import { getAppliedSort, getSortConfig } from "../store/chart_sort/chart_sort_selector.js";
import { getDrillableItems } from "../store/drillable_items/drillable_items_selectors.js";
import {
    getExtendedReferencePoint,
    getReferencePoint,
} from "../store/reference_point/reference_point_selectors.js";
import { type IReferencePointState } from "../store/reference_point/reference_point_state.js";

import { getAgGridToken, getMapboxToken, getMaxZoomLevel, getSeparators } from "./bootstrap_selector.js";
import { canApplyCustomSort } from "./chart_sort_selectors.js";
import { getExecutionConfig } from "./execution_config_selector.js";
import { getInsightWithBucketsViaMd, getVisualizationClass } from "./insight_selectors.js";
import { getLocale } from "./intl_selector.js";
import { isMdObjectValidSelector } from "./metadata_object_selector.js";
import { workspacePermissions } from "./permissions_selector.js";
import { displayRecommendationBlockSelector } from "./recommendations_selector.js";
import { getLastSavedReportVisClassUrl } from "./report_selector.js";
import { getSourceInsightId } from "./route_selector.js";
import { VisualizationPropertiesSelectors } from "./visualization_properties_selector.js";

const getProperties = VisualizationPropertiesSelectors.getProperties;

/**
 * When switching between viz types, we dont know if target viz. supports custom sort, so we decide only based on FF.
 * But if keeping the viz. type and changing only buckets we want to use info about custom sort support
 */
const shouldApplyCustomSortOnReferencePoint = createSelector(
    getExtendedReferencePoint,
    canApplyCustomSort,
    (extendedReferencePoint, canApplySort) => {
        // "has a pluggable visualization answered yet" — an EMPTY object counts as not answered,
        const isExtendedReferencePointDefined =
            !!extendedReferencePoint && Object.keys(extendedReferencePoint).length > 0;
        return isExtendedReferencePointDefined ? canApplySort : true;
    },
);

/**
 * The reference point as the pluggable visualization receives it (`props.referencePoint`) — the
 * stored subtree plus the sort configuration the chart-sort feature grafts on. No defensive copy is
 * made here: every pluggable visualization `cloneDeep`s the reference point on entry.
 */
export interface IDecoratedReferencePoint extends IReferencePointState {
    availableSorts?: IAvailableSortsGroup[];
}

const getReferencePointWithProperties = createSelector(
    getReferencePoint,
    getProperties,
    getAppliedSort,
    getSortConfig,
    shouldApplyCustomSortOnReferencePoint,
    (
        referencePoint,
        properties,
        appliedSort,
        sortConfig,
        applyCustomSortOnReferencePoint,
    ): IDecoratedReferencePoint => {
        if (applyCustomSortOnReferencePoint) {
            return {
                ...referencePoint,
                properties: { ...properties, sortItems: appliedSort },
                availableSorts: sortConfig.availableSorts,
            };
        }
        return { ...referencePoint, properties };
    },
);

/**
 * EXPORTED for its own suite (selectors/test/report_visualization_selector.test.ts): this is the
 * value every pluggable visualization receives as `props.referencePoint`. Driving it through
 * `reportVisualizationSelector` would mean seeding a full insight (that selector invariants on a
 * selected visualization class), which is a fixture, not a contract.
 */
export const getDecoratedReferencePoint = createSelector(
    getReferencePointWithProperties,
    getBucketsMeta,

    (referencePoint, bucketsMeta): IDecoratedReferencePoint => {
        // set flag autoCreated on filter when it was autoCreated and is not modified
        // such filter can be removed by vis. when corresponding attribute is not used in buckets
        const filters = referencePoint.filters;
        if (!filters) {
            return referencePoint;
        }
        return {
            ...referencePoint,
            filters: {
                ...filters,
                items: filters.items.map((filter) => ({
                    ...filter,
                    autoCreated:
                        !!bucketsMeta?.autoCreated?.[filter.attribute] &&
                        !bucketsMeta?.modified?.[filter.attribute],
                })),
            },
        };
    },
);

export const getConfig = createSelector(
    getSeparators,
    getColorPalette,
    getMapboxToken,
    getAgGridToken,
    getMaxZoomLevel,
    (separators, colorPalette, mapboxToken, agGridToken, maxZoomLevel) => {
        const separatorsProp = separators ? { separators } : {};
        const colorPaletteProp = colorPalette ? { colorPalette } : {};
        const mapboxTokenProp = mapboxToken ? { mapboxToken } : {};
        const agGridTokenProp = agGridToken ? { agGridToken } : {};
        // Explicit undefined check - null is a meaningful value that clears the zoom limit
        const maxZoomLevelProp = typeof maxZoomLevel === "undefined" ? {} : { maxZoomLevel };
        return {
            ...mapboxTokenProp,
            ...agGridTokenProp,
            ...separatorsProp,
            ...colorPaletteProp,
            ...maxZoomLevelProp,
        };
    },
);

export const reportVisualizationSelector = createSelector(
    [
        displayRecommendationBlockSelector,
        getDrillableItems,
        getDecoratedReferencePoint,
        PluggableVisualizationService.getNewDerivedBucketItems,
        getInsightWithBucketsViaMd,
        getLocale,
        getDateFormatConfig,
        isMdObjectValidSelector,
        getVisualizationClass,
        getLastSavedReportVisClassUrl,
        VisualizationPropertiesSelectors.getExtendedReferencePointProperties,
        VisualizationPropertiesSelectors.getPropertiesMeta,
        getFeatureFlags,
        getConfig,
        getExecutionConfig,
        getSourceInsightId,
        isChartFillEnabled,
        workspacePermissions,
    ],
    (
        displayRecommendationBlock,
        drillableItems,
        decoratedReferencePoint,
        newDerivedBucketItems,
        insight,
        locale,
        dateFormat,
        isMdObjectValid,
        visualizationClass,
        lastSavedVisClassUrl,
        visualizationProperties,
        visualizationPropertiesMeta,
        featureFlags,
        config,
        executionConfig,
        sourceInsightId,
        supportsChartFill,
        permissions,
    ) => {
        return {
            isNarrow: displayRecommendationBlock,
            drillableItems,
            referencePoint: decoratedReferencePoint,
            newDerivedBucketItems,
            insight,
            locale,
            dateFormat,
            isMdObjectValid,
            visualizationClass,
            lastSavedVisClassUrl,
            visualizationProperties,
            visualizationPropertiesMeta,
            featureFlags: {
                ...featureFlags,
                enableHighchartsAccessibility: false, // Disable Highcharts accessibility features in AD
            },
            permissions,
            config,
            executionConfig,
            sourceInsightId,
            supportsChartFill,
        };
    },
);
