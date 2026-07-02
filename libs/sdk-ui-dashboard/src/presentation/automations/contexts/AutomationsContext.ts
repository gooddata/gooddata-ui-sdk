// (C) 2026 GoodData Corporation

import { createContext, useContext } from "react";

import type {
    DashboardAttributeFilterSelectionType,
    DateFilterGranularity,
    FilterContextItem,
    IAttributeDisplayFormMetadataObject,
    ICatalogAttribute,
    ICatalogDateAttribute,
    ICatalogDateDataset,
    ICatalogMeasure,
    IDashboardAttributeFilterConfig,
    IDashboardDateFilterConfig,
    IDashboardDateFilterConfigItem,
    IDashboardMeasureValueFilterConfig,
    ISeparators,
    ISettings,
    IUser,
    ObjRef,
    WeekStart,
} from "@gooddata/sdk-model";
import type { ILocale } from "@gooddata/sdk-ui";
import type { IDateFilterOptionsByType } from "@gooddata/sdk-ui-filters";

import type { IAutomationFiltersTab } from "../../../model/store/filtering/types.js";

/**
 * Date filter configuration provided by the dashboard connector so that AutomationDateFilter
 * does not need to read dashboard selectors directly.
 */
export interface IAutomationsDateFilterConfig {
    availableGranularities: DateFilterGranularity[];
    dateFilterOptions: IDateFilterOptionsByType;
    getGranularitiesForTab: (tabId: string) => DateFilterGranularity[];
    getOptionsForTab: (tabId: string) => IDateFilterOptionsByType | undefined;
}

/**
 * Main context shared across all automation dialogs.
 * Only fields actively consumed by migrated leaves are listed here — add fields as each leaf migrates.
 */
export interface IAutomationsContextValue {
    locale: ILocale;
    separators: ISeparators;
    settings?: ISettings;
    catalogAttributes: ICatalogAttribute[];
    catalogDateDatasets: ICatalogDateDataset[];
    catalogMeasures: ICatalogMeasure[];
    dateFilterConfig: IAutomationsDateFilterConfig;
    dateFilterContextConfig: IDashboardDateFilterConfig | undefined;
    attributeFilterConfigs: IDashboardAttributeFilterConfig[];
    attributeFilterConfigsByTab: Record<string, IDashboardAttributeFilterConfig[]>;
    attributeFilterSelectionTypeMap: Map<string, DashboardAttributeFilterSelectionType | undefined>;
    attributeFilterSelectionTypeMapByTab: Record<
        string,
        Map<string, DashboardAttributeFilterSelectionType | undefined>
    >;
    dateFilterConfigs: IDashboardDateFilterConfigItem[];
    dateFilterConfigsByTab: Record<string, IDashboardDateFilterConfigItem[]>;
    dateFilterConfigOverridesByTab: Record<string, IDashboardDateFilterConfig | undefined>;
    measureValueFilterConfigs: IDashboardMeasureValueFilterConfig[];
    measureValueFilterConfigsByTab: Record<string, IDashboardMeasureValueFilterConfig[]>;
    commonDateFilterId: string | undefined;
    lockedFilters: FilterContextItem[];
    hiddenFilters: FilterContextItem[];
    availableFilters: FilterContextItem[];
    automationFiltersByTab: IAutomationFiltersTab[];
    defaultSelectedFilters: FilterContextItem[];
    automationAvailableFilters: FilterContextItem[];
    enableNewScheduledExport: boolean;
    maxAutomationsRecipients: number;
    isExecutionTimestampMode: boolean;
    allowHourlyRecurrence: boolean;
    currentUser: IUser;
    weekStart: WeekStart;
    timezone: string | undefined;
    isWhiteLabeled: boolean;
    isSecondaryTitleVisible: boolean;
    externalRecipient: string | undefined;
    features: {
        canCreateAutomation: boolean;
        enableAlertOncePerInterval: boolean;
        enableAnomalyDetectionAlert: boolean;
        canUseAiAssistant: boolean;
        canManageWorkspace: boolean;
        enableCustomizableCsvDelimiter: boolean;
        enableSlideshowExports: boolean;
        enableAutomationEvaluationMode: boolean;
    };
    getCatalogAttributeByRef: (ref: ObjRef) => ICatalogAttribute | ICatalogDateAttribute | undefined;
    getAttributeFilterDisplayForm: (displayForm: ObjRef) => IAttributeDisplayFormMetadataObject | undefined;
    /**
     * Element ID to return focus to when the scheduled-email dialog closes.
     * Shared by both the create/edit dialog and the management dialog tree via
     * useScheduleEmailDialogAccessibility.
     */
    scheduleEmailDialogReturnFocusTo?: string;
    /**
     * Returns true when a widget with the given ref still exists on the dashboard layout.
     * Bridges identifier↔URI mismatches the same way as selectWidgetByRef.
     * NOTE: do NOT narrow to isWidget() here — this is a pure existence check on the ObjRefMap.
     */
    widgetExistsByRef: (ref: ObjRef | undefined) => boolean;
}

const AutomationsContext = createContext<IAutomationsContextValue | undefined>(undefined);

export const AutomationsContextProvider = AutomationsContext.Provider;

export function useAutomationsContext(): IAutomationsContextValue {
    const ctx = useContext(AutomationsContext);
    if (!ctx) {
        throw new Error(
            "useAutomationsContext must be used within an AutomationsContextProvider. " +
                "The automation dialogs (e.g. DefaultAlertingDialog) are pure context consumers; " +
                "render them inside a Dashboard — which supplies the provider via the alerting " +
                "connector — or wrap them in AutomationsContextProvider yourself.",
        );
    }
    return ctx;
}
