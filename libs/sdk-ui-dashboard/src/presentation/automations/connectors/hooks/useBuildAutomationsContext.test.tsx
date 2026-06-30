// (C) 2026 GoodData Corporation

import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { DateFilterGranularity } from "@gooddata/sdk-model";
import type { IDateFilterOptionsByType } from "@gooddata/sdk-ui-filters";

const selectors = vi.hoisted(() => {
    const availableGranularities: DateFilterGranularity[] = ["GDC.time.date"];
    const dateFilterOptions: IDateFilterOptionsByType = {
        allTime: {
            localIdentifier: "allTime",
            type: "allTime",
            name: "All time",
            visible: true,
        },
    };
    const granularitiesPerTab: Record<string, DateFilterGranularity[]> = {
        tab1: ["GDC.time.month"],
    };
    const optionsPerTab: Record<string, IDateFilterOptionsByType | undefined> = {
        tab1: {
            relativeForm: {
                fromLimit: -30,
                toLimit: 0,
                localIdentifier: "relative",
                type: "relativeForm",
                name: "Relative",
                visible: true,
            },
        } as unknown as IDateFilterOptionsByType,
    };

    return {
        availableGranularities,
        dateFilterOptions,
        granularitiesPerTab,
        optionsPerTab,
    };
});

vi.mock("../../../../model/react/DashboardStoreProvider.js", () => ({
    useDashboardSelector: vi.fn((selector: () => unknown) => selector()),
}));

vi.mock("../../../../model/store/catalog/catalogSelectors.js", () => ({
    selectAllCatalogAttributesMap: () => new Map(),
    selectAllCatalogDisplayFormsMap: () => new Map(),
    selectCatalogAttributes: () => [],
    selectCatalogDateDatasets: () => [],
    selectCatalogMeasures: () => [],
}));

vi.mock("../../../../model/store/config/configSelectors.js", () => ({
    selectDateFormat: () => "MM/dd/yyyy",
    selectEnableAlertAttributes: () => false,
    selectEnableAlertOncePerInterval: () => false,
    selectEnableAnomalyDetectionAlert: () => false,
    selectEnableAutomationEvaluationMode: () => false,
    selectEnableAutomationManagement: () => false,
    selectEnableComparisonInAlerting: () => false,
    selectEnableCustomizableCsvDelimiter: () => false,
    selectEnableNewScheduledExport: () => false,
    selectExternalRecipient: () => undefined,
    selectIsWhiteLabeled: () => false,
    selectLocale: () => "en-US",
    selectSeparators: () => ({ decimal: ".", thousand: "," }),
    selectSettings: () => undefined,
    selectTimezone: () => undefined,
    selectWeekStart: () => "Sunday",
}));

vi.mock("../../../../model/store/drill/drillSelectors.js", () => ({
    selectIsCrossFiltering: () => false,
}));

vi.mock("../../../../model/store/tabs/tabsSelectors.js", () => ({
    selectTabs: () => [],
}));

vi.mock("../../../../model/store/permissions/permissionsSelectors.js", () => ({
    selectCanCreateAutomation: () => true,
    selectCanManageWorkspace: () => false,
    selectCanUseAiAssistant: () => false,
}));

vi.mock("../../../../model/store/topBar/topBarSelectors.js", () => ({
    selectIsAutomationDialogSecondaryTitleVisible: () => false,
}));

vi.mock("../../../../model/store/user/userSelectors.js", () => ({
    selectCurrentUser: () => ({ login: "test@example.com", ref: { identifier: "test" } }),
}));

vi.mock("../../../../model/store/filtering/dashboardFilterSelectors.js", () => ({
    selectAutomationAvailableDashboardFilters: () => [],
    selectAutomationCommonDateFilterId: () => undefined,
    selectAutomationDefaultSelectedFilters: () => [],
    selectAutomationFiltersByTab: () => [],
    selectDashboardFiltersWithoutCrossFiltering: () => [],
    selectDashboardHiddenFilters: () => [],
    selectDashboardLockedFilters: () => [],
}));

vi.mock("../../../../model/store/meta/metaSelectors.js", () => ({
    selectPersistedDashboardFilterContextDateFilterConfig: () => undefined,
}));

vi.mock("../../../../model/store/tabs/attributeFilterConfigs/attributeFilterConfigsSelectors.js", () => ({
    selectAttributeFilterConfigsOverrides: () => [],
    selectAttributeFilterConfigsOverridesByTab: () => ({}),
    selectAttributeFilterConfigsSelectionTypeMap: () => new Map(),
    selectAttributeFilterConfigsSelectionTypeMapByTab: () => ({}),
    selectEffectiveAttributeFiltersModeMap: () => new Map(),
}));

vi.mock("../../../../model/store/tabs/dateFilterConfig/dateFilterConfigSelectors.js", () => ({
    selectDateFilterConfigOverridesByTab: () => ({}),
    selectEffectiveDateFilterAvailableGranularities: () => selectors.availableGranularities,
    selectEffectiveDateFilterGranularitiesPerTab: () => selectors.granularitiesPerTab,
    selectEffectiveDateFilterMode: () => "active",
    selectEffectiveDateFilterOptions: () => selectors.dateFilterOptions,
    selectEffectiveDateFilterOptionsPerTab: () => selectors.optionsPerTab,
}));

vi.mock("../../../../model/store/tabs/dateFilterConfigs/dateFilterConfigsSelectors.js", () => ({
    selectDateFilterConfigsOverrides: () => [],
    selectDateFilterConfigsOverridesByTab: () => ({}),
    selectEffectiveDateFiltersModeMap: () => new Map(),
}));

vi.mock("../../../../model/store/tabs/filterContext/filterContextSelectors.js", () => ({
    selectAttributeFilterDisplayFormsMap: () => new Map(),
}));

vi.mock("../../../../model/store/entitlements/entitlementsSelectors.js", () => ({
    selectMaxAutomationRecipients: () => 10,
    selectEntitlementMinimumRecurrenceMinutes: () => undefined,
}));

vi.mock("../../../../model/store/ui/uiSelectors.js", () => ({
    selectExecutionTimestamp: () => undefined,
    selectScheduleEmailDialogReturnFocusTo: () => undefined,
}));

vi.mock(
    "../../../../model/store/tabs/measureValueFilterConfigs/measureValueFilterConfigsSelectors.js",
    () => ({
        selectMeasureValueFilterConfigsOverrides: () => [],
        selectMeasureValueFilterConfigsOverridesByTab: () => ({}),
    }),
);

vi.mock("../../../../model/store/tabs/layout/layoutSelectors.js", () => ({
    selectWidgetsMap: () => ({ get: () => undefined }),
}));

import { useBuildAutomationsContext } from "./useBuildAutomationsContext.js";

describe("useBuildAutomationsContext", () => {
    it("preserves per-tab date filter configuration in the automations context bridge", () => {
        const { result } = renderHook(() => useBuildAutomationsContext());

        expect(result.current.dateFilterConfig.availableGranularities).toEqual(
            selectors.availableGranularities,
        );
        expect(result.current.dateFilterConfig.dateFilterOptions).toEqual(selectors.dateFilterOptions);
        expect(result.current.dateFilterConfig.getGranularitiesForTab("tab1")).toEqual(
            selectors.granularitiesPerTab["tab1"],
        );
        expect(result.current.dateFilterConfig.getOptionsForTab("tab1")).toEqual(
            selectors.optionsPerTab["tab1"],
        );
        expect(result.current.dateFilterConfig.getGranularitiesForTab("missing-tab")).toEqual([]);
        expect(result.current.dateFilterConfig.getOptionsForTab("missing-tab")).toBeUndefined();
        expect(result.current.features.canCreateAutomation).toBe(true);
    });
});
