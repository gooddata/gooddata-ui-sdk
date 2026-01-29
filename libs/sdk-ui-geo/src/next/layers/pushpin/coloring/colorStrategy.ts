// (C) 2025-2026 GoodData Corporation

import { omit } from "lodash-es";

import { type IAttributeDescriptor, type IColor, type IColorPalette } from "@gooddata/sdk-model";
import { type DataViewFacade, type IColorAssignment } from "@gooddata/sdk-ui";
import {
    AttributeColorStrategy,
    ColorStrategy,
    type IColorMapping,
    type IColorStrategy,
    type ICreateColorAssignmentReturnValue,
    getColorFromMapping,
    isValidMappedColor,
} from "@gooddata/sdk-ui-vis-commons";

import { type IPushpinGeoData } from "../../../types/geoData/pushpin.js";
import {
    type IPushpinAttributesInDimension,
    findPushpinAttributesInDimension,
} from "../data/transformation.js";

/**
 * Color strategy for GeoPushpinChart
 *
 * @remarks
 * Manages color assignment for geo charts based on either location or segment attributes.
 * Extends the base ColorStrategy from vis-commons with geo-specific logic.
 *
 * @internal
 */
class PushpinColorStrategy extends ColorStrategy {
    /**
     * Creates color assignment based on geo attributes
     *
     * @remarks
     * - If segment attribute exists, colors are assigned by segment
     * - Otherwise, colors are assigned by location
     */
    protected createColorAssignment(
        colorPalette: IColorPalette,
        colorMapping: IColorMapping[] | undefined,
        locationAttribute: IAttributeDescriptor,
        segmentByAttribute: IAttributeDescriptor | null,
        dv: DataViewFacade,
    ): ICreateColorAssignmentReturnValue {
        // Color follows SegmentBy attribute
        if (segmentByAttribute) {
            return {
                fullColorAssignment: this.getColorStrategyForSegmentBy(
                    colorPalette,
                    colorMapping,
                    segmentByAttribute,
                    dv,
                ),
            };
        }

        // Color follows Location attribute
        return {
            fullColorAssignment: [
                this.getColorStrategyForLocation(colorPalette, colorMapping, locationAttribute, dv),
            ],
        };
    }

    /**
     * Creates color strategy for segment-based coloring
     */
    private getColorStrategyForSegmentBy(
        colorPalette: IColorPalette,
        colorMapping: IColorMapping[] | undefined,
        segmentByAttribute: IAttributeDescriptor,
        dv: DataViewFacade,
    ): IColorAssignment[] {
        const colorStrategy: IColorStrategy = new AttributeColorStrategy(
            colorPalette,
            colorMapping,
            null,
            segmentByAttribute,
            dv,
        );

        return colorStrategy.getColorAssignment();
    }

    /**
     * Creates color strategy for location-based coloring
     */
    private getColorStrategyForLocation(
        colorPalette: IColorPalette,
        colorMapping: IColorMapping[] | undefined,
        locationAttribute: IAttributeDescriptor,
        dv: DataViewFacade,
    ): IColorAssignment {
        const mappedColor = getColorFromMapping(locationAttribute, colorMapping, dv);
        const color: IColor =
            mappedColor !== undefined && isValidMappedColor(mappedColor, colorPalette)
                ? mappedColor
                : {
                      type: "guid",
                      value: colorPalette[0].guid,
                  };

        return {
            headerItem: locationAttribute,
            color,
        };
    }
}

/**
 * Creates and returns a color strategy for geo chart
 *
 * @remarks
 * The color strategy determines how colors are assigned to pushpins based on:
 * - Segment attribute (if present): Each segment gets a different color
 * - Location attribute (otherwise): All locations use the same color
 *
 * @param colorPalette - Color palette to use
 * @param colorMapping - Custom color mappings
 * @param geoData - Geo data structure
 * @param dv - Data view facade
 * @returns Color strategy instance
 *
 * @internal
 */
export function getPushpinColorStrategy(
    colorPalette: IColorPalette,
    colorMapping: IColorMapping[],
    geoData: IPushpinGeoData,
    dv: DataViewFacade,
): IColorStrategy {
    const { locationAttribute, segmentByAttribute }: IPushpinAttributesInDimension =
        findPushpinAttributesInDimension(dv, geoData);

    const locationAttributeHeader: IAttributeDescriptor = {
        attributeHeader: omit(locationAttribute, "items"),
    };

    return new PushpinColorStrategy(
        colorPalette,
        colorMapping,
        locationAttributeHeader,
        segmentByAttribute,
        dv,
    );
}
