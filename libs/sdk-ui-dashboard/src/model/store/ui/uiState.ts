// (C) 2021-2022 GoodData Corporation
import { ObjRef } from "@gooddata/sdk-model";

import { IMenuButtonItemsVisibility } from "../../../types";

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
    shareDialog: {
        open: boolean;
    };
    filterBar: {
        height: number;
        expanded: boolean;
    };
    kpiAlerts: {
        openedWidgetRef: ObjRef | undefined;
        highlightedWidgetRef: ObjRef | undefined;
    };
    menuButton: {
        itemsVisibility: IMenuButtonItemsVisibility;
    };
};

export const uiInitialState: UiState = {
    scheduleEmailDialog: {
        open: false,
    },
    saveAsDialog: {
        open: false,
    },
    shareDialog: {
        open: false,
    },
    filterBar: {
        height: 0,
        expanded: false,
    },
    kpiAlerts: {
        highlightedWidgetRef: undefined,
        openedWidgetRef: undefined,
    },
    menuButton: {
        itemsVisibility: {},
    },
};
