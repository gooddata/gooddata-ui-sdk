// (C) 2026 GoodData Corporation

import { createContext, useContext } from "react";

import type {
    DashboardAttributeFilterConfigMode,
    DashboardDateFilterConfigMode,
    FilterContextItem,
    IAutomationMetadataObject,
    IAutomationMetadataObjectDefinition,
    IDashboardExportParameter,
    IExportTemplate,
    IInsight,
    INotificationChannelIdentifier,
    INotificationChannelMetadataObject,
    IWidget,
} from "@gooddata/sdk-model";

/**
 * Sub-context for the scheduled-email create/edit dialog.
 *
 * The connector hydrates this from dashboard state and provides the CRUD callbacks; the dialog and its
 * hooks read it instead of reaching into the dashboard store. That direction is enforced by the
 * `no-model-imports-in-clean-scheduled-email` rule in `.dependency-cruiser.js`.
 *
 * @alpha
 */
export interface IScheduledEmailDialogContextValue {
    widget?: IWidget;
    insight?: IInsight;
    widgetTitle?: string;
    dashboardId?: string;
    dashboardTitle: string;
    /**
     * Dashboard filters the export will use: the saved filters when editing, otherwise the currently
     * applied dashboard filters with hidden filters resolved.
     */
    dashboardFilters?: FilterContextItem[];
    /**
     * Raw dashboard hidden filters (selectDashboardHiddenFilters). Combined with edited filters via
     * getAppliedDashboardFilters/getAppliedWidgetFilters inside the dialog, mirroring the alerting context.
     */
    hiddenFilters: FilterContextItem[];
    commonDateFilterId?: string;
    /**
     * Effective export parameter overrides keyed by tab, scoped to the dialog's widget when present.
     * Hydrated by the connector, so the dialog tree reads no store selector for them.
     */
    exportParametersByTab: Record<string, IDashboardExportParameter[]>;
    /**
     * Organization-level export templates fetched in the connector (replaces the useExportTemplates
     * react hook read in the dialog).
     */
    exportTemplates: IExportTemplate[];
    /** Workspace date format (e.g. "MM/dd/yyyy"); from selectDateFormat. */
    dateFormat: string | undefined;
    /** Whether cross-filtering is active on the dashboard; from selectIsCrossFiltering. */
    isCrossFiltering: boolean;
    /** Effective mode for the common (dashboard-level) date filter. */
    commonDateFilterMode: DashboardDateFilterConfigMode;
    /** Effective mode map for per-dataset date filters (localIdentifier → mode). */
    dateFiltersModeMap: Map<string, DashboardDateFilterConfigMode>;
    /** Effective mode map for attribute filters (localIdentifier → mode). */
    attributeFiltersModeMap: Map<string, DashboardAttributeFilterConfigMode>;
    // CRUD — observer-hook semantics preserved by the dialog; these are the backend calls.
    createScheduledEmail(se: IAutomationMetadataObjectDefinition): Promise<IAutomationMetadataObject>;
    saveScheduledEmail(se: IAutomationMetadataObject): Promise<IAutomationMetadataObject>;
    deleteScheduledEmail(se: IAutomationMetadataObject): Promise<void>;
    /** The scheduled export being edited; undefined when creating a new one. */
    scheduledExportToEdit?: IAutomationMetadataObject;
    /** Notification channels available as scheduled-export destinations. */
    notificationChannels: INotificationChannelIdentifier[] | INotificationChannelMetadataObject[];
    /** True while the dialog's initial data (automations) is still loading. */
    isLoading: boolean;
}

const ScheduledEmailDialogContext = createContext<IScheduledEmailDialogContextValue | undefined>(undefined);

export const ScheduledEmailDialogContextProvider = ScheduledEmailDialogContext.Provider;

/**
 * Reads the scheduled-email create/edit dialog context.
 *
 * A replacement for the scheduled-email dialog renders inside this context and reads the dialog's widget
 * and insight, the dashboard filter context and export templates it should apply, the scheduled export
 * being edited, the available notification channels, and the create/save/delete callbacks from here.
 *
 * Some members exist to wire internal machinery (`exportParametersByTab`, `commonDateFilterMode`,
 * `dateFiltersModeMap`, `attributeFiltersModeMap`) and are not intended as a customization surface.
 *
 * @alpha
 */
export function useScheduledEmailDialogContext(): IScheduledEmailDialogContextValue {
    const ctx = useContext(ScheduledEmailDialogContext);
    if (!ctx) {
        throw new Error(
            "useScheduledEmailDialogContext must be used within ScheduledEmailDialogContextProvider",
        );
    }
    return ctx;
}
