export interface ILoadingState {
    isLoading: boolean;
}

export type OnError = (error: Object) => void;
export type OnLoadingChanged = (loadingState: ILoadingState) => void;

export interface IEvents {
    onError?: OnError;
    onLoadingChanged?: OnLoadingChanged;
}
