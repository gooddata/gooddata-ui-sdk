// (C) 2020-2026 GoodData Corporation

import {
    type IColor,
    type IColorPalette,
    type IRgbColorValue,
    isColorFromPalette,
} from "@gooddata/sdk-model";
import { type DataViewFacade, type IColorAssignment } from "@gooddata/sdk-ui";
import {
    AttributeColorStrategy,
    type IColorMapping,
    getColorByGuid,
    getColorFromMapping,
    getRgbStringFromRGB,
    isValidMappedColor,
} from "@gooddata/sdk-ui-vis-commons";

import { findMeasureGroupInDimensions } from "../_util/executionResultHelper.js";

export class PointsChartColorStrategy extends AttributeColorStrategy {
    protected singleMeasureColorMapping(
        colorPalette: IColorPalette,
        colorMapping: IColorMapping[] | undefined,
        dv: DataViewFacade,
    ): IColorAssignment[] {
        const measureGroup = findMeasureGroupInDimensions(dv.meta().dimensions());
        const measureHeaderItem = measureGroup.items[0];
        const measureColorMapping = getColorFromMapping(measureHeaderItem, colorMapping, dv)!;
        const color: IColor = isValidMappedColor(measureColorMapping, colorPalette)
            ? measureColorMapping
            : { type: "guid", value: colorPalette[0].guid };
        return [
            {
                headerItem: measureHeaderItem,
                color,
            },
        ];
    }

    protected createSingleColorPalette(
        colorPalette: IColorPalette,
        colorAssignment: IColorAssignment[],
        viewByAttribute: any,
    ): string[] {
        const length = viewByAttribute ? viewByAttribute.items.length : 1;
        const color = isColorFromPalette(colorAssignment[0].color)
            ? getColorByGuid(colorPalette, colorAssignment[0].color.value, 0)
            : (colorAssignment[0].color?.value as IRgbColorValue);
        const colorString = getRgbStringFromRGB(color);
        return Array(length).fill(colorString);
    }
}
