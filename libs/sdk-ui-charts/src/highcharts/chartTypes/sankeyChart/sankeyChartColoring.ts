// (C) 2023-2026 GoodData Corporation

import { type IColor, type IColorPalette } from "@gooddata/sdk-model";
import { type DataViewFacade } from "@gooddata/sdk-ui";
import {
    ColorStrategy,
    type IColorMapping,
    type ICreateColorAssignmentReturnValue,
    getColorFromMapping,
    isValidMappedColor,
} from "@gooddata/sdk-ui-vis-commons";
import { _compact, _uniqBy } from "@gooddata/util";

export class SankeyChartColorStrategy extends ColorStrategy {
    protected createColorAssignment(
        colorPalette: IColorPalette,
        colorMapping: IColorMapping[] | undefined,
        fromAttribute: any,
        toAttribute: any,
        dv: DataViewFacade,
    ): ICreateColorAssignmentReturnValue {
        const attributeItems = _compact([...(fromAttribute?.items ?? []), ...(toAttribute?.items ?? [])]);
        const uniqAttributeItems = _uniqBy(attributeItems, "attributeHeaderItem.uri");

        const colorAssignment = uniqAttributeItems.map((headerItem, index) => {
            const mappedColor = getColorFromMapping(headerItem, colorMapping, dv);
            const color: IColor =
                mappedColor && isValidMappedColor(mappedColor, colorPalette)
                    ? mappedColor
                    : {
                          type: "guid",
                          value: colorPalette[index % colorPalette.length].guid,
                      };
            return {
                headerItem,
                color,
            };
        });
        return {
            fullColorAssignment: colorAssignment,
        };
    }
}
