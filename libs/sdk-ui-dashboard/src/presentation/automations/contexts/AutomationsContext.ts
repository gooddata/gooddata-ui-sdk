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
 * @beta
 */
export interface IAutomationsDateFilterConfig {
    /** Granularities from the dashboard's effective (resolved) date-filter configuration; the fallback when no tab-scoped value is available. */
    availableGranularities: DateFilterGranularity[];
    /** Date-filter options (presets) from the dashboard's effective (resolved) date-filter configuration; the fallback when no tab-scoped value is available. */
    dateFilterOptions: IDateFilterOptionsByType;
    /**
     * Granularities from the given dashboard tab's effective (resolved) date-filter configuration —
     * inherited settings included, not only tab-specific overrides. Empty when the tab has no
     * effective configuration, in which case the caller falls back to
     * {@link IAutomationsDateFilterConfig.availableGranularities}.
     */
    getGranularitiesForTab: (tabId: string) => DateFilterGranularity[];
    /**
     * Date-filter options from the given dashboard tab's effective (resolved) date-filter
     * configuration — inherited settings included, not only tab-specific overrides. Undefined when
     * the tab has no effective configuration, in which case the caller falls back to
     * {@link IAutomationsDateFilterConfig.dateFilterOptions}.
     */
    getOptionsForTab: (tabId: string) => IDateFilterOptionsByType | undefined;
}

/**
 * Workspace and dashboard parameter data provided by the dashboard connector so that the shared
 * automationFilters hooks do not need to read dashboard selectors directly.
 *
 * @beta
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
 * @beta
 */
export interface IAutomationsContextValue {
    /** Workspace locale for message formatting and number/date localization; from selectLocale. */
    locale: ILocale;
    /** Number formatting separators (decimal/thousands); from selectSeparators. */
    separators: ISeparators;
    /** Workspace/dashboard feature settings object; from selectSettings. */
    settings?: ISettings;
    /** Workspace attribute catalog, including computed attributes; from selectCatalogAttributesWithComputed. */
    catalogAttributes: ICatalogAttribute[];
    /** Workspace date dataset catalog; from selectCatalogDateDatasets. */
    catalogDateDatasets: ICatalogDateDataset[];
    /** Workspace measure catalog; from selectCatalogMeasures. */
    catalogMeasures: ICatalogMeasure[];
    /** Date filter granularities and presets for automation date filter chips; see {@link IAutomationsDateFilterConfig}. */
    dateFilterConfig: IAutomationsDateFilterConfig;
    /**
     * Persisted common date filter config for the active tab, used for its custom title;
     * from selectPersistedDashboardFilterContextDateFilterConfig.
     */
    dateFilterContextConfig: IDashboardDateFilterConfig | undefined;
    /** Dashboard-level attribute filter config overrides for the active tab; from selectAttributeFilterConfigsOverrides. */
    attributeFilterConfigs: IDashboardAttributeFilterConfig[];
    /** Same as {@link IAutomationsContextValue.attributeFilterConfigs}, keyed by tab identifier; from selectAttributeFilterConfigsOverridesByTab. */
    attributeFilterConfigsByTab: Record<string, IDashboardAttributeFilterConfig[]>;
    /** Attribute filter selection type (single/multi) by local identifier for the active tab; from selectAttributeFilterConfigsSelectionTypeMap. */
    attributeFilterSelectionTypeMap: Map<string, DashboardAttributeFilterSelectionType | undefined>;
    /** Same as {@link IAutomationsContextValue.attributeFilterSelectionTypeMap}, keyed by tab identifier; from selectAttributeFilterConfigsSelectionTypeMapByTab. */
    attributeFilterSelectionTypeMapByTab: Record<
        string,
        Map<string, DashboardAttributeFilterSelectionType | undefined>
    >;
    /** Per-dataset (dimension) date filter config overrides for the active tab; from selectDateFilterConfigsOverrides. */
    dateFilterConfigs: IDashboardDateFilterConfigItem[];
    /** Same as {@link IAutomationsContextValue.dateFilterConfigs}, keyed by tab identifier; from selectDateFilterConfigsOverridesByTab. */
    dateFilterConfigsByTab: Record<string, IDashboardDateFilterConfigItem[]>;
    /** Dashboard-level common (whole-dashboard) date filter config override, keyed by tab identifier; from selectDateFilterConfigOverridesByTab. */
    dateFilterConfigOverridesByTab: Record<string, IDashboardDateFilterConfig | undefined>;
    /** Dashboard-level measure value filter config overrides for the active tab; from selectMeasureValueFilterConfigsOverrides. */
    measureValueFilterConfigs: IDashboardMeasureValueFilterConfig[];
    /** Same as {@link IAutomationsContextValue.measureValueFilterConfigs}, keyed by tab identifier; from selectMeasureValueFilterConfigsOverridesByTab. */
    measureValueFilterConfigsByTab: Record<string, IDashboardMeasureValueFilterConfig[]>;
    /** Local identifier of the dashboard's common date filter, when the automation-available filters include one; from selectAutomationCommonDateFilterId. */
    commonDateFilterId: string | undefined;
    /** Dashboard filters configured as read-only (locked); from selectDashboardLockedFilters. */
    lockedFilters: FilterContextItem[];
    /** Dashboard filters configured as hidden; from selectDashboardHiddenFilters. */
    hiddenFilters: FilterContextItem[];
    /** Dashboard's applied filters with cross-filtering filters removed; from selectAllDashboardFiltersWithoutCrossFiltering. */
    availableFilters: FilterContextItem[];
    /** Whether the user may not read the object a filter filters by. Such a filter is kept in the automation, but the filter bar reports it as a count instead of rendering it. */
    isFilterRestricted: (filter: FilterContextItem) => boolean;
    /** Automation-available filters structured per dashboard tab, for whole-dashboard automations on a tabbed dashboard; from selectAutomationFiltersByTab. */
    automationFiltersByTab: IAutomationFiltersTab[];
    /** Automation-available filters with empty (all-values) filters removed, except restricted ones; preselects filters for a new automation. From selectAutomationDefaultSelectedFilters. */
    defaultSelectedFilters: FilterContextItem[];
    /** Dashboard filters available to an automation — hidden filters removed, common date filter included; from selectAutomationAvailableDashboardFilters. */
    automationAvailableFilters: FilterContextItem[];
    /**
     * Maximum number of recipients allowed on an automation, derived from the recipient-count
     * entitlement (`Infinity` when the unlimited-recipients entitlement is present); from
     * selectMaxAutomationRecipients.
     */
    maxAutomationsRecipients: number;
    /**
     * Whether the dashboard is opened at a past execution timestamp (a scheduled run's historical
     * snapshot); disables create/save actions in the dialogs. Derived from selectExecutionTimestamp.
     */
    isExecutionTimestampMode: boolean;
    /** Whether the workspace's minimum-recurrence entitlement permits hourly schedules; derived from selectEntitlementMinimumRecurrenceMinutes. */
    allowHourlyRecurrence: boolean;
    /** The logged-in user; from selectCurrentUser. */
    currentUser: IUser;
    /** The workspace's configured first day of the week; from selectWeekStart. */
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
    /** Whether the dashboard is white-labeled (hides GoodData branding and help links); from selectIsWhiteLabeled. */
    isWhiteLabeled: boolean;
    /** Whether the dialog header renders a secondary title row below the main title; always true in the current hydration. */
    isSecondaryTitleVisible: boolean;
    /** External (non-workspace) recipient the dialog is scoped to, when opened via an external share link; from selectExternalRecipient. */
    externalRecipient: string | undefined;
    /** Feature flags and permissions gating automation dialog behavior. */
    features: {
        /** Whether the current user may create new automations; gates the management dialogs' create button. From selectCanCreateAutomation. */
        canCreateAutomation: boolean;
        /** Whether the "once per interval" alert trigger option is offered; from selectEnableAlertOncePerInterval. */
        enableAlertOncePerInterval: boolean;
        /** Whether anomaly-detection alert conditions are offered; from selectEnableAnomalyDetectionAlert. */
        enableAnomalyDetectionAlert: boolean;
        /** Whether the current user may use the AI assistant; combined with enableAnomalyDetectionAlert to gate anomaly-detection alert conditions. From selectCanUseAiAssistant. */
        canUseAiAssistant: boolean;
        /** Whether the current user may manage the workspace; from selectCanManageWorkspace. */
        canManageWorkspace: boolean;
        /** Whether scheduled slideshow (PDF slides) exports are offered; from selectEnableSlideshowExports. */
        enableSlideshowExports: boolean;
        /** Whether the automation evaluation-mode setting is enabled; from selectEnableAutomationEvaluationMode. */
        enableAutomationEvaluationMode: boolean;
    };
    /** Workspace parameter catalog and effective dashboard parameter values for automations; see {@link IAutomationsParameters}. */
    parameters: IAutomationsParameters;
    /**
     * Local identifiers of the dashboard's tabs, in layout order; empty when the dashboard has none.
     * Narrowed from selectTabs (`ITabState[] | undefined`) because every consumer only ever reads
     * `localIdentifier`, and all of them already coalesce `undefined` to `[]`.
     */
    tabIds: string[];
    /** Maps a widget's localIdentifier to the localIdentifier of the tab that owns it. */
    widgetLocalIdToTabIdMap: Record<string, string>;
    /** Looks up a catalog attribute (or date attribute) by ref; backed by selectAllCatalogAttributesMap. Used to resolve attribute names for filter labels. */
    getCatalogAttributeByRef: (ref: ObjRef) => ICatalogAttribute | ICatalogDateAttribute | undefined;
    /**
     * Looks up an attribute filter's display form by ref, preferring the dashboard's own attribute
     * filter display forms before falling back to the workspace catalog; combines
     * selectAttributeFilterDisplayFormsMap and selectAllCatalogDisplayFormsMap.
     */
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
 * @beta
 */
export const AutomationsContextProvider = AutomationsContext.Provider;

/**
 * Reads the automation dialogs' shared context.
 *
 * The alerting and scheduled-email dialogs (create/edit and management) render inside this context and
 * read the workspace catalog, filter configuration, locale, formatting, and other cross-dialog data from
 * here.
 *
 * @beta
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
