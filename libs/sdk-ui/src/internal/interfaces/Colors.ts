// (C) 2019 GoodData Corporation
import * as MappingHeader from "../../base/interfaces/MappingHeader";
import * as ChartConfiguration from "../../highcharts/Config";
import { IColor, IColorItem } from "@gooddata/sdk-model";

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
