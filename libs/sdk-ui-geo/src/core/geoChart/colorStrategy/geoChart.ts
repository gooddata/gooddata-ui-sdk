// (C) 2020-2026 GoodData Corporation

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
import { _omit } from "@gooddata/util";

import { type IGeoData } from "../../../GeoChart.js";
import { type IGeoAttributesInDimension, findGeoAttributesInDimension } from "../helpers/geoChart/data.js";

class GeoChartColorStrategy extends ColorStrategy {
    protected createColorAssignment(
        colorPalette: IColorPalette,
        colorMapping: IColorMapping[] | undefined,
        locationAttribute: any,
        segmentByAttribute: any,
        dv: DataViewFacade,
    ): ICreateColorAssignmentReturnValue {
        // color follows SegmentBy
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

        // color follows Location
        return {
            fullColorAssignment: [
                this.getColorStrategyForLocation(colorPalette, colorMapping, locationAttribute, dv),
            ],
        };
    }

    private getColorStrategyForSegmentBy(
        colorPalette: IColorPalette,
        colorMapping: IColorMapping[] | undefined,
        segmentByAttribute: any,
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

    private getColorStrategyForLocation(
        colorPalette: IColorPalette,
        colorMapping: IColorMapping[] | undefined,
        locationAttribute: any,
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

export function getColorStrategy(
    colorPalette: IColorPalette,
    colorMapping: IColorMapping[],
    geoData: IGeoData,
    dv: DataViewFacade,
): IColorStrategy {
    const { locationAttribute, segmentByAttribute }: IGeoAttributesInDimension = findGeoAttributesInDimension(
        dv,
        geoData,
    );
    const locationAttributeHeader: IAttributeDescriptor = {
        attributeHeader: _omit(locationAttribute, "items"),
    };

    return new GeoChartColorStrategy(
        colorPalette,
        colorMapping,
        locationAttributeHeader,
        segmentByAttribute,
        dv,
    );
}
