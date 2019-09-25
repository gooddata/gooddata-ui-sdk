// (C) 2019 GoodData Corporation
import * as MappingHeader from "../../base/interfaces/MappingHeader";
import { IColor, IColorItem } from "@gooddata/sdk-model";
import { IColorPaletteItem, IColorAssignment } from "../../base/interfaces/Colors";

export interface IColoredItem {
    colorItem: IColorItem;
    color: IColor;
    mappingHeader?: MappingHeader.IMappingHeader;
}

export interface IColorConfiguration {
    colorAssignments: IColorAssignment[];
    colorPalette: IColorPaletteItem[];
}

export interface IColoredItemDropdownItem {
    source: IColoredItem;
}
