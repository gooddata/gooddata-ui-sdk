// (C) 2021-2022 GoodData Corporation

/**
 * @alpha
 */
export interface SavingState {
    saving: boolean;
    result?: boolean;
    error?: Error;
}

export const savingInitialState: SavingState = { saving: false };
