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
    IWidget,
} from "@gooddata/sdk-model";

/**
 * Sub-context for the scheduled-email create/edit dialog.
 * Shape grows during Phase 2 migration as DefaultScheduledEmailDialog and its hooks are migrated.
 * The connector hydrates this from dashboard state and provides the CRUD callbacks.
 */
export interface IScheduledEmailDialogContextValue {
    widget?: IWidget;
    insight?: IInsight;
    widgetTitle?: string;
    dashboardId?: string;
    dashboardTitle: string;
    dashboardFilters?: FilterContextItem[];
    /**
     * Raw dashboard hidden filters (selectDashboardHiddenFilters). Combined with edited filters via
     * getAppliedDashboardFilters/getAppliedWidgetFilters inside the dialog, mirroring the alerting context.
     */
    hiddenFilters: FilterContextItem[];
    widgetLocalIdToTabIdMap: Record<string, string>;
    commonDateFilterId?: string;
    /**
     * Effective export parameter overrides keyed by tab, scoped to the dialog's widget when present.
     * Replaces the direct selectExportEffectiveParameters read in useEditScheduledEmail.
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
    /** Whether the dashboard has more than one tab; derived from selectTabs. */
    hasMultipleTabs: boolean;
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
}

const ScheduledEmailDialogContext = createContext<IScheduledEmailDialogContextValue | undefined>(undefined);

export const ScheduledEmailDialogContextProvider = ScheduledEmailDialogContext.Provider;

export function useScheduledEmailDialogContext(): IScheduledEmailDialogContextValue {
    const ctx = useContext(ScheduledEmailDialogContext);
    if (!ctx) {
        throw new Error(
            "useScheduledEmailDialogContext must be used within ScheduledEmailDialogContextProvider",
        );
    }
    return ctx;
}
