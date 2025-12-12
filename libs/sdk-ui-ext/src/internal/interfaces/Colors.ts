// (C) 2019-2025 GoodData Corporation
import { type IColor, type IColorPaletteItem, type IRgbColorValue } from "@gooddata/sdk-model";
import { type IColorAssignment, type IMappingHeader } from "@gooddata/sdk-ui";

export interface IColoredItem {
    colorItem: IColor;
    color: IRgbColorValue;
    mappingHeader?: IMappingHeader;
}

export interface IColorConfiguration {
    colorAssignments: IColorAssignment[];
    colorPalette: IColorPaletteItem[];
}
