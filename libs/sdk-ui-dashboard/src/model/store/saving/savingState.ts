// (C) 2021-2026 GoodData Corporation

/**
 * @public
 */
export type SavingState = {
    /** @beta */
    saving: boolean;
    /** @beta */
    result?: boolean;
    /** @beta */
    error?: Error;
};

export const savingInitialState: SavingState = { saving: false };
