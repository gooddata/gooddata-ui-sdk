// (C) 2021-2025 GoodData Corporation

import { createSelector } from "@reduxjs/toolkit";
import { invariant } from "ts-invariant";

import {
    type DashboardFiltersApplyMode,
    IColorPalette,
    IDateFilterConfig,
    ISeparators,
    ISettings,
    PlatformEdition,
    WeekStart,
} from "@gooddata/sdk-model";
import { ILocale } from "@gooddata/sdk-ui";

import {
    DashboardFocusObject,
    ObjectAvailabilityConfig,
    ResolvedDashboardConfig,
} from "../../types/commonTypes.js";
import { selectSupportsAttributeHierarchies } from "../backendCapabilities/backendCapabilitiesSelectors.js";
import { DashboardSelector, DashboardState } from "../types.js";

const selectSelf = createSelector(
    (state: DashboardState) => state,
    (state) => state.config,
);

/**
 * Returns dashboard's config.
 *
 * @remarks
 * It is expected that the selector is called only after the config state
 * is correctly initialized. Invocations before initialization lead to invariant errors.
 *
 * @public
 */
export const selectConfig: DashboardSelector<ResolvedDashboardConfig> = createSelector(
    selectSelf,
    (configState) => {
        invariant(configState.config, "attempting to access uninitialized config state");

        return configState.config!;
    },
);

/**
 * Returns workspace-level configuration for the of the date filter options and presets.
 *
 * @remarks
 * Note: this configuration SHOULD be further augmented by the dashboard-level overrides to obtain
 * the effective date filter configuration.
 *
 * @public
 */
export const selectDateFilterConfig: DashboardSelector<IDateFilterConfig> = createSelector(
    selectConfig,
    (state) => {
        return state.dateFilterConfig ?? undefined;
    },
);

/**
 * Returns settings that are in effect for the current dashboard.
 *
 * @public
 */
export const selectSettings: DashboardSelector<ISettings> = createSelector(selectConfig, (state) => {
    return state.settings ?? undefined;
});

/**
 * Returns locale to use for internationalization of the dashboard.
 *
 * @public
 */
export const selectLocale: DashboardSelector<ILocale> = createSelector(selectConfig, (state) => {
    return state.locale ?? undefined;
});

/**
 * Returns timezone
 *
 * @public
 */
export const selectTimezone: DashboardSelector<string | undefined> = createSelector(selectConfig, (state) => {
    return state.settings.timezone ?? undefined;
});

/**
 * Returns number separators to use when rendering numeric values on charts or KPIs.
 *
 * @public
 */
export const selectSeparators: DashboardSelector<ISeparators> = createSelector(selectConfig, (state) => {
    return state.separators ?? undefined;
});

/**
 * Returns the color palette for dashboard charts.
 *
 * @public
 */
export const selectColorPalette: DashboardSelector<IColorPalette> = createSelector(selectConfig, (state) => {
    return state.colorPalette ?? undefined;
});

/**
 * Returns the object availability configuration for this dashboard.
 *
 * @remarks
 * Only objects that match the availability criteria can appear in selections where user has pick
 * an object to use for some purpose (for instance metric for KPI or date dataset to filter by).
 *
 * @public
 */
export const selectObjectAvailabilityConfig: DashboardSelector<ObjectAvailabilityConfig> = createSelector(
    selectConfig,
    (state) => {
        return state.objectAvailability ?? undefined;
    },
);

/**
 * Returns Mapbox token.
 *
 * @internal
 */
export const selectMapboxToken: DashboardSelector<string | undefined> = createSelector(
    selectConfig,
    (state) => {
        return state.mapboxToken ?? undefined;
    },
);

/**
 * Returns AgGrid token.
 *
 * @internal
 */
export const selectAgGridToken: DashboardSelector<string | undefined> = createSelector(
    selectConfig,
    (state) => {
        return state.agGridToken ?? undefined;
    },
);

/**
 * Returns week start day
 *
 * @internal
 */
export const selectWeekStart: DashboardSelector<WeekStart> = createSelector(selectConfig, (state) => {
    if (state.settings == null) {
        return "Sunday" as const;
    }
    if (state.settings["enableNewUIWeekStartChange"] && state.settings["weekStartOnMondayEnabled"]) {
        return "Monday" as const;
    }
    return state.settings?.weekStart ?? ("Sunday" as const);
});

/**
 * Returns whether the Dashboard is executed in read-only mode.
 *
 * @remarks
 * Read-only mode disables any interactions that can alter the backend data.
 *
 * @public
 */
export const selectIsReadOnly: DashboardSelector<boolean> = createSelector(selectConfig, (state) => {
    return state.isReadOnly ?? false;
});

/**
 * Returns whether the Dashboard is executed in embedded context.
 *
 * @remarks
 * In embedded mode, some interactions may be disabled.
 *
 * @public
 */
export const selectIsEmbedded: DashboardSelector<boolean> = createSelector(selectConfig, (state) => {
    return state.isEmbedded ?? false;
});

/**
 * Returns whether the Dashboard is rendered in the export mode.
 * In export mode, some components can be hidden, or rendered differently.
 *
 * @public
 */
export const selectIsExport: DashboardSelector<boolean> = createSelector(selectConfig, (state) => {
    return state.isExport ?? false;
});

/**
 * Returns whether the Dashboard is white labeled.
 *
 * @internal
 */
export const selectIsWhiteLabeled: DashboardSelector<boolean> = createSelector(selectConfig, (state) => {
    return state.isWhiteLabeled ?? false;
});

/**
 * Returns whether the default drills configured on the widgets or implicit drills (eg. drill down) are disabled.
 * This option does not affect drilling enabled by drillableItems.
 *
 * @public
 */
export const selectDisableDefaultDrills: DashboardSelector<boolean> = createSelector(
    selectConfig,
    (state) => {
        return state.disableDefaultDrills ?? false;
    },
);

/**
 * Returns whether filter values in drill events should be resolved.
 *
 * @public
 */
export const selectEnableFilterValuesResolutionInDrillEvents: DashboardSelector<boolean> = createSelector(
    selectConfig,
    (state) => {
        return state.enableFilterValuesResolutionInDrillEvents ?? false;
    },
);

/**
 * Returns whether the save as new button is hidden.
 *
 * @internal
 */
export const selectIsSaveAsNewButtonHidden: DashboardSelector<boolean> = createSelector(
    selectConfig,
    (state) => {
        return state.hideSaveAsNewButton ?? false;
    },
);

//
// FEATURE FLAGS
//

/**
 * Returns date format.
 *
 * @public
 */
export const selectDateFormat: DashboardSelector<string | undefined> = createSelector(
    selectConfig,
    (state) => {
        return state.settings?.responsiveUiDateFormat ?? undefined;
    },
);

/**
 * Returns whether the current user can schedule emails.
 *
 * @public
 */
export const selectEnableKPIDashboardSchedule: DashboardSelector<boolean> = createSelector(
    selectConfig,
    (state) => {
        return state.settings?.enableKPIDashboardSchedule ?? false;
    },
);

/**
 * Returns whether the current user can share scheduled email to other recipients.
 *
 * @public
 */
export const selectEnableKPIDashboardScheduleRecipients: DashboardSelector<boolean> = createSelector(
    selectConfig,
    (state) => {
        return state.settings?.enableKPIDashboardScheduleRecipients ?? false;
    },
);

/**
 * Returns current platform edition.
 *
 * @public
 */
export const selectPlatformEdition: DashboardSelector<PlatformEdition> = createSelector(
    selectConfig,
    (state) => {
        return state.settings?.platformEdition ?? "enterprise";
    },
);

/**
 * Returns whether company logo should be visible in embedded dashboard.
 *
 * @public
 */
export const selectEnableCompanyLogoInEmbeddedUI: DashboardSelector<boolean> = createSelector(
    selectConfig,
    (state) => {
        return state.settings?.enableCompanyLogoInEmbeddedUI ?? false;
    },
);

/**
 * Returns whether the export to pdf is enabled.
 *
 * @public
 */
export const selectEnableKPIDashboardExportPDF: DashboardSelector<string | number | boolean | object> =
    createSelector(selectConfig, (state) => {
        return state.settings?.["enableKPIDashboardExportPDF"] ?? true;
    });

/**
 * Returns whether the drill to dashboard is enabled.
 *
 * @public
 */
export const selectEnableKPIDashboardDrillToDashboard: DashboardSelector<boolean> = createSelector(
    selectConfig,
    (state) => {
        return state.settings?.enableKPIDashboardDrillToDashboard ?? false;
    },
);

/**
 * Returns whether the save as new dashboard functionality is enabled.
 *
 * @public
 */
export const selectEnableKPIDashboardSaveAsNew: DashboardSelector<boolean> = createSelector(
    selectConfig,
    (state) => {
        return state.settings?.enableKPIDashboardSaveAsNew ?? false;
    },
);

/**
 * Returns whether implicit drill to attributes url enabled
 *
 * @public
 */
export const selectEnableClickableAttributeURL: DashboardSelector<boolean> = createSelector(
    selectConfig,
    (state) => {
        return state.settings?.enableClickableAttributeURL ?? true;
    },
);

/**
 * Returns whether drill to url is enabled
 *
 * @public
 */
export const selectEnableKPIDashboardDrillToURL: DashboardSelector<boolean> = createSelector(
    selectConfig,
    (state) => {
        return state.settings?.enableKPIDashboardDrillToURL ?? false;
    },
);

/**
 * Returns whether drill to insight is enabled
 *
 * @public
 */
export const selectEnableKPIDashboardDrillToInsight: DashboardSelector<boolean> = createSelector(
    selectConfig,
    (state) => {
        return state.settings?.enableKPIDashboardDrillToInsight ?? false;
    },
);

/**
 * Returns whether implicit drill to attributes url enabled
 *
 * @public
 */
export const selectEnableKPIDashboardImplicitDrillDown: DashboardSelector<boolean> = createSelector(
    selectConfig,
    (state) => {
        return state.settings?.enableKPIDashboardImplicitDrillDown ?? false;
    },
);

/**
 * Returns whether drill fromAttribute is enabled
 *
 * @public
 */
export const selectEnableKPIDashboardDrillFromAttribute: DashboardSelector<boolean> = createSelector(
    selectConfig,
    (state) => {
        return state.settings?.enableKPIDashboardDrillFromAttribute ?? false;
    },
);

/**
 * Returns whether Kpi drills in embedded mode are disabled.
 *
 * @public
 */
export const selectHideKpiDrillInEmbedded: DashboardSelector<boolean> = createSelector(
    selectConfig,
    (state) => {
        return state.settings?.hideKpiDrillInEmbedded ?? false;
    },
);

/**
 * Returns whether insight export scheduling is enabled.
 *
 * @public
 */
export const selectEnableInsightExportScheduling: DashboardSelector<boolean> = createSelector(
    selectConfig,
    (state) => {
        return state.settings?.enableInsightExportScheduling ?? false;
    },
);

/**
 * @alpha
 */
export const selectEnableScheduling: DashboardSelector<boolean> = createSelector(selectConfig, (state) => {
    return state.settings?.enableScheduling ?? true;
});

/**
 * @alpha
 */
export const selectEnableAlerting: DashboardSelector<boolean> = createSelector(selectConfig, (state) => {
    return state.settings?.enableAlerting ?? true;
});

/**
 * @alpha
 */
export const selectEnableAlertAttributes: DashboardSelector<boolean> = createSelector(
    selectConfig,
    (state) => {
        return state.settings?.enableAlertAttributes ?? true;
    },
);

/**
 * @alpha
 */
export const selectEnableComparisonInAlerting: DashboardSelector<boolean> = createSelector(
    selectConfig,
    (state) => {
        return state.settings?.enableComparisonInAlerting ?? true;
    },
);

/**
 * @alpha
 */
export const selectEnableAutomations: DashboardSelector<boolean> = createSelector(
    selectEnableScheduling,
    selectEnableAlerting,
    (enableScheduling, enableAlerting) => {
        return enableScheduling || enableAlerting;
    },
);

/**
 * Returns whether analytical dashboard permissions are enabled
 *
 * @internal
 */
export const selectEnableAnalyticalDashboardPermissions: DashboardSelector<boolean> = createSelector(
    selectConfig,
    (state) => {
        return state.settings?.enableAnalyticalDashboardPermissions ?? true;
    },
);

/**
 * Returns whether custom widget heights are enabled
 *
 * @internal
 */
export const selectEnableWidgetCustomHeight: DashboardSelector<boolean> = createSelector(
    selectConfig,
    (state) => {
        return state.settings?.enableKDWidgetCustomHeight ?? false;
    },
);

/**
 * Returns whether we should call workspaces workspaces (true) or projects (false).
 *
 * @internal
 */
export const selectEnableRenamingProjectToWorkspace: DashboardSelector<boolean> = createSelector(
    selectConfig,
    (state) => {
        return !!(state.settings?.enableRenamingProjectToWorkspace ?? true);
    },
);

/**
 * Returns whether we should call measures metrics (true) or measures (false).
 *
 * @internal
 */
export const selectEnableRenamingMeasureToMetric: DashboardSelector<boolean> = createSelector(
    selectConfig,
    (state) => {
        return state.settings?.enableRenamingMeasureToMetric ?? true;
    },
);

/**
 * Returns whether we should hide the pixel perfect experience references.
 *
 * @internal
 */
export const selectShouldHidePixelPerfectExperience: DashboardSelector<string | number | boolean | object> =
    createSelector(selectConfig, (state) => {
        const isHidden = state.settings?.hidePixelPerfectExperience ?? true;
        const isEnabled = state.settings?.enablePixelPerfectExperience ?? false;
        return !isHidden && isEnabled;
    });

/**
 * Returns whether we should disable the underline in KPIs when they are drillable.
 *
 * @internal
 */
export const selectDisableKpiDashboardHeadlineUnderline: DashboardSelector<boolean> = createSelector(
    selectConfig,
    (state) => {
        return !!(state.settings?.disableKpiDashboardHeadlineUnderline ?? false);
    },
);

/**
 * Returns whether unfinished features are allowed.
 *
 * @internal
 */
export const selectAllowUnfinishedFeatures: DashboardSelector<boolean> = createSelector(
    selectConfig,
    (state) => state.allowUnfinishedFeatures || false,
);

/**
 * Returns whether creating new insight from dashboard is enabled.
 *
 * @internal
 */
export const selectAllowCreateInsightRequest: DashboardSelector<boolean> = createSelector(
    selectConfig,
    (state) => {
        return state.allowCreateInsightRequest ?? false;
    },
);

/**
 * Returns whether analytical designer is enabled.
 *
 * @internal
 */
export const selectIsAnalyticalDesignerEnabled: DashboardSelector<boolean> = createSelector(
    selectConfig,
    (state) => !!(state.settings?.["analyticalDesigner"] || false),
);

/**
 * Returns whether delete button in dashboard attribute filters is visible.
 *
 * @internal
 */
export const selectIsDeleteFilterButtonEnabled: DashboardSelector<boolean> = createSelector(
    selectConfig,
    (state) => !!(state.settings?.["enableKPIDashboardDeleteFilterButton"] || false),
);

/**
 * Returns whether dependent filters are enabled.
 *
 * @internal
 */
export const selectIsKPIDashboardDependentFiltersEnabled: DashboardSelector<boolean> = () => true;

/**
 * Returns whether new KD dependent filters are enabled.
 *
 * @internal
 */
export const selectEnableKDDependentFilters: DashboardSelector<boolean> = () => true;

/**
 * Returns whether KD dependent filters are enabled.
 *
 * @internal
 */
export const selectIsKDDependentFiltersEnabled: DashboardSelector<boolean> = createSelector(
    selectEnableKDDependentFilters,
    selectIsKPIDashboardDependentFiltersEnabled,
    (enableKDDependentFilters, isKPIDashboardDependentFiltersEnabled) => {
        return enableKDDependentFilters || isKPIDashboardDependentFiltersEnabled;
    },
);

/**
 * Returns whether choice of alternate display forms is enabled.
 *
 * @internal
 */
export const selectIsAlternativeDisplayFormSelectionEnabled: DashboardSelector<boolean> = createSelector(
    selectConfig,
    (state) => !!(state.settings?.enableAlternativeDisplayFormSelection || false),
);

/**
 * Returns whether share button is hidden.
 *
 * @internal
 */
export const selectIsShareButtonHidden: DashboardSelector<boolean> = createSelector(selectConfig, (state) => {
    return state.hideShareButton ?? false;
});

/**
 * Returns whether cross filtering is disabled by config
 *
 * @internal
 */
export const selectIsDisabledCrossFiltering: DashboardSelector<boolean> = createSelector(
    selectConfig,
    (state) => {
        return state.disableCrossFiltering ?? false;
    },
);

/**
 * Returns whether user filter reset is disabled by config
 *
 * @internal
 */
export const selectIsDisableUserFilterReset: DashboardSelector<boolean> = createSelector(
    selectConfig,
    (state) => {
        return state.disableUserFilterReset ?? false;
    },
);

/**
 * Returns whether drill down is enabled.
 *
 * On Bear, drill down is driven by isKPIDashboardImplicitDrillDown.
 * On Tiger, it is driven by attribute hierarchies, thus isAttribueHierarchiesEnabled.
 *
 * @internal
 */
export const selectIsDrillDownEnabled: DashboardSelector<boolean> = createSelector(
    selectEnableKPIDashboardImplicitDrillDown,
    selectSupportsAttributeHierarchies,
    (isKPIDashboardImplicitDrillDownEnabled, isAttributeHierarchiesEnabled) => {
        return isKPIDashboardImplicitDrillDownEnabled || isAttributeHierarchiesEnabled;
    },
);

/**
 * Returns whether the unrelated data datasets are shown.
 *
 * @internal
 */
export const selectEnableUnavailableItemsVisibility: DashboardSelector<boolean> = createSelector(
    selectConfig,
    (state) => {
        return (
            state.settings?.showHiddenCatalogItems ?? state.settings?.enableUnavailableItemsVisible ?? false
        );
    },
);

/**
 * Returns whether multiple date filters are enabled.
 *
 * @internal
 */
export const selectEnableMultipleDateFilters: DashboardSelector<boolean> = createSelector(
    selectConfig,
    (state) => {
        return state.settings?.enableMultipleDateFilters ?? true;
    },
);

/**
 * Returns whether rich text widgets are enabled.
 *
 * @internal
 */
export const selectEnableKDRichText: DashboardSelector<boolean> = createSelector(selectConfig, (state) => {
    return state.settings?.enableKDRichText ?? true;
});

/**
 * Returns whether KD cross filtering is enabled.
 *
 * @internal
 */
export const selectEnableKDCrossFiltering: DashboardSelector<boolean> = createSelector(
    selectConfig,
    (state) => {
        return state.settings?.enableKDCrossFiltering ?? false;
    },
);

/**
 * Returns whether KD attribute filter values validation/filtering is enabled.
 *
 * @internal
 */
export const selectEnableAttributeFilterValuesValidation: DashboardSelector<boolean> = createSelector(
    selectConfig,
    (state) => {
        return state.settings?.enableAttributeFilterValuesValidation ?? true;
    },
);

/**
 * Returns whether KD attribute filter by dates validation/filtering is enabled.
 *
 * @internal
 */
export const selectEnableKDAttributeFilterDatesValidation: DashboardSelector<boolean> = createSelector(
    selectConfig,
    (state) => {
        return state.settings?.enableKDAttributeFilterDatesValidation ?? true;
    },
);

/**
 * Returns whether attribute filter displays duplicated values when filter uses secondary label value.
 *
 * @internal
 */
export const selectEnableDuplicatedLabelValuesInAttributeFilter: DashboardSelector<boolean> = createSelector(
    selectConfig,
    (state) => {
        return state.settings?.enableDuplicatedLabelValuesInAttributeFilter ?? true;
    },
);

/**
 * Returns whether attribute filter displays duplicated values when filter uses secondary label value.
 *
 * @internal
 */
export const selectEnableImmediateAttributeFilterDisplayAsLabelMigration: DashboardSelector<boolean> =
    createSelector(selectConfig, (state) => {
        return state.settings?.enableImmediateAttributeFilterDisplayAsLabelMigration ?? false;
    });

/**
 * Returns whether rich text in descriptions is enabled.
 *
 * @internal
 */
export const selectEnableRichTextDescriptions: DashboardSelector<boolean> = createSelector(
    selectConfig,
    (state) => {
        return state.settings?.enableRichTextDescriptions ?? false;
    },
);

/**
 * Returns whether filter views are enabled.
 *
 * @internal
 */
export const selectEnableFilterViews: DashboardSelector<boolean> = createSelector(selectConfig, (state) => {
    return state.settings?.enableDashboardFilterViews ?? true;
});

/**
 * Returns whether filter views are enabled.
 *
 * @internal
 */
export const selectEnableAlertsEvaluationFrequencySetup: DashboardSelector<boolean> = createSelector(
    selectConfig,
    (state) => {
        return state.settings?.enableAlertsEvaluationFrequencySetup ?? true;
    },
);

/**
 * Returns whether rich text widgets are enabled.
 *
 * @internal
 */
export const selectEnableVisualizationSwitcher: DashboardSelector<boolean> = createSelector(
    selectConfig,
    (state) => {
        return state.settings?.enableKDVisualizationSwitcher ?? true;
    },
);

/**
 * Returns whether ignore cross-filtering enabled.
 *
 * @internal
 */
export const selectEnableIgnoreCrossFiltering: DashboardSelector<boolean> = createSelector(
    selectConfig,
    (state) => {
        return state.settings?.enableIgnoreCrossFiltering ?? true;
    },
);

/**
 * Returns whether cross filtering should use alias titles.
 *
 * @internal
 */
export const selectEnableCrossFilteringAliasTitles: DashboardSelector<boolean> = createSelector(
    selectConfig,
    (state) => {
        return state.settings?.enableCrossFilteringAliasTitles ?? false;
    },
);

/**
 * Returns whether in-platform notifications are enabled.
 *
 * @internal
 */
export const selectEnableInPlatformNotifications: DashboardSelector<boolean> = createSelector(
    selectConfig,
    (state) => {
        return state.settings?.enableInPlatformNotifications ?? true;
    },
);

/**
 * Returns dashboard focus object.
 *
 * @beta
 */
export const selectFocusObject: DashboardSelector<DashboardFocusObject> = createSelector(
    selectConfig,
    (state) => {
        return state.focusObject ?? {};
    },
);

/**
 * Returns whether open automation on load is enabled.
 *
 * @internal
 */
export const selectOpenAutomationOnLoad: DashboardSelector<boolean> = createSelector(
    selectConfig,
    (state) => {
        return state.openAutomationOnLoad ?? false;
    },
);

/**
 * Returns whether external recipients are enabled.
 *
 * @internal
 */
export const selectEnableExternalRecipients: DashboardSelector<boolean> = createSelector(
    selectConfig,
    (state) => {
        return state.settings?.enableExternalRecipients ?? true;
    },
);

/**
 *
 *
 * @internal
 */
export const selectEnableDashboardTabularExport: DashboardSelector<boolean> = createSelector(
    selectConfig,
    (state) => {
        return state.settings?.enableDashboardTabularExport ?? false;
    },
);

/**
 *
 *
 * @internal
 */
export const selectEnableOrchestratedTabularExports: DashboardSelector<boolean> = createSelector(
    selectConfig,
    (state) => {
        return state.settings?.enableOrchestratedTabularExports ?? false;
    },
);

/**
 * Returns whether drill dialog tooltip is enabled.
 *
 * @internal
 */
export const selectEnableDrilledTooltip: DashboardSelector<boolean> = createSelector(
    selectConfig,
    (state) => {
        return state.settings?.enableDrilledTooltip ?? true;
    },
);

/**
 * Returns whether dynamic height of the dashboard section description fields in dashboard edit mode is enabled.
 *
 * @internal
 */
export const selectEnableDashboardDescriptionDynamicHeight: DashboardSelector<boolean> = createSelector(
    selectConfig,
    (state) => {
        return state.settings?.enableDashboardDescriptionDynamicHeight ?? false;
    },
);

/**
 * @internal
 */
export const selectEnableSlideshowExports: DashboardSelector<boolean> = createSelector(
    selectConfig,
    (state) => {
        return (state.settings?.enableSlidesExport && state.settings?.enableSlideshowExports) ?? false;
    },
);

/**
 * @internal
 */
export const selectEnableRichTextDynamicReferences: DashboardSelector<boolean> = createSelector(
    selectConfig,
    (state) => {
        return state.settings?.enableRichTextDynamicReferences ?? true;
    },
);

/**
 * Feature flag
 * @internal
 */
export const selectEnableDashboardFiltersApplyModes: DashboardSelector<boolean> = createSelector(
    selectConfig,
    (state) => {
        return state.settings?.enableDashboardFiltersApplyModes ?? true;
    },
);

/**
 * Feature flag
 * @internal
 */
export const selectEnableAttributeFilterVirtualisedList: DashboardSelector<boolean> = createSelector(
    selectConfig,
    (state) => {
        return state.settings?.enableAttributeFilterVirtualised ?? false;
    },
);

/**
 * Setting of dashboard filters apply mode. The value is resolved in the following order:
 * If set on workspace level, workspace setting is used.
 * If not set on workspace level, organization setting is used.
 * If none of them are set, INDIVIDIAL mode is default.
 * @alpha
 */
export const selectDashboardFiltersApplyMode: DashboardSelector<DashboardFiltersApplyMode> = createSelector(
    selectConfig,
    (state) => {
        return state.settings?.dashboardFiltersApplyMode ?? { mode: "INDIVIDUAL" };
    },
);

/**
 * Feature flag is enabled and setting set to ALL_AT_ONCE
 * @internal
 */
export const selectIsApplyFiltersAllAtOnceEnabledAndSet: DashboardSelector<boolean> = createSelector(
    selectEnableDashboardFiltersApplyModes,
    selectDashboardFiltersApplyMode,
    (enableDashboardFiltersApplyModes, dashboardFiltersApplyMode) => {
        return enableDashboardFiltersApplyModes && dashboardFiltersApplyMode.mode === "ALL_AT_ONCE";
    },
);

/**
 * @internal
 */
export const selectEnableExecutionCancelling: DashboardSelector<boolean> = createSelector(
    selectConfig,
    (state) => {
        return state.settings?.enableExecutionCancelling ?? false;
    },
);

/**
 * Selector for the dashboard share link feature flag
 *
 * @internal
 */
export const selectEnableDashboardShareLink: DashboardSelector<boolean> = createSelector(
    selectConfig,
    (state) => {
        return Boolean(state.settings?.enableDashboardShareLink) ?? false;
    },
);

/**
 * Selector for the automation filter context feature flag
 *
 * @internal
 */
export const selectEnableAutomationFilterContext: DashboardSelector<boolean> = createSelector(
    selectConfig,
    (state) => {
        return Boolean(state.settings?.enableAutomationFilterContext) ?? true;
    },
);

/**
 * Selector for the date filter local identifiers feature flag
 *
 * @internal
 */
export const selectEnableDateFilterIdentifiers: DashboardSelector<boolean> = createSelector(
    selectConfig,
    (state) => {
        return Boolean(state.settings?.enableDateFilterIdentifiersRollout) ?? true;
    },
);

/**
 * Returns whether snapshot export accessibility is enabled.
 *
 * @internal
 */
export const selectEnableSnapshotExportAccessibility: DashboardSelector<boolean> = createSelector(
    selectConfig,
    (state) => {
        return Boolean(state.settings?.enableSnapshotExportAccessibility) ?? false;
    },
);

/**
 * Selector for the widget export to PNG image feature flag
 *
 * @internal
 */
export const selectEnableWidgetExportPngImage: DashboardSelector<boolean> = createSelector(
    selectConfig,
    (state) => {
        return Boolean(state.settings?.enableWidgetExportPngImage) ?? true;
    },
);

/**
 * Selector for the export to PDF tabular
 *
 * @internal
 */
export const selectEnableExportToPdfTabular: DashboardSelector<boolean> = createSelector(
    selectConfig,
    (state) => {
        return Boolean(state.settings?.enableNewPdfTabularExport) ?? false;
    },
);

/**
 * Selector for the export to document storage and send scheduled exports to notification channels feature flag
 *
 * @internal
 */
export const selectEnableExportToDocumentStorage: DashboardSelector<boolean> = createSelector(
    selectConfig,
    (state) => {
        return Boolean(state.settings?.enableExportToDocumentStorage) ?? false;
    },
);

/**
 * Returns the external recipient from the dashboard config
 *
 * @internal
 */
export const selectExternalRecipient: DashboardSelector<string | undefined> = createSelector(
    selectConfig,
    (state) => {
        return state.externalRecipient;
    },
);

/**
 * Returns whether notification channel identifiers are enabled.
 *
 * @internal
 */
export const selectEnableNotificationChannelIdentifiers: DashboardSelector<boolean> = createSelector(
    selectConfig,
    (state) => {
        return Boolean(state.settings?.enableNotificationChannelIdentifiers) ?? false;
    },
);

/**
 * Selector for the dashboard share link in the share dialog feature flag
 *
 * @internal
 */
export const selectEnableDashboardShareDialogLink: DashboardSelector<boolean> = createSelector(
    selectConfig,
    (state) => {
        return Boolean(state.settings?.enableDashboardShareDialogLink) ?? false;
    },
);

/**
 * Selector for the new scheduled export feature flag
 *
 * @internal
 */
export const selectEnableNewScheduledExport: DashboardSelector<boolean> = createSelector(
    selectConfig,
    (state) => {
        return Boolean(state.settings?.enableNewScheduledExport) ?? false;
    },
);

/**
 * Selector for the centralized automation management feature flag
 *
 * @internal
 */
export const selectEnableCentralizedAutomationManagement: DashboardSelector<boolean> = createSelector(
    selectConfig,
    (state) => {
        return Boolean(state.settings?.enableCentralizedAutomationManagement) ?? false;
    },
);

/**
 * Selector for the centralized automation management feature flag
 *
 * @internal
 */
export const selectEnableAutomationManagement: DashboardSelector<boolean> = createSelector(
    selectConfig,
    (state) => {
        return Boolean(state.settings?.enableAutomationManagement) ?? false;
    },
);

/**
 * Selector for the automation evaluation mode feature flag
 *
 * @internal
 */
export const selectEnableAutomationEvaluationMode: DashboardSelector<boolean> = createSelector(
    selectConfig,
    (state) => {
        return Boolean(state.settings?.enableAutomationEvaluationMode) ?? false;
    },
);
