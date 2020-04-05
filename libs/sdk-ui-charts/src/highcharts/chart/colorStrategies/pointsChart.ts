// (C) 2020 GoodData Corporation
import { AttributeColorStrategy } from "./attribute";
import { IColor, IColorPalette, IRgbColorValue, isColorFromPalette } from "@gooddata/sdk-model";
import { IColorMapping } from "../../../interfaces";
import { IColorAssignment, DataViewFacade } from "@gooddata/sdk-ui";
import { findMeasureGroupInDimensions } from "../../utils/executionResultHelper";
import { getColorByGuid, getColorFromMapping, getRgbStringFromRGB } from "../../utils/color";
import { isValidMappedColor } from "./base";

export class PointsChartColorStrategy extends AttributeColorStrategy {
    protected singleMeasureColorMapping(
        colorPalette: IColorPalette,
        colorMapping: IColorMapping[],
        dv: DataViewFacade,
    ): IColorAssignment[] {
        const measureGroup = findMeasureGroupInDimensions(dv.dimensions());
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
