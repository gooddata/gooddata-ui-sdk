// (C) 2020-2025 GoodData Corporation
import { IColor, IColorPalette, IRgbColorValue, isColorFromPalette } from "@gooddata/sdk-model";
import { DataViewFacade, IColorAssignment } from "@gooddata/sdk-ui";
import {
    AttributeColorStrategy,
    getColorByGuid,
    getColorFromMapping,
    getRgbStringFromRGB,
    isValidMappedColor,
} from "@gooddata/sdk-ui-vis-commons";

import { IColorMapping } from "../../../interfaces/index.js";
import { findMeasureGroupInDimensions } from "../_util/executionResultHelper.js";

export class PointsChartColorStrategy extends AttributeColorStrategy {
    protected singleMeasureColorMapping(
        colorPalette: IColorPalette,
        colorMapping: IColorMapping[],
        dv: DataViewFacade,
    ): IColorAssignment[] {
        const measureGroup = findMeasureGroupInDimensions(dv.meta().dimensions());
        const measureHeaderItem = measureGroup.items[0];
        const measureColorMapping = getColorFromMapping(measureHeaderItem, colorMapping, dv);
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
        // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
        viewByAttribute: any,
    ): string[] {
        const length = viewByAttribute ? viewByAttribute.items.length : 1;
        const color = isColorFromPalette(colorAssignment[0].color)
            ? getColorByGuid(colorPalette, colorAssignment[0].color.value as string, 0)
            : (colorAssignment[0].color.value as IRgbColorValue);
        const colorString = getRgbStringFromRGB(color);
        return Array(length).fill(colorString);
    }
}
