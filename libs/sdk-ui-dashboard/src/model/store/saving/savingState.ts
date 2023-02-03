// (C) 2021-2023 GoodData Corporation

/**
 * @public
 */
export interface SavingState {
    /** @beta */
    saving: boolean;
    /** @beta */
    result?: boolean;
    /** @beta */
    error?: Error;
}

export const savingInitialState: SavingState = { saving: false };
