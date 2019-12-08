// (C) 2007-2019 GoodData Corporation
import { IDataView } from "@gooddata/sdk-backend-spi";
import { ITotal, SortItem, IColorPalette, Identifier } from "@gooddata/sdk-model";
import { IColorAssignment } from "./Colors";

/**
 * @internal
 */
export interface IColorsData {
    colorAssignments: IColorAssignment[];
    colorPalette: IColorPalette;
}

export type DrillableItemType = "measure";

export interface IDrillableItemPushData {
    type: DrillableItemType;
    localIdentifier: Identifier;
    title: string;
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
    supportedDrillableItems?: IDrillableItemPushData[];
}
