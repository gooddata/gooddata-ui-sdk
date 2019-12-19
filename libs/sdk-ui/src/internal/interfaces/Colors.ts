// (C) 2019 GoodData Corporation
import { IMappingHeader, IColorAssignment } from "../../base";
import { IRgbColorValue, IColor, IColorPaletteItem } from "@gooddata/sdk-model";

export interface IColoredItem {
    colorItem: IColor;
    color: IRgbColorValue;
    mappingHeader?: IMappingHeader;
}

export interface IColorConfiguration {
    colorAssignments: IColorAssignment[];
    colorPalette: IColorPaletteItem[];
}

export interface IColoredItemDropdownItem {
    source: IColoredItem;
}
