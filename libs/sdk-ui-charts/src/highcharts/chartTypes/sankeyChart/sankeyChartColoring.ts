// (C) 2023-2025 GoodData Corporation
import { compact, uniqBy } from "lodash-es";

import { IColor, IColorPalette } from "@gooddata/sdk-model";
import { DataViewFacade } from "@gooddata/sdk-ui";
import {
    ColorStrategy,
    IColorMapping,
    ICreateColorAssignmentReturnValue,
    getColorFromMapping,
    isValidMappedColor,
} from "@gooddata/sdk-ui-vis-commons";

export class SankeyChartColorStrategy extends ColorStrategy {
    protected createColorAssignment(
        colorPalette: IColorPalette,
        colorMapping: IColorMapping[],
        fromAttribute: any,
        toAttribute: any,
        dv: DataViewFacade,
    ): ICreateColorAssignmentReturnValue {
        const attributeItems = compact([...(fromAttribute?.items ?? []), ...(toAttribute?.items ?? [])]);
        const uniqAttributeItems = uniqBy(attributeItems, "attributeHeaderItem.uri");

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
