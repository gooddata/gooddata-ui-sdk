// (C) 2021-2023 GoodData Corporation
import {
    IColorPalette,
    IDateFilterConfig,
    ISeparators,
    ISettings,
    PlatformEdition,
    WeekStart,
} from "@gooddata/sdk-model";
import { createSelector } from "@reduxjs/toolkit";
import { DashboardSelector, DashboardState } from "../types.js";
import { invariant } from "ts-invariant";
import { ObjectAvailabilityConfig, ResolvedDashboardConfig } from "../../types/commonTypes.js";
import { ILocale } from "@gooddata/sdk-ui";

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
 * Returns week start day
 *
 * @internal
 */
export const selectWeekStart: DashboardSelector<WeekStart> = createSelector(selectConfig, (state) => {
    if (state.settings == null) {
        return "Sunday" as const;
    }
    if (state.settings.enableNewUIWeekStartChange && state.settings.weekStartOnMondayEnabled) {
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
        return state.settings?.enableKPIDashboardExportPDF ?? true;
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
        return !!(state.settings?.enableRenamingMeasureToMetric ?? false);
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
    (state) => !!(state.settings?.analyticalDesigner || false),
);

/**
 * Returns whether delete button in dashboard attribute filters is visible.
 *
 * @internal
 */
export const selectIsDeleteFilterButtonEnabled: DashboardSelector<boolean> = createSelector(
    selectConfig,
    (state) => !!(state.settings?.enableKPIDashboardDeleteFilterButton || false),
);

/**
 * Returns whether dependent filters are enabled.
 *
 * @internal
 */
export const selectIsKPIDashboardDependentFiltersEnabled: DashboardSelector<boolean> = createSelector(
    selectConfig,
    (state) => !!(state.settings?.enableKPIDashboardDependentFilters || false),
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
 * Returns whether attribute hierarchies are enabled.
 *
 * @internal
 */
export const selectEnableAttributeHierarchies: DashboardSelector<boolean> = createSelector(
    selectConfig,
    (state) => {
        return state.settings?.enableAttributeHierarchies ?? true;
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
    selectEnableAttributeHierarchies,
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
 * Returns whether new KD dependent filters are enabled.
 *
 * @internal
 */
export const selectEnableKDDependentFilters: DashboardSelector<boolean> = createSelector(
    selectConfig,
    (state) => {
        return state.settings?.enableKDDependentFilters ?? false;
    },
);

/**
 * Returns whether KD dependent filters are enabled.
 * On Bear, this is driven by enableKPIDashboardDependentFilters.
 * On Tiger, it is driven by enableKDDependentFilters.
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
