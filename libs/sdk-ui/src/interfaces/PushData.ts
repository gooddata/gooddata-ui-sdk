// (C) 2007-2018 GoodData Corporation
import { IColorAssignment, IColorPalette } from "./Config";
import { IDataView } from "@gooddata/sdk-backend-spi";
import { ITotal, SortItem } from "@gooddata/sdk-model";

/**
 * @internal
 */
export interface IColorsData {
    colorAssignments: IColorAssignment[];
    colorPalette: IColorPalette;
}

/**
 * @internal
 */
export interface IPushData {
    dataView?: IDataView;
    properties?: {
        sortItems?: SortItem[];
        totals?: ITotal[];
    };
    propertiesMeta?: any;
    colors?: IColorsData;
}
