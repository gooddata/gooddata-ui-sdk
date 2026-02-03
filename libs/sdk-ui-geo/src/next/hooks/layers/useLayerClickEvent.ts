// (C) 2025-2026 GoodData Corporation

import { useEffect } from "react";

import {
    type AttributeDisplayFormType,
    type IAttributeDescriptor,
    type IDimensionItemDescriptor,
    type ObjRef,
    areObjRefsEqual,
    isAttributeDescriptor,
    isResultAttributeHeader,
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

function resolveDrillIdentityDescriptor(
    descriptor: IAttributeDescriptor,
    preferredDisplayFormRef?: ObjRef,
    descriptorsInGeoDimension?: IDimensionItemDescriptor[],
): { key: string; descriptor: IAttributeDescriptor } {
    const { primaryLabel, formOf } = descriptor.attributeHeader;

    const findDescriptorByRef = (candidateRef: ObjRef | undefined): IAttributeDescriptor | undefined => {
        if (!candidateRef || !descriptorsInGeoDimension) {
            return undefined;
        }
        return descriptorsInGeoDimension.find(
            (d): d is IAttributeDescriptor =>
                isAttributeDescriptor(d) && areObjRefsEqual(d.attributeHeader.ref, candidateRef),
        );
    };

    const resolvedDescriptor =
        findDescriptorByRef(preferredDisplayFormRef) ?? findDescriptorByRef(primaryLabel) ?? descriptor;

    return {
        key: formOf.identifier,
        descriptor: {
            ...resolvedDescriptor,
            attributeHeader: {
                ...resolvedDescriptor.attributeHeader,
                name: formOf.name,
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
    const tooltipDescriptor = typeof tooltipIndex === "number" ? descriptors[tooltipIndex] : undefined;
    const useTooltipValue =
        typeof tooltipIndex === "number" &&
        isAttributeDescriptor(tooltipDescriptor) &&
        tooltipDescriptor.attributeHeader.localIdentifier === TOOLTIP_TEXT_ATTRIBUTE_LOCAL_ID;
    const preferredDrillRef =
        useTooltipValue && isAttributeDescriptor(tooltipDescriptor)
            ? tooltipDescriptor.attributeHeader.ref
            : undefined;

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

            const drillIdentity = isGeoDisplayFormType(labelType)
                ? resolveDrillIdentityDescriptor(descriptor, preferredDrillRef, descriptors)
                : undefined;
            const descriptorForDrill = drillIdentity ? drillIdentity.descriptor : descriptor;
            const normalizedDescriptor = normalizeAttributeDescriptorLocalIdentifier(descriptorForDrill);

            // Coordinate display forms (lat/lon/pin) - deduplicate by resolved drill identity.
            if (isCoordinateFormType(labelType)) {
                if (drillIdentity && processedCoordinateParents.has(drillIdentity.key)) {
                    return;
                }
                if (drillIdentity) {
                    processedCoordinateParents.add(drillIdentity.key);
                }
            }

            drillHeaders.push(resolvedRowHeader);
            drillHeaders.push(normalizedDescriptor);
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
                // Click coordinates relative to the map container
                chartX: e.point.x,
                chartY: e.point.y,
            };

            onDrill(drillEvent);
        };

        map.on("click", handleClick);

        return () => {
            map.off("click", handleClick);
        };
    }, [map, isMapReady, layers, drillablePredicates, onDrill]);
}
