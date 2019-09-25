// (C) 2007-2018 GoodData Corporation
import { IDataView } from "@gooddata/sdk-backend-spi";
import { ITotal, SortItem } from "@gooddata/sdk-model";
import { IColorAssignment, IColorPalette } from "./Colors";

/**
 * @internal
 */
export interface IColorsData {
    colorAssignments: IColorAssignment[];
    colorPalette: IColorPalette;
}

/**
 * TODO consider getting rid of push data
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
