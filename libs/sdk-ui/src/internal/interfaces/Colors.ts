// (C) 2019 GoodData Corporation
import * as MappingHeader from "../../base/headerMatching/MappingHeader";
import { IRgbColorValue, IColor, IColorPaletteItem } from "@gooddata/sdk-model";
import { IColorAssignment } from "../../base/interfaces/Colors";

export interface IColoredItem {
    colorItem: IColor;
    color: IRgbColorValue;
    mappingHeader?: MappingHeader.IMappingHeader;
}

export interface IColorConfiguration {
    colorAssignments: IColorAssignment[];
    colorPalette: IColorPaletteItem[];
}

export interface IColoredItemDropdownItem {
    source: IColoredItem;
}
