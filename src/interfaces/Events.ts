import { IDrillEvent } from './DrillEvents';

export interface ILoadingState {
    isLoading: boolean;
}

export type OnError = (error: object) => void;
export type OnLoadingChanged = (loadingState: ILoadingState) => void;
export type OnFiredDrillEvent = (param: IDrillEvent) => void | boolean;

export interface IEvents {
    onError?: OnError;
    onLoadingChanged?: OnLoadingChanged;
    onFiredDrillEvent?: OnFiredDrillEvent;
}
