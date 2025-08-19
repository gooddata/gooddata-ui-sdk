// (C) 2019-2025 GoodData Corporation
import { IColor, IColorPaletteItem, IRgbColorValue } from "@gooddata/sdk-model";
import { IColorAssignment, IMappingHeader } from "@gooddata/sdk-ui";

export interface IColoredItem {
    colorItem: IColor;
    color: IRgbColorValue;
    mappingHeader?: IMappingHeader;
}

export interface IColorConfiguration {
    colorAssignments: IColorAssignment[];
    colorPalette: IColorPaletteItem[];
}
