// (C) 2021-2026 GoodData Corporation

/**
 * @beta
 */
export interface ILoadingState {
    loading: boolean;
    result?: boolean;
    error?: Error;
}

export const loadingInitialState: ILoadingState = { loading: false };
