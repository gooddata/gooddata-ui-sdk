// (C) 2007-2019 GoodData Corporation
import { IExportConfig, IExportResponse } from "@gooddata/gd-bear-client";
import { IDrillEventCallback2 } from "./DrillEvents";
import { RuntimeError } from "../errors/RuntimeError";

export interface ILoadingState {
    isLoading: boolean;
}

export type OnError = (error: RuntimeError) => void;
export type OnLoadingChanged = (loadingState: ILoadingState) => void;
export type OnLoadingFinish = (result: object) => void;
export type OnFiredDrillEvent2 = IDrillEventCallback2;

export interface IExtendedExportConfig extends IExportConfig {
    includeFilterContext?: boolean;
}
export type IExportFunction = (exportConfig: IExtendedExportConfig) => Promise<IExportResponse>;
export type OnExportReady = (exportFunction: IExportFunction) => void;

export interface ILegendItem {
    name: string;
    color: string; // hex or RGB, can be used directly in CSS style
    onClick: () => void; // toggle to show/hide serie in chart
}

export interface ILegendData {
    legendItems: ILegendItem[];
}

export type OnLegendReady = (data: ILegendData) => void;

export interface IEvents {
    onError?: OnError;
    onExportReady?: OnExportReady;
    onLoadingChanged?: OnLoadingChanged;
    onLoadingFinish?: OnLoadingFinish;
    onDrill?: OnFiredDrillEvent2;
}
