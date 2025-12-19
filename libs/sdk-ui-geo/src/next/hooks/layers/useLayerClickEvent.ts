// (C) 2025 GoodData Corporation

import { useEffect } from "react";

import { isAttributeDescriptor, isResultAttributeHeader } from "@gooddata/sdk-model";
import {
    type DataViewFacade,
    type IHeaderPredicate,
    type IMappingHeader,
    type OnFiredDrillEvent,
    getDrillIntersection,
    isSomeHeaderPredicateMatched,
} from "@gooddata/sdk-ui";

import { type IGeoLayerData } from "../../context/GeoLayersContext.js";
import {
    GEO_LAYER_DRILL_ELEMENT,
    GEO_LAYER_DRILL_TYPE,
    MAPLIBRE_LAYER_TYPE_PREFIXES,
} from "../../layers/common/constants.js";
import type { IMapFacade, MapMouseEvent } from "../../layers/common/mapFacade.js";

/**
 * Get the layer data by MapLibre layer ID.
 */
function getClickedLayerByMapLibreLayerId(
    layers: Map<string, IGeoLayerData>,
    mapLibreLayerId: string | undefined,
): IGeoLayerData | undefined {
    if (!mapLibreLayerId) {
        return undefined;
    }
    const clickedLayerEntry = Array.from(layers.entries()).find(([key, layer]) => {
        const prefix = MAPLIBRE_LAYER_TYPE_PREFIXES[layer.layerType];
        const layerId = `${prefix}-${key}`;
        return layerId === mapLibreLayerId;
    });
    return clickedLayerEntry?.[1];
}

/**
 * Build drill headers for a clicked location.
 * Includes attribute headers (excluding tooltip) and measure descriptors.
 */
function getDrillHeaders(
    dataView: DataViewFacade,
    locationIndex: number,
    tooltipIndex: number | undefined,
): IMappingHeader[] {
    const headerItems = dataView.dataView.headerItems;
    const geoAttributesDimensionIndex = dataView.meta().dimensions().length - 1;

    const descriptors = dataView.meta().dimensionItemDescriptors(geoAttributesDimensionIndex);
    const drillHeaders: IMappingHeader[] = [];

    descriptors.forEach((descriptor, attrIndex) => {
        if (isAttributeDescriptor(descriptor)) {
            if (attrIndex === tooltipIndex) {
                return; // Skip tooltip attribute
            }
            const rowHeader = headerItems[geoAttributesDimensionIndex]?.[attrIndex]?.[locationIndex];
            if (rowHeader && isResultAttributeHeader(rowHeader)) {
                drillHeaders.push(rowHeader);
                drillHeaders.push(descriptor);
            }
        }
    });

    // Add measures for measure drilling
    dataView
        .meta()
        .measureDescriptors()
        .forEach((measure) => {
            drillHeaders.push(measure);
        });

    return drillHeaders;
}

/**
 * Hook that handles click events on map layers and fires drill events.
 */
export function useLayerClickEvent(
    map: IMapFacade | null,
    isMapReady: boolean,
    layers: Map<string, IGeoLayerData>,
    drillablePredicates: IHeaderPredicate[],
    onDrill?: OnFiredDrillEvent,
): void {
    useEffect(() => {
        if (!map || !isMapReady || !onDrill) {
            return;
        }

        const handleClick = (e: MapMouseEvent) => {
            const features = map.queryRenderedFeatures(e.point);

            if (features && features.length > 0) {
                const topFeature = features[0];
                const mapLibreLayerId = topFeature.layer?.id;
                const clickedLayer = getClickedLayerByMapLibreLayerId(layers, mapLibreLayerId);
                const locationIndex = topFeature.properties?.["locationIndex"];
                if (!clickedLayer?.dataView || locationIndex === undefined) {
                    return;
                }

                const { dataView, geoData, layerType } = clickedLayer;
                const tooltipIndex = geoData?.tooltipText?.index;
                const drillHeaders = getDrillHeaders(dataView, locationIndex, tooltipIndex);
                if (drillHeaders.length === 0) {
                    return;
                }

                const isDrillable = drillHeaders.some((header) =>
                    isSomeHeaderPredicateMatched(drillablePredicates, header, dataView),
                );
                if (!isDrillable) {
                    return;
                }

                const intersection = getDrillIntersection(drillHeaders);
                const drillEvent = {
                    dataView: dataView.dataView,
                    drillContext: {
                        type: GEO_LAYER_DRILL_TYPE[layerType],
                        element: GEO_LAYER_DRILL_ELEMENT[layerType],
                        intersection,
                    },
                };

                onDrill(drillEvent);
            }
        };

        map.on("click", handleClick);

        return () => {
            map.off("click", handleClick);
        };
    }, [map, isMapReady, layers, drillablePredicates, onDrill]);
}
