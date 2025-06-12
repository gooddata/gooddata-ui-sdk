// (C) 2023 GoodData Corporation
import {
    ColorStrategy,
    IColorMapping,
    ICreateColorAssignmentReturnValue,
    getColorFromMapping,
    isValidMappedColor,
} from "@gooddata/sdk-ui-vis-commons";
import { IColor, IColorDescriptor, IColorPalette } from "@gooddata/sdk-model";
import { DataViewFacade, IColorAssignment } from "@gooddata/sdk-ui";

import { DEFAULT_WATERFALL_COLORS } from "../_util/color.js";

const DEFAULT_COLOR_PALETTE_ITEMS: IColorDescriptor[] = DEFAULT_WATERFALL_COLORS.map((id) => ({
    colorHeaderItem: { id, name: id },
}));

const getColorHeaderItem = (
    colorPalette: IColorPalette,
    colorMapping: IColorMapping[],
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
        colorMapping: IColorMapping[],
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
