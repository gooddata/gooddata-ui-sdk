// (C) 2025-2026 GoodData Corporation

import { type IPreparedExecution } from "@gooddata/sdk-backend-spi";
import { type IAttribute, type IGeoJsonFeature, newBucket } from "@gooddata/sdk-model";
import { BucketNames, type DataViewFacade } from "@gooddata/sdk-ui";

import { deriveCollectionBoundingBox } from "./boundingBox.js";
import { getAreaColorStrategy } from "./coloring/colorStrategy.js";
import { transformAreaData } from "./data/transformation.js";
import { getAreaLayerIds, removeAreaLayer, syncAreaLayerToMap } from "./operations.js";
import { createAreaDataSource } from "./source.js";
import { createAreaTooltipConfig } from "./tooltip/tooltipManagement.js";
import { bboxToViewport } from "../../map/viewport/viewportCalculation.js";
import { type IGeoAreaChartConfig } from "../../types/config/areaChart.js";
import { type IGeoLayerArea } from "../../types/layers/index.js";
import { type IGeoCollectionMetadata, getLocationCollectionMetadata } from "../../utils/geoCollection.js";
import { getGeoHeaderStrings } from "../../utils/geoHeaders.js";
import { computeLegend } from "../common/computeLegend.js";
import { getGeoChartDimensions } from "../common/dimensions.js";
import { createLayerInsight, sanitizeGlobalFilters } from "../execution/layerInsightFactory.js";
import {
    type IAreaLayerOutput,
    type IGeoAdapterContext,
    type IGeoLayerAdapter,
} from "../registry/adapterTypes.js";

const COLLECTION_OVERRIDES: Record<string, { collectionId?: string }> = {
    region: { collectionId: "regions" },
};

function normalizeCollectionId(collectionId: string): string {
    return COLLECTION_OVERRIDES[collectionId]?.collectionId ?? collectionId;
}

function createExecution(layer: IGeoLayerArea, context: IGeoAdapterContext): IPreparedExecution {
    const { backend, workspace, config, execConfig, globalFilters, executionFactory } = context;
    const { area, color, segmentBy, filters = [], sortBy = [], tooltipText: layerTooltipText } = layer;
    const tooltipText = layerTooltipText ?? config?.tooltipText;

    const buckets = [];
    if (area) {
        buckets.push(newBucket(BucketNames.AREA, area));
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

function resolveCollectionMetadata(dataView: DataViewFacade): IGeoCollectionMetadata | undefined {
    // First try to get metadata from execution result
    const metadataFromExecution = getLocationCollectionMetadata(dataView);
    if (metadataFromExecution) {
        return {
            ...metadataFromExecution,
            collectionId: normalizeCollectionId(metadataFromExecution.collectionId),
        };
    }
    return undefined;
}

async function fetchAreaFeatures(
    dataView: DataViewFacade,
    areaAttribute: IAttribute,
    metadata: IGeoCollectionMetadata,
): Promise<IGeoJsonFeature[]> {
    try {
        const result = await dataView.getCollectionItemsForAttribute(areaAttribute, {
            collectionId: metadata.collectionId,
        });
        return result?.features ?? [];
    } catch {
        return [];
    }
}

export const areaAdapter: IGeoLayerAdapter<IGeoLayerArea, IAreaLayerOutput> = {
    type: "area",

    buildExecution(layer, context): IPreparedExecution {
        return createExecution(layer, context);
    },

    async prepareLayer(layer, dataView, context): Promise<IAreaLayerOutput | null> {
        if (!context.intl) {
            throw new Error("prepareLayer requires intl in adapter context");
        }
        const { emptyHeaderString, nullHeaderString } = getGeoHeaderStrings(context.intl);
        const geoData = transformAreaData(dataView, emptyHeaderString, nullHeaderString);

        if (!geoData?.area) {
            return null;
        }

        const { colorPalette = [], colorMapping = [] } = context;
        const colorStrategy = getAreaColorStrategy(colorPalette, colorMapping, geoData, dataView);

        // Resolve collection metadata
        const metadata = resolveCollectionMetadata(dataView);

        // Fetch boundary features if we have metadata
        let boundaryFeatures: IGeoJsonFeature[] = [];
        if (metadata && layer.area) {
            boundaryFeatures = await fetchAreaFeatures(dataView, layer.area, metadata);
        }

        // Get area-specific config with defaults
        const areaConfig: IGeoAreaChartConfig = {
            ...context.config,
        };

        // Create complete source with all features and styling
        // Boundaries are passed directly - no need to store in geoData
        const source = createAreaDataSource({
            geoData,
            colorStrategy,
            config: areaConfig,
            features: boundaryFeatures,
        });
        const legend = computeLegend(geoData, colorStrategy, {
            layerType: "area",
            hasSizeData: false,
        });

        // Calculate initial viewport from boundary features
        const bbox = deriveCollectionBoundingBox(boundaryFeatures);
        const initialViewport = bboxToViewport(bbox);

        return { source, legend, geoData, colorStrategy, initialViewport };
    },

    syncToMap(layer, map, output, context): void {
        if (!output.geoData) {
            removeAreaLayer(map, layer.id);
            return;
        }

        const config = context.config ?? {};
        // Use pre-computed source from output - no transformation needed
        syncAreaLayerToMap(map, layer.id, output.source, config);
    },

    removeFromMap(layer, map): void {
        removeAreaLayer(map, layer.id);
    },

    getTooltipConfig(layer, _output, context, { tooltip, drillablePredicates }) {
        if (!tooltip || !context.intl) {
            return undefined;
        }

        const config = context.config ?? {};
        const ids = getAreaLayerIds(layer.id);
        const layerIds = [ids.fillLayerId, ids.outlineLayerId];

        return createAreaTooltipConfig(tooltip, config, drillablePredicates, context.intl, layerIds);
    },

    getMapLibreLayerIds(layer) {
        const ids = getAreaLayerIds(layer.id);
        return [ids.fillLayerId, ids.outlineLayerId];
    },

    getFilterableLayerIds(layer) {
        const ids = getAreaLayerIds(layer.id);
        // Both fill and outline layers support segment filtering
        return [ids.fillLayerId, ids.outlineLayerId];
    },

    getFilterableLayers(layer) {
        const ids = getAreaLayerIds(layer.id);
        // Area layers have no base filters - segment filter is the only filter
        return [
            { layerId: ids.fillLayerId, baseFilter: undefined },
            { layerId: ids.outlineLayerId, baseFilter: undefined },
        ];
    },
};
