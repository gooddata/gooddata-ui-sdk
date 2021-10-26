// (C) 2021 GoodData Corporation
import { ObjRef } from "@gooddata/sdk-model";

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
    kpiAlerts: {
        openedAlertRef: ObjRef | undefined;
        highlightedAlertRef: ObjRef | undefined;
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
    kpiAlerts: {
        highlightedAlertRef: undefined,
        openedAlertRef: undefined,
    },
};
