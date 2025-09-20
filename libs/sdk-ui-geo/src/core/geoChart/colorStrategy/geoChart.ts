// (C) 2020-2025 GoodData Corporation
import { omit } from "lodash-es";

import { IAttributeDescriptor, IColor, IColorPalette } from "@gooddata/sdk-model";
import { DataViewFacade, IColorAssignment } from "@gooddata/sdk-ui";
import {
    AttributeColorStrategy,
    ColorStrategy,
    IColorMapping,
    IColorStrategy,
    ICreateColorAssignmentReturnValue,
    getColorFromMapping,
    isValidMappedColor,
} from "@gooddata/sdk-ui-vis-commons";

import { IGeoData } from "../../../GeoChart.js";
import { IGeoAttributesInDimension, findGeoAttributesInDimension } from "../helpers/geoChart/data.js";

class GeoChartColorStrategy extends ColorStrategy {
    protected createColorAssignment(
        colorPalette: IColorPalette,
        colorMapping: IColorMapping[],
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
        colorMapping: IColorMapping[],
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
        colorMapping: IColorMapping[],
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
        attributeHeader: omit(locationAttribute, "items"),
    };

    return new GeoChartColorStrategy(
        colorPalette,
        colorMapping,
        locationAttributeHeader,
        segmentByAttribute,
        dv,
    );
}
