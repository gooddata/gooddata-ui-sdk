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
    IDashboardParameter,
    IParameterMetadataObject,
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
 *
 * @alpha
 */
export interface IAutomationsDateFilterConfig {
    availableGranularities: DateFilterGranularity[];
    dateFilterOptions: IDateFilterOptionsByType;
    getGranularitiesForTab: (tabId: string) => DateFilterGranularity[];
    getOptionsForTab: (tabId: string) => IDateFilterOptionsByType | undefined;
}

/**
 * Workspace and dashboard parameter data provided by the dashboard connector so that the shared
 * automationFilters hooks do not need to read dashboard selectors directly.
 *
 * @alpha
 */
export interface IAutomationsParameters {
    /** Whether the parameters feature is enabled; from selectEnableParameters. */
    enabled: boolean;
    /** Whether STRING-typed parameters are enabled; from selectEnableStringParameters. */
    stringParametersEnabled: boolean;
    /** The workspace parameter catalog; from selectCatalogParameters. */
    catalog: IParameterMetadataObject[];
    /**
     * Whether the parameter catalog has finished loading. Before it has, every stored parameter
     * ref looks removed, so staleness checks must treat loading as not-stale.
     */
    catalogIsLoaded: boolean;
    /** Effective dashboard parameter values keyed by tab; from selectSmartPersistedTabsParameters. */
    dashboardParametersByTab: Record<string, IDashboardParameter[]>;
}

/**
 * Main context shared across all automation dialogs.
 * Only fields actively consumed by migrated leaves are listed here — add fields as each leaf migrates.
 *
 * @alpha
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
    maxAutomationsRecipients: number;
    isExecutionTimestampMode: boolean;
    allowHourlyRecurrence: boolean;
    currentUser: IUser;
    weekStart: WeekStart;
    /**
     * Automation timezone to display and compute schedule ("Starts on", alert crons, next-run):
     * the effective dashboard timezone when one is defined, otherwise the workspace setting.
     * Initial value for new schedule is same as exportTimezones.effectiveTimezone,
     * but then can be never changed for existing schedule.
     * Logic that needs to know where the timezone came from should use {@link IAutomationsContextValue.exportTimezones} instead.
     */
    timezone: string | undefined;
    /**
     * Timezone inputs of the scheduled-export "Time zone" section, read from the dashboard store
     * by the connectors layer — the scheduledEmail tree must not touch the store itself.
     */
    exportTimezones?: {
        /**
         * The enableTimezoneChange setting.
         */
        isTimezoneFeatureEnabled: boolean;
        /**
         * Whether the dashboard allows the view-mode timezone override; gates the whole section.
         */
        allowUserOverrideInViewMode: boolean;
        /**
         * The dashboard's stored timezone configuration id (may be the browser-detected sentinel).
         */
        configuredTimezoneId: string | undefined;
        /**
         * The workspace/organization settings-hierarchy timezone.
         */
        workspaceTimezone: string | undefined;
        /**
         * The effective dashboard execution timezone (override wins over config, sentinel
         * resolved).
         */
        effectiveTimezone: string | undefined;
        /**
         * Timezone only when the backend cannot derive it at run time (view-mode override or
         * resolved browser detection); undefined for an explicitly configured dashboard timezone.
         */
        scheduledExportTimezone: string | undefined;
    };
    isWhiteLabeled: boolean;
    isSecondaryTitleVisible: boolean;
    externalRecipient: string | undefined;
    features: {
        canCreateAutomation: boolean;
        enableAlertOncePerInterval: boolean;
        enableAnomalyDetectionAlert: boolean;
        canUseAiAssistant: boolean;
        canManageWorkspace: boolean;
        enableSlideshowExports: boolean;
        enableAutomationEvaluationMode: boolean;
    };
    parameters: IAutomationsParameters;
    /**
     * Local identifiers of the dashboard's tabs, in layout order; empty when the dashboard has none.
     * Narrowed from selectTabs (`ITabState[] | undefined`) because every consumer only ever reads
     * `localIdentifier`, and all of them already coalesce `undefined` to `[]`.
     */
    tabIds: string[];
    /** Maps a widget's localIdentifier to the localIdentifier of the tab that owns it. */
    widgetLocalIdToTabIdMap: Record<string, string>;
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

/**
 * Provides the automation dialogs' shared context.
 *
 * The dashboard's connectors mount the original value once per tree. Exported so a
 * context-decorator component (`CustomAutomationsContextDecoratorComponent`) can re-provide a
 * decorated value read from `useAutomationsContext()`; it is not a way to run the dialogs outside
 * a dashboard.
 *
 * @alpha
 */
export const AutomationsContextProvider = AutomationsContext.Provider;

/**
 * Reads the automation dialogs' shared context.
 *
 * The alerting and scheduled-email dialogs (create/edit and management) render inside this context and
 * read the workspace catalog, filter configuration, locale, formatting, and other cross-dialog data from
 * here.
 *
 * @alpha
 */
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
