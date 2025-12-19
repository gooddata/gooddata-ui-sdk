// (C) 2025 GoodData Corporation

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

import { type IAreaGeoData } from "../../../types/geoData/area.js";
import { type IAreaAttributesInDimension, findAreaAttributesInDimension } from "../data/transformation.js";

/**
 * Color strategy for GeoAreaChart
 *
 * @remarks
 * Manages color assignment for area charts based on either location or segment attributes.
 * Extends the base ColorStrategy from vis-commons with area-specific logic.
 *
 * @internal
 */
class AreaColorStrategy extends ColorStrategy {
    /**
     * Creates color assignment based on area attributes
     *
     * @remarks
     * - If segment attribute exists, colors are assigned by segment
     * - Otherwise, colors are assigned by location (area)
     */
    protected createColorAssignment(
        colorPalette: IColorPalette,
        colorMapping: IColorMapping[] | undefined,
        areaAttribute: IAttributeDescriptor,
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
                this.getColorStrategyForLocation(colorPalette, colorMapping, areaAttribute, dv),
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
        areaAttribute: IAttributeDescriptor,
        dv: DataViewFacade,
    ): IColorAssignment {
        const mappedColor = getColorFromMapping(areaAttribute, colorMapping, dv);
        const color: IColor =
            mappedColor !== undefined && isValidMappedColor(mappedColor, colorPalette)
                ? mappedColor
                : {
                      type: "guid",
                      value: colorPalette[0].guid,
                  };

        return {
            headerItem: areaAttribute,
            color,
        };
    }
}

/**
 * Creates and returns a color strategy for area chart
 *
 * @remarks
 * The color strategy determines how colors are assigned to areas based on:
 * - Segment attribute (if present): Each segment gets a different color
 * - Location attribute (otherwise): All locations use the same color
 *
 * @param colorPalette - Color palette to use
 * @param colorMapping - Custom color mappings
 * @param geoData - Area geo data structure
 * @param dv - Data view facade
 * @returns Color strategy instance
 *
 * @internal
 */
export function getAreaColorStrategy(
    colorPalette: IColorPalette,
    colorMapping: IColorMapping[],
    geoData: IAreaGeoData,
    dv: DataViewFacade,
): IColorStrategy {
    const { areaAttribute, segmentByAttribute }: IAreaAttributesInDimension = findAreaAttributesInDimension(
        dv,
        geoData,
    );

    const areaAttributeHeader: IAttributeDescriptor = {
        attributeHeader: omit(areaAttribute, "items"),
    };

    return new AreaColorStrategy(colorPalette, colorMapping, areaAttributeHeader, segmentByAttribute, dv);
}
