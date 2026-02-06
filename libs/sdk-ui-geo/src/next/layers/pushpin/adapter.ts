// (C) 2025-2026 GoodData Corporation

import { type IPreparedExecution } from "@gooddata/sdk-backend-spi";
import {
    type IAttribute,
    attributeDisplayFormRef,
    isIdentifierRef,
    isUriRef,
    newBucket,
} from "@gooddata/sdk-model";
import { BucketNames } from "@gooddata/sdk-ui";

import { isClusteringAllowed } from "./clustering/clustering.js";
import { getPushpinColorStrategy } from "./coloring/colorStrategy.js";
import { transformPushpinData } from "./data/transformation.js";
import { UNCLUSTER_FILTER } from "./layers.js";
import { getPushpinLayerIds, removePushpinLayer, syncPushpinLayerToMap } from "./operations.js";
import { applyCurrentColorsToPushpinOutputSource, createPushpinDataSource } from "./source.js";
import { createPushpinTooltipConfig } from "./tooltip/tooltipManagement.js";
import { calculateViewport } from "../../map/viewport/viewportCalculation.js";
import type { IGeoLngLat } from "../../types/common/coordinates.js";
import type { IGeoPushpinChartConfig } from "../../types/config/pushpinChart.js";
import type { IPushpinGeoData } from "../../types/geoData/pushpin.js";
import type { IGeoLayerPushpin } from "../../types/layers/index.js";
import type { IMapViewport } from "../../types/map/provider.js";
import { getGeoHeaderStrings } from "../../utils/geoHeaders.js";
import { getHeaderPredicateFingerprint } from "../../utils/predicateFingerprint.js";
import { computeLegend } from "../common/computeLegend.js";
import { getGeoChartDimensions } from "../common/dimensions.js";
import { canSetGeoJsonSourceData, trySetGeoJsonSourceData } from "../common/layerOps.js";
import { createLayerInsight, sanitizeGlobalFilters } from "../execution/layerInsightFactory.js";
import { prepareExecutionWithTooltipText } from "../execution/prepareTooltipExecution.js";
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

function computeInitialViewport(geoData: IPushpinGeoData): Partial<IMapViewport> | null {
    if (!geoData.location?.data) {
        return null;
    }

    const validLocations = getValidLocations(geoData.location.data);
    if (validLocations.length === 0) {
        return null;
    }

    // IMPORTANT: this must stay *data-derived* (i.e. independent of config).
    // If presets/center influenced this value, then switching from a preset -> "auto" would
    // keep using the preset viewport because "auto" falls back to this per-layer hint.
    const dataViewportConfig: IGeoPushpinChartConfig = { viewport: { area: "auto" } };
    return calculateViewport(validLocations, dataViewportConfig);
}

function getDisplayFormId(attribute?: IAttribute): string | undefined {
    if (!attribute) {
        return undefined;
    }

    const ref = attributeDisplayFormRef(attribute);
    if (isIdentifierRef(ref)) {
        return ref.identifier;
    }
    if (isUriRef(ref)) {
        return ref.uri;
    }
    return undefined;
}

function createPushpinConfig(context: IGeoAdapterContext): IGeoPushpinChartConfig {
    return {
        ...context.config,
        points: context.config?.points,
    };
}

function createPushpinTooltipAttrIds(layer: IGeoLayerPushpin): {
    locationName?: string;
    segment?: string;
} {
    return {
        locationName: getDisplayFormId(layer.tooltipText),
        segment: getDisplayFormId(layer.segmentBy),
    };
}

function createPushpinSource(
    layer: IGeoLayerPushpin,
    geoData: IPushpinGeoData,
    colorStrategy: ReturnType<typeof getPushpinColorStrategy>,
    context: IGeoAdapterContext,
) {
    const config = createPushpinConfig(context);
    const hasClustering = isClusteringAllowed(geoData, config.points?.groupNearbyPoints);

    return {
        config,
        source: createPushpinDataSource({
            geoData,
            colorStrategy,
            config,
            hasClustering,
            tooltipAttrIds: createPushpinTooltipAttrIds(layer),
        }),
    };
}

function createExecution(layer: IGeoLayerPushpin, context: IGeoAdapterContext): IPreparedExecution {
    const { backend, workspace, execConfig, globalFilters, executionFactory } = context;
    const { latitude, longitude, size, color, segmentBy, filters = [], sortBy = [], tooltipText } = layer;

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

    async prepareExecution(
        layer: IGeoLayerPushpin,
        context: IGeoAdapterContext,
        execution: IPreparedExecution,
    ): Promise<IPreparedExecution> {
        return prepareExecutionWithTooltipText(context, execution, layer.latitude);
    },

    async prepareLayer(layer, dataView, context): Promise<IPushpinLayerOutput | null> {
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
        const { source } = createPushpinSource(layer, geoData, colorStrategy, context);

        const legend = computeLegend(geoData, colorStrategy, {
            layerType: "pushpin",
            hasSizeData: Boolean(geoData.size),
        });
        const initialViewport = computeInitialViewport(geoData);

        return Promise.resolve({ source, legend, geoData, colorStrategy, initialViewport });
    },

    syncToMap(layer, map, output, dataView, context): void {
        if (!output.geoData) {
            removePushpinLayer(map, layer.id);
            return;
        }

        // Init/repair path: remove+add semantics (can recreate layers & sources).
        const { colorPalette = [], colorMapping = [] } = context;
        const colorStrategy = getPushpinColorStrategy(colorPalette, colorMapping, output.geoData, dataView);
        const { config, source } = createPushpinSource(layer, output.geoData, colorStrategy, context);
        syncPushpinLayerToMap(map, layer.id, source, output.geoData, config);
    },

    updateOnMap(layer, map, output, dataView, context): void {
        if (!output.geoData) {
            removePushpinLayer(map, layer.id);
            return;
        }

        // Update path: in-place GeoJSON data update (no remove+add = no flicker).
        const ids = getPushpinLayerIds(layer.id);
        if (!canSetGeoJsonSourceData(map, ids.sourceId)) {
            return;
        }

        const nextSource = applyCurrentColorsToPushpinOutputSource(output, dataView, context);
        trySetGeoJsonSourceData(map, ids.sourceId, nextSource.data);
    },

    getMapSyncKey(layer, context): string {
        // Only include settings configurable from AD that affect MapLibre source/feature props.
        const points = context.config?.points;
        return [
            "pushpin",
            layer.id,
            "points",
            String(points?.groupNearbyPoints),
            String(points?.minSize),
            String(points?.maxSize),
        ].join(":");
    },

    getMapUpdateKey(layer, context): string {
        const palette = context.colorPalette ?? [];
        const mapping = context.colorMapping ?? [];
        // Mapping predicates are not always derived from stable ids (can be user-provided functions),
        // so include their fingerprint to ensure recoloring is triggered when predicate changes.
        const paletteKey = palette.map((p) => `${p.guid}:${JSON.stringify(p.fill)}`).join("|");
        const mappingKey = mapping
            .map((m) => `${getHeaderPredicateFingerprint(m.predicate)}:${JSON.stringify(m.color)}`)
            .join("|");
        return ["pushpin", layer.id, "colors", paletteKey, mappingKey].join(":");
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
