// (C) 2007-2020 GoodData Corporation
import { IDataView, IExportConfig, IExportResult } from "@gooddata/sdk-backend-spi";
import { IColor, IColorPalette, Identifier, ITotal, SortItem } from "@gooddata/sdk-model";
import { GoodDataSdkError } from "../errors/GoodDataSdkError";
import { IMappingHeader } from "../headerMatching/MappingHeader";

/**
 * @public
 */
export interface ILoadingState {
    isLoading: boolean;
}

/**
 * @public
 */
export type OnError = (error: GoodDataSdkError) => void;

/**
 * @public
 */
export type OnLoadingChanged = (loadingState: ILoadingState) => void;

/**
 * @public
 */
export interface IExtendedExportConfig extends IExportConfig {
    includeFilterContext?: boolean;
}

/**
 * @public
 */
export type IExportFunction = (exportConfig: IExtendedExportConfig) => Promise<IExportResult>;

/**
 * @public
 */
export type OnExportReady = (exportFunction: IExportFunction) => void;

/**
 * @internal
 */
export interface IColorAssignment {
    // << send from SDK up
    headerItem: IMappingHeader;
    color: IColor;
}

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
export type DrillableItemType = "measure";

/**
 * @internal
 */
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
    initialProperties?: any;
    supportedDrillableItems?: IDrillableItemPushData[];
}
