// (C) 2021 GoodData Corporation

/**
 * @alpha
 */
export type UiState = {
    scheduleEmailDialog: {
        open: boolean;
    };
};

export const uiInitialState: UiState = {
    scheduleEmailDialog: {
        open: false,
    },
};
