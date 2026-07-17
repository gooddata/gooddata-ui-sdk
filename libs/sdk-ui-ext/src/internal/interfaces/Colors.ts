// (C) 2019-2026 GoodData Corporation

import { type IColor, type IColorPaletteItem, type IRgbColorValue } from "@gooddata/sdk-model";
import { type IColorAssignment, type IMappingHeader } from "@gooddata/sdk-ui";
import { type LineStyle } from "@gooddata/sdk-ui-charts";

export interface IColoredItem {
    colorItem: IColor;
    color: IRgbColorValue;
    mappingHeader?: IMappingHeader;
    lineStyle?: LineStyle;
    lineWidth?: 1 | 2 | 3 | 4;
    isCustomMapped?: boolean;
}

export interface IColorConfiguration {
    colorAssignments: IColorAssignment[];
    colorPalette: IColorPaletteItem[];
}
