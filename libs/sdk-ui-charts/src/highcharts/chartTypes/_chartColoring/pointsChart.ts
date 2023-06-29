// (C) 2020 GoodData Corporation
import { IColor, IColorPalette, IRgbColorValue, isColorFromPalette } from "@gooddata/sdk-model";
import { IColorMapping } from "../../../interfaces/index.js";
import { IColorAssignment, DataViewFacade } from "@gooddata/sdk-ui";
import { findMeasureGroupInDimensions } from "../_util/executionResultHelper.js";
import {
    isValidMappedColor,
    getColorByGuid,
    getColorFromMapping,
    getRgbStringFromRGB,
    AttributeColorStrategy,
} from "@gooddata/sdk-ui-vis-commons";

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
