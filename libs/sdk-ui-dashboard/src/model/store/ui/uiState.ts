// (C) 2021-2022 GoodData Corporation
import { ObjRef } from "@gooddata/sdk-model";

import { ILayoutCoordinates, IMenuButtonItemsVisibility } from "../../../types";

/**
 * @alpha
 */
export interface IWidgetPlaceholderSpec {
    sectionIndex: number;
    itemIndex: number;
    size: {
        width: number;
        height: number;
    };
    type: "widget" | "insight" | "kpi";
}

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
    kpiDeleteDialog: {
        /**
         * Undefined means the dialog should be closed
         */
        widgetCoordinates: ILayoutCoordinates | undefined;
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
    selectedWidgetRef: ObjRef | undefined;
    configurationPanelOpened: boolean;
    kpiDateDatasetAutoOpen: boolean;
    widgetPlaceholder: IWidgetPlaceholderSpec | undefined;
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
    kpiDeleteDialog: {
        widgetCoordinates: undefined,
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
    selectedWidgetRef: undefined,
    configurationPanelOpened: true,
    kpiDateDatasetAutoOpen: false,
    widgetPlaceholder: undefined,
};
