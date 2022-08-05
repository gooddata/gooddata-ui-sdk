// (C) 2021-2022 GoodData Corporation
import { ObjRef } from "@gooddata/sdk-model";

import { IMenuButtonItemsVisibility, RenderMode } from "../../../types";

/**
 * @alpha
 */
export interface UiState {
    scheduleEmailManagementDialog: {
        open: boolean;
    };
    scheduleEmailDialog: {
        open: boolean;
        defaultAttachmentRef: ObjRef | undefined;
    };
    saveAsDialog: {
        open: boolean;
    };
    shareDialog: {
        open: boolean;
    };
    deleteDialog: {
        open: boolean;
    };
    filterBar: {
        expanded: boolean;
    };
    kpiAlerts: {
        openedWidgetRef: ObjRef | undefined;
        highlightedWidgetRef: ObjRef | undefined;
    };
    menuButton: {
        itemsVisibility: IMenuButtonItemsVisibility;
    };
    renderMode: RenderMode;
    activeHeaderIndex: number | null;
    selectedWidgetRef: ObjRef | undefined;
    configurationPanelOpened: boolean;
}

export const uiInitialState: UiState = {
    scheduleEmailManagementDialog: {
        open: false,
    },
    scheduleEmailDialog: {
        open: false,
        defaultAttachmentRef: undefined,
    },
    saveAsDialog: {
        open: false,
    },
    shareDialog: {
        open: false,
    },
    deleteDialog: {
        open: false,
    },
    filterBar: {
        expanded: false,
    },
    kpiAlerts: {
        highlightedWidgetRef: undefined,
        openedWidgetRef: undefined,
    },
    menuButton: {
        itemsVisibility: {},
    },
    renderMode: "view",
    activeHeaderIndex: null,
    selectedWidgetRef: undefined,
    configurationPanelOpened: true,
};
