// (C) 2021 GoodData Corporation

/**
 * @alpha
 */
export type SavingState = {
    saving: boolean;
    result?: boolean;
    error?: Error;
};

export const savingInitialState: SavingState = { saving: false };
