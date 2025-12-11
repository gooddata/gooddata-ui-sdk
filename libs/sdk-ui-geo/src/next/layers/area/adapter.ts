// (C) 2025 GoodData Corporation

import { IPreparedExecution } from "@gooddata/sdk-backend-spi";
import { IAttribute, IGeoJsonFeature, newBucket } from "@gooddata/sdk-model";
import { BucketNames, DataViewFacade } from "@gooddata/sdk-ui";

import { deriveCollectionBoundingBox } from "./boundingBox.js";
import { getAreaColorStrategy } from "./coloring/colorStrategy.js";
import { transformAreaData } from "./data/transformation.js";
import { getAreaLayerIds, removeAreaLayer, syncAreaLayerToMap } from "./operations.js";
import { createAreaDataSource } from "./source.js";
import { createAreaTooltipConfig } from "./tooltip/tooltipManagement.js";
import { bboxToViewport } from "../../map/viewport/viewportCalculation.js";
import { IGeoAreaChartConfig } from "../../types/config/areaChart.js";
import { IGeoLayerArea } from "../../types/layers/index.js";
import { IGeoCollectionMetadata, getLocationCollectionMetadata } from "../../utils/geoCollection.js";
import { getGeoHeaderStrings } from "../../utils/geoHeaders.js";
import { computeLegend } from "../common/computeLegend.js";
import { getGeoChartDimensions } from "../common/dimensions.js";
import { IAreaLayerOutput, IGeoAdapterContext, IGeoLayerAdapter } from "../registry/adapterTypes.js";

const COLLECTION_OVERRIDES: Record<string, { collectionId?: string }> = {
    region: { collectionId: "regions" },
};

function normalizeCollectionId(collectionId: string): string {
    return COLLECTION_OVERRIDES[collectionId]?.collectionId ?? collectionId;
}

function createExecution(layer: IGeoLayerArea, context: IGeoAdapterContext): IPreparedExecution {
    const { backend, workspace, config, execConfig } = context;
    const { area, color, segmentBy, filters = [], sortBy = [] } = layer;
    const { tooltipText } = config ?? {};

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

    let execution = backend
        .workspace(workspace)
        .execution()
        .forBuckets(buckets, filters)
        .withSorting(...sortBy)
        .withDimensions(getGeoChartDimensions);

    if (execConfig) {
        execution = execution.withExecConfig(execConfig);
    }

    return execution;
}

async function resolveCollectionMetadata(
    dataView: DataViewFacade,
): Promise<IGeoCollectionMetadata | undefined> {
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
        const metadata = await resolveCollectionMetadata(dataView);

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
};
