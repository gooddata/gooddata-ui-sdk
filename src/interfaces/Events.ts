// (C) 2007-2018 GoodData Corporation
import { IDrillEvent } from './DrillEvents';

export interface ILoadingState {
    isLoading: boolean;
}

export type OnError = (error: object) => void;
export type OnLoadingChanged = (loadingState: ILoadingState) => void;
export type OnFiredDrillEvent = (param: IDrillEvent) => void | boolean;

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
    onLoadingChanged?: OnLoadingChanged;
    onFiredDrillEvent?: OnFiredDrillEvent;
}
