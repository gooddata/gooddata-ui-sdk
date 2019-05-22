// (C) 2019 GoodData Corporation
import { IColor, IColorItem } from "@gooddata/gooddata-js";
import * as MappingHeader from "../../interfaces/MappingHeader";
import * as ChartConfiguration from "../../interfaces/Config";

export interface IColoredItem {
    colorItem: IColorItem;
    color: IColor;
    mappingHeader?: MappingHeader.IMappingHeader;
}

export interface IColorConfiguration {
    colorAssignments: ChartConfiguration.IColorAssignment[];
    colorPalette: ChartConfiguration.IColorPaletteItem[];
}

export interface IColoredItemDropdownItem {
    source: IColoredItem;
}
