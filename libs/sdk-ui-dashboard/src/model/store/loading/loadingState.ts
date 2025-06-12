// (C) 2021-2023 GoodData Corporation

/**
 * @beta
 */
export interface LoadingState {
    loading: boolean;
    result?: boolean;
    error?: Error;
}

export const loadingInitialState: LoadingState = { loading: false };
