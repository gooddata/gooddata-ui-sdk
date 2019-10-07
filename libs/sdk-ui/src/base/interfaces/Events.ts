// (C) 2007-2019 GoodData Corporation
import { OnFiredDrillEvent } from "./DrillEvents";
import { RuntimeError } from "../errors/RuntimeError";
import { IExportConfig, IExportResult } from "@gooddata/sdk-backend-spi";

export interface ILoadingState {
    isLoading: boolean;
}

export type OnError = (error: RuntimeError) => void;
export type OnLoadingChanged = (loadingState: ILoadingState) => void;
export type OnLoadingFinish = (result: object) => void;

export interface IExtendedExportConfig extends IExportConfig {
    includeFilterContext?: boolean;
}
export type IExportFunction = (exportConfig: IExtendedExportConfig) => Promise<IExportResult>;
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
    onDrill?: OnFiredDrillEvent;
}
