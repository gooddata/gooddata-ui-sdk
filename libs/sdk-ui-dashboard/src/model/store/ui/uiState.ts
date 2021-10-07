// (C) 2021 GoodData Corporation

/**
 * @alpha
 */
export type UiState = {
    scheduleEmailDialog: {
        open: boolean;
    };
    saveAsDialog: {
        open: boolean;
    };
    filterBar: {
        height: number;
        expanded: boolean;
    };
};

export const uiInitialState: UiState = {
    scheduleEmailDialog: {
        open: false,
    },
    saveAsDialog: {
        open: false,
    },
    filterBar: {
        height: 0,
        expanded: false,
    },
};
