// (C) 2020-2026 GoodData Corporation

import { cloneDeep } from "lodash-es";

import {
    type IAttribute,
    type IAttributeOrMeasure,
    type IBucket,
    type IInsightDefinition,
    type VisualizationProperties,
    attributeDisplayFormRef,
    bucketItems,
    bucketsFind,
    isAttribute,
    isUriRef,
    isVirtualArithmeticMeasure,
    newInsightDefinition,
} from "@gooddata/sdk-model";
import { type IGeoLayer } from "@gooddata/sdk-ui-geo";
import { geoLayersToInsightLayers } from "@gooddata/sdk-ui-geo/internal";

import { type ChartInteractions } from "./backendWithCapturing.js";
import { chartConfigToVisProperties, geoChartConfigToVisProperties } from "./chartConfigToVisProps.js";
import { geoExecutionToInsightBuckets } from "./executionToInsightBuckets.js";
import { pivotConfigToVisProperties } from "./pivotConfigToVisProps.js";

function resolveGeoChartUri(interactions?: ChartInteractions): string {
    const explicitType = interactions?.effectiveProps?.type;
    const primaryLayerType = interactions?.effectiveProps?.layers?.[0]?.type;
    const resolvedType = explicitType ?? primaryLayerType;

    if (resolvedType === "area") {
        return "local:choropleth";
    }

    // Align with GeoChart default type fallback.
    return "local:pushpin";
}

function visNameToUri(name: string, interactions?: ChartInteractions): string {
    if (name === "GeoChart") {
        return resolveGeoChartUri(interactions);
    }

    if (name === "PivotTable") {
        return "local:table";
    } else if (name === "PivotTableNext") {
        return "local:table";
    } else if (name === "ComboChart") {
        return "local:combo2";
    } else if (name === "GeoPushpinChart") {
        return "local:pushpin";
    } else if (name === "GeoAreaChart") {
        return "local:choropleth";
    }

    const simpleName = name.replace("Chart", "").replace("Plot", "").toLowerCase();

    return `local:${simpleName}`;
}

/*
 * This code is here because of flaws in design. If you find yourself in need to add another IF here to support
 * your fancy new feature, then your design is also flawed.
 *
 * It would be best, if the properties worked 'simply' as a storage for the config. that the config can be
 * stored in there as-is (unless of course it has some functions or such, which we would strip or persist
 * in declarative form).
 */
function createVisProperties(visClass: string, config: any) {
    if (visClass === "local:pushpin" || visClass === "local:choropleth") {
        return geoChartConfigToVisProperties(config);
    } else if (visClass === "local:table") {
        return pivotConfigToVisProperties(config);
    } else {
        return chartConfigToVisProperties(config);
    }
}

function removeVirtualMeasures(originalBuckets?: IBucket[]): IBucket[] {
    const buckets: IBucket[] = cloneDeep(originalBuckets ?? []);
    buckets.forEach((bucket) => {
        bucket.items = bucket.items.filter((it) => !isVirtualArithmeticMeasure(it));
    });

    return buckets;
}

/*
 * TODO: Remove this normalization once the pluggable pushpin visualization
 * stores latitude/longitude as proper buckets instead of in controls.
 *
 * Currently the GeoPushpinChart component uses separate "latitude"/"longitude"
 * buckets in its execution (see GeoPushpinChart.tsx getBuckets()), which is the
 * correct approach. However the legacy pluggable pushpin vis expects a single
 * "location" bucket with controls.latitude/controls.longitude selecting display
 * forms. This function bridges that gap for insight recording.
 *
 * To remove this function:
 * 1. Update the pluggable pushpin vis to store lat/lng as buckets (not controls)
 * 2. Remove the "location" bucket indirection from PluggableGeoPushpinChart
 * 3. Delete this function and the normalizeGeoPushpinInsightDefinition call
 *    in createInsightDefinitionForChart
 */
function normalizeGeoPushpinInsightDefinition(
    buckets: IBucket[],
    properties: VisualizationProperties,
): { buckets: IBucket[]; properties: VisualizationProperties } {
    const locationBucket = bucketsFind(buckets, "location");
    if (locationBucket) {
        return { buckets, properties };
    }

    const latitudeBucket = bucketsFind(buckets, "latitude");
    const longitudeBucket = bucketsFind(buckets, "longitude");
    const latitudeItem = latitudeBucket ? bucketItems(latitudeBucket)[0] : undefined;
    const longitudeItem = longitudeBucket ? bucketItems(longitudeBucket)[0] : undefined;

    if (!latitudeItem || !longitudeItem) {
        return { buckets, properties };
    }

    const latitude = getDisplayFormIdentifier(latitudeItem);
    const longitude = getDisplayFormIdentifier(longitudeItem);
    if (!latitude || !longitude) {
        return { buckets, properties };
    }

    const nonCoordinateBuckets = buckets.filter((bucket) => {
        return bucket.localIdentifier !== "latitude" && bucket.localIdentifier !== "longitude";
    });

    const normalizedBuckets: IBucket[] = [
        {
            localIdentifier: "location",
            items: [latitudeItem as IAttribute],
        },
        ...nonCoordinateBuckets,
    ];

    const existingControls = (properties as { controls?: Record<string, unknown> })?.controls;

    return {
        buckets: normalizedBuckets,
        properties: {
            ...properties,
            controls: {
                ...(typeof existingControls === "object" && existingControls ? existingControls : {}),
                latitude,
                longitude,
            },
        },
    };
}

function getDisplayFormIdentifier(item: IAttributeOrMeasure | undefined): string | undefined {
    if (!item || !isAttribute(item)) {
        return undefined;
    }

    const displayFormRef = attributeDisplayFormRef(item);
    return isUriRef(displayFormRef) ? displayFormRef.uri : displayFormRef.identifier;
}

function extractGeoInsightLayers(interactions: ChartInteractions) {
    const layers = interactions?.effectiveProps?.layers;
    if (!Array.isArray(layers) || layers.length <= 1) {
        return [];
    }

    return geoLayersToInsightLayers(layers.slice(1) as IGeoLayer[]);
}

export function createInsightDefinitionForChart(
    name: string,
    scenario: string,
    interactions: ChartInteractions,
): IInsightDefinition {
    const chartConfig: any = interactions.effectiveProps.config;
    const visClassUri = visNameToUri(name, interactions);
    const execution = interactions.normalizationState?.original ?? interactions.triggeredExecution;

    const properties: VisualizationProperties = createVisProperties(visClassUri, chartConfig);

    const isGeoVis = visClassUri === "local:pushpin" || visClassUri === "local:choropleth";
    const baseBuckets = isGeoVis
        ? geoExecutionToInsightBuckets(execution)
        : removeVirtualMeasures(execution?.buckets);
    const { buckets: insightBuckets, properties: normalizedProperties } =
        visClassUri === "local:pushpin"
            ? normalizeGeoPushpinInsightDefinition(baseBuckets, properties)
            : { buckets: baseBuckets, properties };
    const geoInsightLayers = isGeoVis ? extractGeoInsightLayers(interactions) : [];

    return newInsightDefinition(visClassUri, (b) => {
        let builder = b
            .title(`${name} - ${scenario}`)
            .buckets(insightBuckets)
            .sorts(execution?.sortBy ?? [])
            .filters(execution?.filters ?? [])
            .properties(normalizedProperties);

        if (geoInsightLayers.length > 0) {
            builder = builder.layers(geoInsightLayers);
        }

        return builder;
    });
}
