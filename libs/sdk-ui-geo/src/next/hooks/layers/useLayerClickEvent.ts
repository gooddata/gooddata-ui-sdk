// (C) 2025-2026 GoodData Corporation

import { useEffect } from "react";

import {
    type AttributeDisplayFormType,
    type IAttributeDescriptor,
    type IResultAttributeHeader,
    isAttributeDescriptor,
    isResultAttributeHeader,
    objRefToString,
} from "@gooddata/sdk-model";
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
    COORDINATE_FORM_TYPES,
    GEO_LAYER_DRILL_ELEMENT,
    GEO_LAYER_DRILL_TYPE,
    MAPLIBRE_LAYER_TYPE_PREFIXES,
} from "../../layers/common/constants.js";
import type { IMapFacade, MapMouseEvent } from "../../layers/common/mapFacade.js";
import type { IParentAttributeInfo } from "../../types/common/drilling.js";

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
 * Check if a display form type is a geo coordinate type.
 */
function isCoordinateFormType(labelType: AttributeDisplayFormType | undefined): boolean {
    return labelType !== undefined && COORDINATE_FORM_TYPES.includes(labelType);
}

/**
 * Extract parent attribute info from a coordinate display form descriptor.
 * Uses primaryLabel as ref if available, otherwise falls back to the descriptor's ref.
 */
function getParentAttributeInfo(descriptor: IAttributeDescriptor): IParentAttributeInfo {
    const { primaryLabel, formOf, ref } = descriptor.attributeHeader;
    return {
        ref: primaryLabel ?? ref,
        name: formOf.name,
        key: primaryLabel ? objRefToString(primaryLabel) : formOf.identifier,
    };
}

function normalizeCoordinateAttribute(
    descriptor: IAttributeDescriptor,
    rowHeader: IResultAttributeHeader,
    parentInfo: IParentAttributeInfo,
): { descriptor: IAttributeDescriptor; rowHeader: IResultAttributeHeader } {
    return {
        descriptor: {
            attributeHeader: {
                ...descriptor.attributeHeader,
                ref: parentInfo.ref,
                name: parentInfo.name,
            },
        },
        rowHeader: {
            ...rowHeader,
            attributeHeaderItem: {
                ...rowHeader.attributeHeaderItem,
                name: rowHeader.attributeHeaderItem.name, // Keep the value (e.g., "New York")
            },
        },
    };
}

/**
 * Build drill headers for a clicked location.
 * Includes attribute headers (excluding auxiliary geo attributes) and measure descriptors.
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

    // Track processed coordinate attributes by their parent attribute key
    // This ensures we only include one coordinate attribute per parent (e.g., City, not City lat + City lon)
    const processedCoordinateParents = new Set<string>();

    descriptors.forEach((descriptor, attrIndex) => {
        if (isAttributeDescriptor(descriptor)) {
            if (attrIndex === tooltipIndex) {
                return; // Skip tooltip attribute
            }

            const rowHeader = headerItems[geoAttributesDimensionIndex]?.[attrIndex]?.[locationIndex];
            if (!rowHeader || !isResultAttributeHeader(rowHeader)) {
                return;
            }

            const labelType = descriptor.attributeHeader.labelType;

            // Handle coordinate display forms (lat/lon/pin) - deduplicate by parent attribute
            if (isCoordinateFormType(labelType)) {
                const parentInfo = getParentAttributeInfo(descriptor);

                // Skip if we already processed a coordinate attribute from this parent
                if (processedCoordinateParents.has(parentInfo.key)) {
                    return;
                }
                processedCoordinateParents.add(parentInfo.key);

                // Normalize to use parent attribute's name and primary display form
                const normalized = normalizeCoordinateAttribute(descriptor, rowHeader, parentInfo);
                drillHeaders.push(normalized.rowHeader);
                drillHeaders.push(normalized.descriptor);
            } else {
                // Regular attributes - include as-is
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
