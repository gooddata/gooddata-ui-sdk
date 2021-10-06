// (C) 2021 GoodData Corporation

import { DEFAULT_FILTER_BAR_HEIGHT } from "../../../presentation/constants";

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
        height: DEFAULT_FILTER_BAR_HEIGHT,
        expanded: false,
    },
};
