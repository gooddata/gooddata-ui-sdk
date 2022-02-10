// (C) 2021-2022 GoodData Corporation

/**
 * @alpha
 */
export interface LoadingState {
    loading: boolean;
    result?: boolean;
    error?: Error;
}

export const loadingInitialState: LoadingState = { loading: false };
