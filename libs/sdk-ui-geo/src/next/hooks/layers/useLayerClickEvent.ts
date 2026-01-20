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
import { getAreaLayerIds } from "../../layers/area/operations.js";
import {
    COORDINATE_FORM_TYPES,
    GEO_LAYER_DRILL_ELEMENT,
    GEO_LAYER_DRILL_TYPE,
    TOOLTIP_TEXT_ATTRIBUTE_LOCAL_ID,
} from "../../layers/common/constants.js";
import { normalizeAttributeDescriptorLocalIdentifier } from "../../layers/common/drillUtils.js";
import type { IMapFacade, MapMouseEvent } from "../../layers/common/mapFacade.js";
import { getTooltipProperties } from "../../layers/common/tooltipUtils.js";
import { getPushpinLayerIds } from "../../layers/pushpin/operations.js";
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
        if (layer.layerType === "pushpin") {
            const ids = getPushpinLayerIds(key);
            return (
                mapLibreLayerId === ids.pointLayerId ||
                mapLibreLayerId === ids.unclusterLayerId ||
                mapLibreLayerId === ids.clusterLayerId ||
                mapLibreLayerId === ids.clusterLabelsLayerId
            );
        }

        const ids = getAreaLayerIds(key);
        return mapLibreLayerId === ids.fillLayerId || mapLibreLayerId === ids.outlineLayerId;
    });
    return clickedLayerEntry?.[1];
}

function getLocationIndexFromProperties(
    properties: GeoJSON.GeoJsonProperties | undefined,
): number | undefined {
    const props = getTooltipProperties(properties);
    const value = props["locationIndex"];
    return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

/**
 * Check if a display form type is a geo coordinate type.
 */
function isCoordinateFormType(labelType: AttributeDisplayFormType | undefined): boolean {
    return labelType !== undefined && COORDINATE_FORM_TYPES.includes(labelType);
}

function isGeoDisplayFormType(labelType: AttributeDisplayFormType | undefined): boolean {
    return typeof labelType === "string" && labelType.startsWith("GDC.geo.");
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

function normalizeGeoDisplayFormAttribute(descriptor: IAttributeDescriptor): IAttributeDescriptor {
    const parentInfo = getParentAttributeInfo(descriptor);
    return {
        ...descriptor,
        attributeHeader: {
            ...descriptor.attributeHeader,
            // Use primary label (default display form) for cross-filter labeling and filter identity
            ref: parentInfo.ref,
            name: parentInfo.name,
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
    const tooltipDescriptor = typeof tooltipIndex === "number" ? descriptors[tooltipIndex] : undefined;
    const useTooltipValue =
        typeof tooltipIndex === "number" &&
        isAttributeDescriptor(tooltipDescriptor) &&
        tooltipDescriptor.attributeHeader.localIdentifier === TOOLTIP_TEXT_ATTRIBUTE_LOCAL_ID;
    const tooltipRowHeader = useTooltipValue
        ? headerItems[geoAttributesDimensionIndex]?.[tooltipIndex]?.[locationIndex]
        : undefined;
    const resolvedTooltipRowHeader =
        tooltipRowHeader && isResultAttributeHeader(tooltipRowHeader) ? tooltipRowHeader : undefined;

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
            const resolvedRowHeader =
                resolvedTooltipRowHeader && isGeoDisplayFormType(labelType)
                    ? resolvedTooltipRowHeader
                    : rowHeader;

            // Handle coordinate display forms (lat/lon/pin) - deduplicate by parent attribute
            if (isCoordinateFormType(labelType)) {
                const parentInfo = getParentAttributeInfo(descriptor);

                // Skip if we already processed a coordinate attribute from this parent
                if (processedCoordinateParents.has(parentInfo.key)) {
                    return;
                }
                processedCoordinateParents.add(parentInfo.key);

                // Normalize to use parent attribute's name and primary display form
                const normalized = normalizeCoordinateAttribute(descriptor, resolvedRowHeader, parentInfo);
                const normalizedDescriptor = normalizeAttributeDescriptorLocalIdentifier(
                    normalized.descriptor,
                );
                drillHeaders.push(normalized.rowHeader);
                drillHeaders.push(normalizedDescriptor);
            } else {
                // Regular attributes - include as-is
                drillHeaders.push(resolvedRowHeader);
                const descriptorForDrill =
                    isGeoDisplayFormType(labelType) && descriptor.attributeHeader.primaryLabel
                        ? normalizeGeoDisplayFormAttribute(descriptor)
                        : descriptor;
                drillHeaders.push(normalizeAttributeDescriptorLocalIdentifier(descriptorForDrill));
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
    enableDrillMenuPositioningAtCursor: boolean,
    onDrill?: OnFiredDrillEvent,
): void {
    useEffect(() => {
        if (!map || !isMapReady || !onDrill) {
            return;
        }

        const handleClick = (e: MapMouseEvent) => {
            const features = map.queryRenderedFeatures(e.point);

            if (!features || features.length === 0) {
                return;
            }

            // Find the first feature that belongs to one of our layers
            let layerData: IGeoLayerData | undefined;
            let locationIndex: number | undefined;

            for (const feature of features) {
                const mapLibreLayerId = (feature as GeoJSON.Feature & { layer?: { id?: string } }).layer?.id;
                layerData = getClickedLayerByMapLibreLayerId(layers, mapLibreLayerId);
                if (layerData?.dataView) {
                    locationIndex = getLocationIndexFromProperties(feature.properties);
                    if (locationIndex !== undefined) {
                        break;
                    }
                }
            }

            if (!layerData?.dataView || locationIndex === undefined) {
                return;
            }

            const { dataView, geoData, layerType } = layerData;
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
                ...(enableDrillMenuPositioningAtCursor
                    ? {
                          // Click coordinates relative to the map container
                          chartX: e.point.x,
                          chartY: e.point.y,
                          enableDrillMenuPositioningAtCursor: true,
                      }
                    : {}),
            };

            onDrill(drillEvent);
        };

        map.on("click", handleClick);

        return () => {
            map.off("click", handleClick);
        };
    }, [map, isMapReady, layers, drillablePredicates, onDrill, enableDrillMenuPositioningAtCursor]);
}
