// (C) 2023-2025 GoodData Corporation

import { type IColor, type IColorDescriptor, type IColorPalette } from "@gooddata/sdk-model";
import { type DataViewFacade, type IColorAssignment } from "@gooddata/sdk-ui";
import {
    ColorStrategy,
    type IColorMapping,
    type ICreateColorAssignmentReturnValue,
    getColorFromMapping,
    isValidMappedColor,
} from "@gooddata/sdk-ui-vis-commons";

import { DEFAULT_WATERFALL_COLORS } from "../_util/color.js";

const DEFAULT_COLOR_PALETTE_ITEMS: IColorDescriptor[] = DEFAULT_WATERFALL_COLORS.map((id) => ({
    colorHeaderItem: { id, name: id },
}));

const getColorHeaderItem = (
    colorPalette: IColorPalette,
    colorMapping: IColorMapping[] | undefined,
    dv: DataViewFacade,
    item: IColorDescriptor,
    index: number,
): IColor => {
    const mappedColor = getColorFromMapping(item, colorMapping, dv);
    return mappedColor && isValidMappedColor(mappedColor, colorPalette)
        ? mappedColor
        : {
              type: "guid",
              value: colorPalette[index % colorPalette.length].guid,
          };
};

export class WaterfallChartColorStrategy extends ColorStrategy {
    protected createColorAssignment(
        colorPalette: IColorPalette,
        colorMapping: IColorMapping[] | undefined,
        _viewByParentAttribute: any,
        _viewByAttribute: any,
        dv: DataViewFacade,
    ): ICreateColorAssignmentReturnValue {
        const colorAssignment: IColorAssignment[] = DEFAULT_COLOR_PALETTE_ITEMS.map((headerItem, index) => {
            return {
                headerItem,
                color: getColorHeaderItem(colorPalette, colorMapping, dv, headerItem, index),
            };
        });

        return {
            fullColorAssignment: colorAssignment,
        };
    }
}
