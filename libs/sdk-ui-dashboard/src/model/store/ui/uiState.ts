// (C) 2021-2025 GoodData Corporation
import { ObjRef, Identifier, Uri } from "@gooddata/sdk-model";

import {
    IMenuButtonItemsVisibility,
    ILayoutItemPath,
    ILayoutSectionPath,
    IAlertDialogContext,
    IScheduleEmailContext,
    DropZoneType,
} from "../../../types.js";
import { DraggableLayoutItem } from "../../../presentation/dragAndDrop/types.js";
import { IDashboardWidgetOverlay } from "../../types/commonTypes.js";

/**
 * @alpha
 */
export interface InvalidCustomUrlDrillParameterInfo {
    widgetId: Identifier;
    widgetUri: Uri;
    widgetRef: ObjRef;
    drillsWithInvalidParametersLocalIds: string[];
    showMessage: boolean;
}

/**
 * @beta
 */
export type FilterViewDialogMode = "list" | "add";

/**
 * @beta
 */
export interface UiState {
    scheduleEmailManagementDialog: {
        open: boolean;
        context?: IScheduleEmailContext;
    };
    scheduleEmailDialog: {
        open: boolean;
        defaultAttachmentRef: ObjRef | undefined;
        returnFocusTo?: string;
        context?: IScheduleEmailContext;
    };
    alertsManagementDialog: {
        open: boolean;
    };
    alertsDialog: {
        open: boolean;
        context?: IAlertDialogContext;
    };
    saveAsDialog: {
        open: boolean;
    };
    settingsDialog: {
        open: boolean;
    };
    shareDialog: {
        open: boolean;
    };
    deleteDialog: {
        open: boolean;
    };
    widgetDeleteDialog: {
        open: boolean;
        widgetRef: ObjRef | undefined;
    };
    filterViews: {
        open: boolean;
        mode: FilterViewDialogMode;
    };
    kpiDeleteDialog: {
        /**
         * Undefined means the dialog should be closed
         */
        widgetCoordinates: ILayoutItemPath | undefined;
    };
    cancelEditModeDialog: {
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
    selectedWidgetRef: ObjRef | undefined;
    configurationPanelOpened: boolean;
    widgetDateDatasetAutoSelect: boolean;
    insightListLastUpdateRequested: number;
    widgetsLoadingAdditionalData: ObjRef[];
    filterAttributeSelectionOpen: boolean;
    selectedFilterIndex: number | undefined;
    activeSection: ILayoutSectionPath | undefined;
    ignoreExecutionTimestamp: boolean;
    filterValidationMessages: {
        incompatibleDefaultFiltersOverride: boolean;
    };
    /** @alpha */
    drillValidationMessages: {
        invalidDrillWidgetRefs: ObjRef[];
        invalidCustomUrlDrillParameterWidgets: InvalidCustomUrlDrillParameterInfo[];
    };
    /** @internal */
    draggingWidgetSource: DraggableLayoutItem | undefined;
    draggingWidgetTarget: ILayoutItemPath | undefined;
    /** @internal */
    draggingWidgetTriggeringDropZoneType: DropZoneType | undefined;
    widgetsOverlay: Record<string, IDashboardWidgetOverlay>;
}

export const uiInitialState: UiState = {
    scheduleEmailManagementDialog: {
        open: false,
    },
    scheduleEmailDialog: {
        open: false,
        defaultAttachmentRef: undefined,
    },
    alertsManagementDialog: {
        open: false,
    },
    alertsDialog: {
        open: false,
    },
    saveAsDialog: {
        open: false,
    },
    settingsDialog: {
        open: false,
    },
    shareDialog: {
        open: false,
    },
    deleteDialog: {
        open: false,
    },
    widgetDeleteDialog: {
        open: false,
        widgetRef: undefined,
    },
    filterViews: {
        open: false,
        mode: "list",
    },
    kpiDeleteDialog: {
        widgetCoordinates: undefined,
    },
    cancelEditModeDialog: {
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
    selectedWidgetRef: undefined,
    configurationPanelOpened: true,
    widgetDateDatasetAutoSelect: false,
    insightListLastUpdateRequested: 0,
    widgetsLoadingAdditionalData: [],
    filterAttributeSelectionOpen: false,
    selectedFilterIndex: undefined,
    activeSection: undefined,
    filterValidationMessages: {
        incompatibleDefaultFiltersOverride: false,
    },
    drillValidationMessages: {
        invalidDrillWidgetRefs: [],
        invalidCustomUrlDrillParameterWidgets: [],
    },
    draggingWidgetSource: undefined,
    draggingWidgetTarget: undefined,
    draggingWidgetTriggeringDropZoneType: undefined,
    widgetsOverlay: {},
    ignoreExecutionTimestamp: false,
};
