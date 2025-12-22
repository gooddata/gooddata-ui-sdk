// (C) 2025 GoodData Corporation

import { type IPreparedExecution } from "@gooddata/sdk-backend-spi";
import { newBucket } from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";

import { isClusteringAllowed } from "./clustering/clustering.js";
import { getPushpinColorStrategy } from "./coloring/colorStrategy.js";
import { transformPushpinData } from "./data/transformation.js";
import { UNCLUSTER_FILTER } from "./layers.js";
import { getPushpinLayerIds, removePushpinLayer, syncPushpinLayerToMap } from "./operations.js";
import { createPushpinDataSource } from "./source.js";
import { createPushpinTooltipConfig } from "./tooltip/tooltipManagement.js";
import { calculateViewport } from "../../map/viewport/viewportCalculation.js";
import type { IGeoLngLat } from "../../types/common/coordinates.js";
import type { IGeoPushpinChartNextConfig } from "../../types/config/pushpinChart.js";
import type { IPushpinGeoData } from "../../types/geoData/pushpin.js";
import type { IGeoLayerPushpin } from "../../types/layers/index.js";
import type { IMapViewport } from "../../types/map/provider.js";
import { getGeoHeaderStrings } from "../../utils/geoHeaders.js";
import { computeLegend } from "../common/computeLegend.js";
import { getGeoChartDimensions } from "../common/dimensions.js";
import { createLayerInsight, sanitizeGlobalFilters } from "../execution/layerInsightFactory.js";
import type { IGeoAdapterContext, IGeoLayerAdapter, IPushpinLayerOutput } from "../registry/adapterTypes.js";

function getValidLocations(locations: Array<IGeoLngLat | null | undefined>): IGeoLngLat[] {
    return locations.filter(
        (coords): coords is IGeoLngLat =>
            coords !== null &&
            coords !== undefined &&
            Number.isFinite(coords.lat) &&
            Number.isFinite(coords.lng),
    );
}

function computeInitialViewport(
    geoData: IPushpinGeoData,
    config?: IGeoPushpinChartNextConfig,
): Partial<IMapViewport> | null {
    if (!config || !geoData.location?.data) {
        return null;
    }

    const validLocations = getValidLocations(geoData.location.data);
    if (validLocations.length === 0) {
        return null;
    }

    return calculateViewport(validLocations, config);
}

function createExecution(layer: IGeoLayerPushpin, context: IGeoAdapterContext): IPreparedExecution {
    const { backend, workspace, config, execConfig, globalFilters, executionFactory } = context;
    const { latitude, longitude, size, color, segmentBy, filters = [], sortBy = [] } = layer;
    const { tooltipText } = config ?? {};

    const buckets = [];

    // latitude and longitude are required for pushpin layers
    buckets.push(newBucket(BucketNames.LATITUDE, latitude));
    buckets.push(newBucket(BucketNames.LONGITUDE, longitude));

    if (size) {
        buckets.push(newBucket(BucketNames.SIZE, size));
    }
    if (color) {
        buckets.push(newBucket(BucketNames.COLOR, color));
    }
    if (segmentBy) {
        buckets.push(newBucket(BucketNames.SEGMENT, segmentBy));
    }
    if (tooltipText) {
        buckets.push(newBucket(BucketNames.TOOLTIP_TEXT, tooltipText));
    }

    const layerInsight = createLayerInsight({
        buckets,
        layerName: layer.name ?? layer.id,
        filters,
        sortBy,
    });
    const factory = executionFactory ?? backend.workspace(workspace).execution();
    const mergedGlobalFilters = sanitizeGlobalFilters(globalFilters);
    let execution = factory
        .forInsight(layerInsight, mergedGlobalFilters)
        .withDimensions(getGeoChartDimensions);

    if (execConfig) {
        execution = execution.withExecConfig(execConfig);
    }

    return execution;
}

export const pushpinAdapter: IGeoLayerAdapter<IGeoLayerPushpin, IPushpinLayerOutput> = {
    type: "pushpin",

    buildExecution(layer, context): IPreparedExecution {
        return createExecution(layer, context);
    },

    async prepareLayer(_layer, dataView, context): Promise<IPushpinLayerOutput | null> {
        if (!context.intl) {
            throw new Error("prepareLayer requires intl in adapter context");
        }
        const { emptyHeaderString, nullHeaderString } = getGeoHeaderStrings(context.intl);
        const geoData = transformPushpinData(dataView, emptyHeaderString, nullHeaderString);

        if (!geoData?.location) {
            return null;
        }

        const { colorPalette = [], colorMapping = [] } = context;
        const colorStrategy = getPushpinColorStrategy(colorPalette, colorMapping, geoData, dataView);

        // Get pushpin-specific config with defaults
        const pushpinConfig: IGeoPushpinChartNextConfig = {
            ...context.config,
            points: context.config?.points,
        };
        const hasClustering = isClusteringAllowed(geoData, pushpinConfig.points?.groupNearbyPoints);

        // Create complete source with all features and styling
        const source = createPushpinDataSource({
            geoData,
            colorStrategy,
            config: pushpinConfig,
            hasClustering,
        });

        const legend = computeLegend(geoData, colorStrategy, {
            layerType: "pushpin",
            hasSizeData: Boolean(geoData.size),
        });
        const initialViewport = computeInitialViewport(geoData, pushpinConfig);

        return { source, legend, geoData, colorStrategy, initialViewport };
    },

    syncToMap(layer, map, output, context): void {
        if (!output.geoData) {
            removePushpinLayer(map, layer.id);
            return;
        }

        const config = context.config ?? {};
        // Use pre-computed source from output - no transformation needed
        syncPushpinLayerToMap(map, layer.id, output.source, output.geoData, config);
    },

    removeFromMap(layer, map): void {
        removePushpinLayer(map, layer.id);
    },

    getTooltipConfig(layer, _output, context, { tooltip, drillablePredicates }) {
        if (!tooltip || !context.intl) {
            return undefined;
        }

        const config = context.config ?? {};
        const ids = getPushpinLayerIds(layer.id);
        const layerIds = [ids.pointLayerId, ids.unclusterLayerId].filter(Boolean);

        if (layerIds.length === 0) {
            return undefined;
        }

        return createPushpinTooltipConfig(tooltip, config, drillablePredicates, context.intl, layerIds);
    },

    getMapLibreLayerIds(layer) {
        const ids = getPushpinLayerIds(layer.id);
        return [ids.pointLayerId, ids.clusterLayerId, ids.clusterLabelsLayerId, ids.unclusterLayerId];
    },

    getFilterableLayerIds(layer) {
        const ids = getPushpinLayerIds(layer.id);
        // Return both point layer (non-clustered mode) and uncluster layer (clustered mode)
        // Only one will exist at a time based on clustering config
        // setLayerFilter safely handles non-existent layers
        return [ids.pointLayerId, ids.unclusterLayerId];
    },

    getFilterableLayers(layer) {
        const ids = getPushpinLayerIds(layer.id);
        // Return both point layer (non-clustered mode) and uncluster layer (clustered mode)
        // with their respective base filters. Only one will exist at a time.
        return [
            // Non-clustered mode: point layer has no base filter
            { layerId: ids.pointLayerId, baseFilter: undefined },
            // Clustered mode: uncluster layer has base filter for unclustered points
            { layerId: ids.unclusterLayerId, baseFilter: UNCLUSTER_FILTER },
        ];
    },
};
