// (C) 2007-2022 GoodData Corporation
import { IDataView, IExportConfig, IExportResult } from "@gooddata/sdk-backend-spi";
import {
    IColor,
    IColorPalette,
    ITotal,
    ISortItem,
    IMeasureDescriptor,
    IAttributeDescriptor,
} from "@gooddata/sdk-model";
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
export interface IAvailableDrillTargets {
    attributes?: IAvailableDrillTargetAttribute[];
    measures?: IAvailableDrillTargetMeasure[];
}

/**
 * @internal
 */
export interface IAvailableDrillTargetMeasure {
    measure: IMeasureDescriptor;
    attributes: IAttributeDescriptor[];
}

/**
 * @internal
 */
export interface IAvailableDrillTargetAttribute {
    attribute: IAttributeDescriptor;
    intersectionAttributes: IAttributeDescriptor[];
}

/*
 * Push data is a 'catch-all' type of callback that is used to transfer 'misc' information from visualization
 * up to the consumer (say AD or KD). The existence of push data indicates insufficient first-class callbacks
 * on different react components + insufficient modeling in the plug viz area (everything that is pushed goes
 * through the plug viz boundary and into the consumer apps)
 *
 * We need to get rid of push data:
 *
 * 1.  some props in the below interface should be returned using first-class callbacks on the react
 *     components: dataView and availableDrillTargets are perfect for this
 *
 * 2.  the remainder of props are specific to plug viz impl (and are indeed dispatched by them) and should
 *     be exposed using plug-viz-specific callbacks
 */

/**
 * TODO: remove push data
 * @internal
 */
export interface IPushData {
    dataView?: IDataView;
    properties?: {
        sortItems?: ISortItem[];
        totals?: ITotal[];
        controls?: object;
    };
    propertiesMeta?: any;
    colors?: IColorsData;
    initialProperties?: any;
    availableDrillTargets?: IAvailableDrillTargets;
}
