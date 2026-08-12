// (C) 2021-2026 GoodData Corporation

import { type Identifier, type ObjRef, type Uri } from "@gooddata/sdk-model";

import { type DraggableLayoutItem } from "../../../presentation/dragAndDrop/types.js";
import {
    type DashboardDensity,
    type DropZoneType,
    type IAlertDialogContext,
    type ILayoutItemPath,
    type ILayoutSectionPath,
    type IMenuButtonItemsVisibility,
    type IScheduleEmailContext,
} from "../../../types.js";
import { type IDashboardWidgetOverlay } from "../../types/commonTypes.js";

/**
 * @alpha
 */
export interface IInvalidCustomUrlDrillParameterInfo {
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
export interface IUiState {
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
        context?: IAlertDialogContext;
    };
    alertsDialog: {
        open: boolean;
        returnFocusTo?: string;
        context?: IAlertDialogContext;
    };
    automationsManagement: {
        invalidationId: number;
    };
    saveAsDialog: {
        open: boolean;
    };
    settingsDialog: {
        open: boolean;
    };
    densityDialog: {
        open: boolean;
    };
    density: DashboardDensity;
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
        sanitizedDrillWidgetRefs: ObjRef[];
        invalidCustomUrlDrillParameterWidgets: IInvalidCustomUrlDrillParameterInfo[];
    };
    /**
     * Session-only ad-hoc timezone override selected by the viewer in view mode. Always a
     * concrete IANA timezone ID — never the browser-detected sentinel. Undefined means no
     * override is active (the dashboard/workspace configuration applies). This value is never
     * persisted with the dashboard.
     *
     * @alpha
     */
    timezoneOverride: string | undefined;
    timezoneDialog: {
        open: boolean;
    };
    /** @internal */
    draggingWidgetSource: DraggableLayoutItem | undefined;
    draggingWidgetTarget: ILayoutItemPath | undefined;
    /** @internal */
    draggingWidgetTriggeringDropZoneType: DropZoneType | undefined;
    widgetsOverlay: Record<string, IDashboardWidgetOverlay>;
    /**
     * Map of widget reference to the identifier of the active visualization.
     * This is used for VisualizationSwitcherWidget to track which visualization is currently selected.
     * @internal
     */
    visualizationSwitcherActiveVisualizations: Record<string, string>;
}

export const uiInitialState: IUiState = {
    scheduleEmailManagementDialog: {
        open: false,
    },
    scheduleEmailDialog: {
        open: false,
        defaultAttachmentRef: undefined,
    },
    alertsManagementDialog: {
        open: false,
        context: undefined,
    },
    alertsDialog: {
        open: false,
        returnFocusTo: undefined,
    },
    automationsManagement: {
        invalidationId: 0,
    },
    saveAsDialog: {
        open: false,
    },
    settingsDialog: {
        open: false,
    },
    densityDialog: {
        open: false,
    },
    density: "comfortable",
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
        sanitizedDrillWidgetRefs: [],
        invalidCustomUrlDrillParameterWidgets: [],
    },
    timezoneOverride: undefined,
    timezoneDialog: {
        open: false,
    },
    draggingWidgetSource: undefined,
    draggingWidgetTarget: undefined,
    draggingWidgetTriggeringDropZoneType: undefined,
    widgetsOverlay: {},
    visualizationSwitcherActiveVisualizations: {},
    ignoreExecutionTimestamp: false,
};
