// (C) 2021 GoodData Corporation

/**
 * @internal
 */
export type LoadingState = {
    loading: boolean;
    result?: boolean;
    error?: Error;
};

export const loadingInitialState: LoadingState = { loading: false };
