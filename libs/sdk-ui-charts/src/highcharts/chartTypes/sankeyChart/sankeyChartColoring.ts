// (C) 2023 GoodData Corporation
import uniqBy from "lodash/uniqBy.js";
import {
    ColorStrategy,
    getColorFromMapping,
    IColorMapping,
    ICreateColorAssignmentReturnValue,
    isValidMappedColor,
} from "@gooddata/sdk-ui-vis-commons";
import { IColor, IColorPalette } from "@gooddata/sdk-model";
import { DataViewFacade } from "@gooddata/sdk-ui";
import compact from "lodash/compact.js";

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
