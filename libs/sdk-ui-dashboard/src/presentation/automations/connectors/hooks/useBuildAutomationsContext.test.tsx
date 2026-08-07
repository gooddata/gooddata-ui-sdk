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

    // Every mocked selector must return one of these. A mock that allocates per call
    // (`() => []`) would make the context value change identity on every render, which the
    // referential-stability test below exists to catch. In production every one of these
    // selectors is a createSelector and returns a stable reference.
    return {
        availableGranularities,
        dateFilterOptions,
        granularitiesPerTab,
        optionsPerTab,
        emptyArray: [] as never[],
        emptyRecord: {} as Record<string, never>,
        emptyMap: new Map<never, never>(),
        separators: { decimal: ".", thousand: "," },
        currentUser: { login: "test@example.com", ref: { identifier: "test" } },
        widgetsMap: { get: () => undefined },
        parameterCatalog: [] as never[],
        dashboardParametersByTab: {} as Record<string, never>,
        tabs: [{ localIdentifier: "tab1" }],
        widgetTabMap: { "widget-1": "tab1" } as Record<string, string>,
    };
});

vi.mock("../../../../model/react/DashboardStoreProvider.js", () => ({
    useDashboardSelector: vi.fn((selector: () => unknown) => selector()),
}));

vi.mock("../../../../model/store/catalog/catalogSelectors.js", () => ({
    selectAllCatalogAttributesMap: () => selectors.emptyMap,
    selectAllCatalogDisplayFormsMap: () => selectors.emptyMap,
    selectCatalogAttributes: () => selectors.emptyArray,
    selectCatalogDateDatasets: () => selectors.emptyArray,
    selectCatalogMeasures: () => selectors.emptyArray,
    selectCatalogParameters: () => selectors.parameterCatalog,
    selectCatalogParametersIsLoaded: () => true,
}));

vi.mock("../../../../model/store/config/configSelectors.js", () => ({
    selectDateFormat: () => "MM/dd/yyyy",
    selectEnableAlertOncePerInterval: () => false,
    selectEnableAnomalyDetectionAlert: () => false,
    selectEnableAutomationEvaluationMode: () => false,
    selectEnableParameters: () => true,
    selectEnableSlideshowExports: () => false,
    selectEnableStringParameters: () => true,
    selectExternalRecipient: () => undefined,
    selectIsWhiteLabeled: () => false,
    selectLocale: () => "en-US",
    selectSeparators: () => selectors.separators,
    selectSettings: () => undefined,
    selectTimezone: () => undefined,
    selectWeekStart: () => "Sunday",
}));

vi.mock("../../../../model/store/drill/drillSelectors.js", () => ({
    selectIsCrossFiltering: () => false,
}));

vi.mock("../../../../model/store/tabs/tabsSelectors.js", () => ({
    selectTabs: () => selectors.tabs,
}));

vi.mock("../../../../model/store/tabs/parameters/parametersSelectors.js", () => ({
    selectSmartPersistedTabsParameters: () => selectors.dashboardParametersByTab,
}));

vi.mock("../../../../model/store/permissions/permissionsSelectors.js", () => ({
    selectCanCreateAutomation: () => true,
    selectCanManageWorkspace: () => false,
    selectCanUseAiAssistant: () => false,
}));

vi.mock("../../../../model/store/user/userSelectors.js", () => ({
    selectCurrentUser: () => selectors.currentUser,
}));

vi.mock("../../../../model/store/filtering/dashboardFilterSelectors.js", () => ({
    selectAutomationAvailableDashboardFilters: () => selectors.emptyArray,
    selectAutomationCommonDateFilterId: () => undefined,
    selectAutomationDefaultSelectedFilters: () => selectors.emptyArray,
    selectAutomationFiltersByTab: () => selectors.emptyArray,
    selectDashboardFiltersWithoutCrossFiltering: () => selectors.emptyArray,
    selectDashboardHiddenFilters: () => selectors.emptyArray,
    selectDashboardLockedFilters: () => selectors.emptyArray,
}));

vi.mock("../../../../model/store/meta/metaSelectors.js", () => ({
    selectPersistedDashboardFilterContextDateFilterConfig: () => undefined,
}));

vi.mock("../../../../model/store/tabs/attributeFilterConfigs/attributeFilterConfigsSelectors.js", () => ({
    selectAttributeFilterConfigsOverrides: () => selectors.emptyArray,
    selectAttributeFilterConfigsOverridesByTab: () => selectors.emptyRecord,
    selectAttributeFilterConfigsSelectionTypeMap: () => selectors.emptyMap,
    selectAttributeFilterConfigsSelectionTypeMapByTab: () => selectors.emptyRecord,
    selectEffectiveAttributeFiltersModeMap: () => selectors.emptyMap,
}));

vi.mock("../../../../model/store/tabs/dateFilterConfig/dateFilterConfigSelectors.js", () => ({
    selectDateFilterConfigOverridesByTab: () => selectors.emptyRecord,
    selectEffectiveDateFilterAvailableGranularities: () => selectors.availableGranularities,
    selectEffectiveDateFilterGranularitiesPerTab: () => selectors.granularitiesPerTab,
    selectEffectiveDateFilterMode: () => "active",
    selectEffectiveDateFilterOptions: () => selectors.dateFilterOptions,
    selectEffectiveDateFilterOptionsPerTab: () => selectors.optionsPerTab,
}));

vi.mock("../../../../model/store/tabs/dateFilterConfigs/dateFilterConfigsSelectors.js", () => ({
    selectDateFilterConfigsOverrides: () => selectors.emptyArray,
    selectDateFilterConfigsOverridesByTab: () => selectors.emptyRecord,
    selectEffectiveDateFiltersModeMap: () => selectors.emptyMap,
}));

vi.mock("../../../../model/store/tabs/filterContext/filterContextSelectors.js", () => ({
    selectAttributeFilterDisplayFormsMap: () => selectors.emptyMap,
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
        selectMeasureValueFilterConfigsOverrides: () => selectors.emptyArray,
        selectMeasureValueFilterConfigsOverridesByTab: () => selectors.emptyRecord,
    }),
);

vi.mock("../../../../model/store/tabs/layout/layoutSelectors.js", () => ({
    selectWidgetsMap: () => selectors.widgetsMap,
    selectWidgetLocalIdToTabIdMap: () => selectors.widgetTabMap,
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

describe("useBuildAutomationsContext — parameter data", () => {
    it("exposes the dashboard-global parameter data the shared automationFilters hooks need", () => {
        const { result } = renderHook(() => useBuildAutomationsContext());

        expect(result.current.parameters).toEqual({
            enabled: true,
            stringParametersEnabled: true,
            catalog: selectors.parameterCatalog,
            catalogIsLoaded: true,
            dashboardParametersByTab: selectors.dashboardParametersByTab,
        });
        expect(result.current.tabIds).toEqual(["tab1"]);
        expect(result.current.widgetLocalIdToTabIdMap).toBe(selectors.widgetTabMap);
    });
});

describe("useBuildAutomationsContext — referential stability", () => {
    it("returns a referentially identical context value when re-rendered with unchanged store state", () => {
        const { result, rerender } = renderHook(() => useBuildAutomationsContext());
        const first = result.current;

        rerender();

        // The whole context value, not just its members: an unmemoized `tabIds` or `parameters`
        // would land in the top-level useMemo's dependency array and change this identity on
        // every render, re-rendering every consumer in both dialog trees.
        expect(result.current).toBe(first);
        expect(result.current.tabIds).toBe(first.tabIds);
        expect(result.current.parameters).toBe(first.parameters);
    });
});
