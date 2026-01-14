// (C) 2020-2026 GoodData Corporation

import { omit, without } from "lodash-es";

import { type IAttributeDescriptor, type IResultAttributeHeader } from "@gooddata/sdk-model";
import {
    type DataViewFacade,
    type IDrillConfig,
    type IDrillEvent,
    type IDrillEventIntersectionElement,
    type IHeaderPredicate,
    type IMappingHeader,
    getDrillIntersection,
    isSomeHeaderPredicateMatched,
} from "@gooddata/sdk-ui";

import { type AttributeInfo, findGeoAttributesInDimension, parseGeoProperties } from "./data.js";
import { type IGeoData, type IGeoDrillEvent } from "../../../../GeoChart.js";

function getDrillIntersectionForGeoChart(
    drillableItems: IHeaderPredicate[],
    dv: DataViewFacade,
    geoData: IGeoData,
    locationIndex: number,
): IDrillEventIntersectionElement[] | undefined {
    const measureGroupItems = dv.meta().measureDescriptors();
    const measureHeaders = measureGroupItems.slice(0, 2);

    const { locationAttribute, segmentByAttribute, tooltipTextAttribute } = findGeoAttributesInDimension(
        dv,
        geoData,
    );

    const { attributeHeader: locationAttributeHeader, attributeHeaderItem: locationAttributeHeaderItem } =
        getAttributeHeader(locationAttribute, locationIndex);
    const { attributeHeader: segmentByAttributeHeader, attributeHeaderItem: segmentByAttributeHeaderItem } =
        getAttributeHeader(segmentByAttribute, locationIndex);
    const {
        attributeHeader: tooltipTextAttributeHeader,
        attributeHeaderItem: tooltipTextAttributeHeaderItem,
    } = getAttributeHeader(tooltipTextAttribute, locationIndex);

    // pin is drillable if a drillableItem matches:
    //   pin's measure,
    //   pin's location attribute,
    //   pin's location attribute item,
    //   pin's segmentBy attribute,
    //   pin's segmentBy attribute item,
    //   pin's tooltipText attribute,
    //   pin's tooltipText attribute item,
    const drillItems: IMappingHeader[] = without(
        [
            ...measureHeaders,
            locationAttributeHeaderItem,
            locationAttributeHeader,
            segmentByAttributeHeaderItem,
            segmentByAttributeHeader,
            tooltipTextAttributeHeaderItem,
            tooltipTextAttributeHeader,
        ],
        undefined,
    ) as any;

    const drilldown: boolean = drillItems.some((drillableHook: IMappingHeader): boolean =>
        isSomeHeaderPredicateMatched(drillableItems, drillableHook, dv),
    );

    if (drilldown) {
        return getDrillIntersection(drillItems);
    }

    return undefined;
}

function getAttributeHeader(
    attribute: AttributeInfo | undefined,
    dataIndex: number,
): {
    attributeHeader: IAttributeDescriptor | undefined;
    attributeHeaderItem: IResultAttributeHeader | undefined;
} {
    if (attribute) {
        return {
            attributeHeader: { attributeHeader: omit(attribute, "items") },
            attributeHeaderItem: attribute.items[dataIndex] as IResultAttributeHeader,
        };
    }
    return {
        attributeHeader: undefined,
        attributeHeaderItem: undefined,
    };
}

export function handleGeoPushpinDrillEvent(
    drillableItems: IHeaderPredicate[],
    drillConfig: IDrillConfig,
    dv: DataViewFacade,
    geoData: IGeoData,
    pinProperties: GeoJSON.GeoJsonProperties,
    pinCoordinates: number[],
    target: EventTarget,
    clickEvent?: MouseEvent,
    enableDrillMenuPositioningAtCursor = false,
): void {
    const { locationIndex } = pinProperties || {};
    const drillIntersection: IDrillEventIntersectionElement[] | undefined = getDrillIntersectionForGeoChart(
        drillableItems,
        dv,
        geoData,
        locationIndex,
    );

    if (!drillIntersection?.length) {
        return;
    }

    const { onDrill } = drillConfig;
    const [lng, lat] = pinCoordinates;
    const {
        locationName: { value: locationNameValue },
        color: { value: colorValue },
        segment: { value: segmentByValue },
        size: { value: sizeValue },
    } = parseGeoProperties(pinProperties) || {};

    const drillContext: IGeoDrillEvent = {
        element: "pushpin",
        intersection: drillIntersection,
        type: "pushpin",
        color: colorValue,
        location: { lat, lng },
        locationName: locationNameValue,
        segmentBy: segmentByValue,
        size: sizeValue,
    };
    const drillEventExtended: IDrillEvent = {
        dataView: dv.dataView,
        drillContext,
        ...(enableDrillMenuPositioningAtCursor
            ? {
                  // Chart coordinates for drill popover positioning (relative to the map container)
                  chartX: clickEvent?.offsetX,
                  chartY: clickEvent?.offsetY,
                  enableDrillMenuPositioningAtCursor: true,
              }
            : {}),
    };

    if (onDrill) {
        const shouldFireEvent = onDrill(drillEventExtended);
        // if user-specified onDrill fn returns false, do not fire default DOM event
        if (shouldFireEvent !== false) {
            const event = new CustomEvent("drill", {
                detail: drillEventExtended,
                bubbles: true,
            });
            target.dispatchEvent(event);
        }
    }
}
