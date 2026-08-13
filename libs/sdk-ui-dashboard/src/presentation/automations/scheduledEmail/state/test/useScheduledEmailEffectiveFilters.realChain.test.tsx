// (C) 2026 GoodData Corporation

import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import {
    type FilterContextItem,
    type IAutomationMetadataObject,
    type IUser,
    idRef,
} from "@gooddata/sdk-model";

import type { IAutomationFiltersTab } from "../../../../../model/store/filtering/types.js";
import { IntlWrapper } from "../../../../localization/IntlWrapper.js";
import {
    AutomationsContextProvider,
    type IAutomationsContextValue,
} from "../../../contexts/AutomationsContext.js";
import {
    type IScheduledEmailDialogContextValue,
    ScheduledEmailDialogContextProvider,
} from "../../../contexts/ScheduledEmailDialogContext.js";
import { useAutomationFiltersSelect } from "../../../shared/automationFilters/useAutomationFiltersSelect.js";
import { useScheduledEmailEffectiveFilters } from "../useScheduledEmailEffectiveFilters.js";

// Deliberately mocks nothing: the point is stability of the real production chain,
// and any mock in it would stabilize exactly what this test exists to measure.

const COMMON_DATE_FILTER: FilterContextItem = {
    dateFilter: {
        type: "relative",
        granularity: "GDC.time.month",
        from: -5,
        to: 0,
        localIdentifier: "common-date",
    },
};

function tab(tabId: string): IAutomationFiltersTab {
    return {
        tabId,
        tabTitle: tabId,
        availableFilters: [COMMON_DATE_FILTER],
        defaultSelectedFilters: [COMMON_DATE_FILTER],
        lockedFilters: [],
        hiddenFilters: [],
    };
}

const CURRENT_USER: IUser = {
    ref: idRef("u1"),
    login: "u1@example.com",
    email: "u1@example.com",
};

const AUTOMATIONS_CONTEXT: IAutomationsContextValue = {
    locale: "en-US",
    separators: { decimal: ".", thousand: "," },
    settings: undefined,
    catalogAttributes: [],
    catalogDateDatasets: [],
    catalogMeasures: [],
    dateFilterConfig: {
        availableGranularities: [],
        dateFilterOptions: {},
        getGranularitiesForTab: () => [],
        getOptionsForTab: () => undefined,
    },
    dateFilterContextConfig: undefined,
    attributeFilterConfigs: [],
    attributeFilterConfigsByTab: {},
    attributeFilterSelectionTypeMap: new Map(),
    attributeFilterSelectionTypeMapByTab: {},
    dateFilterConfigs: [],
    dateFilterConfigsByTab: {},
    dateFilterConfigOverridesByTab: {},
    measureValueFilterConfigs: [],
    measureValueFilterConfigsByTab: {},
    commonDateFilterId: "common-date",
    lockedFilters: [],
    hiddenFilters: [],
    availableFilters: [COMMON_DATE_FILTER],
    automationFiltersByTab: [tab("tab-1"), tab("tab-2")],
    defaultSelectedFilters: [COMMON_DATE_FILTER],
    automationAvailableFilters: [COMMON_DATE_FILTER],
    maxAutomationsRecipients: 10,
    isExecutionTimestampMode: false,
    allowHourlyRecurrence: true,
    currentUser: CURRENT_USER,
    weekStart: "Sunday",
    timezone: undefined,
    isWhiteLabeled: false,
    isSecondaryTitleVisible: false,
    externalRecipient: undefined,
    features: {
        canCreateAutomation: true,
        enableAlertOncePerInterval: false,
        enableAnomalyDetectionAlert: false,
        canUseAiAssistant: false,
        canManageWorkspace: false,
        enableSlideshowExports: false,
        enableAutomationEvaluationMode: false,
    },
    parameters: {
        enabled: false,
        stringParametersEnabled: false,
        catalog: [],
        catalogIsLoaded: true,
        dashboardParametersByTab: {},
    },
    tabIds: ["tab-1", "tab-2"],
    widgetLocalIdToTabIdMap: {},
    getCatalogAttributeByRef: () => undefined,
    getAttributeFilterDisplayForm: () => undefined,
    widgetExistsByRef: () => false,
    scheduleEmailDialogReturnFocusTo: undefined,
};

const SCHEDULED_EMAIL_DIALOG_CONTEXT: IScheduledEmailDialogContextValue = {
    widget: undefined,
    insight: undefined,
    widgetTitle: undefined,
    dashboardId: "dashboard-1",
    dashboardTitle: "Dashboard",
    dashboardFilters: undefined,
    hiddenFilters: [],
    commonDateFilterId: "common-date",
    exportParametersByTab: {},
    exportTemplates: [],
    dateFormat: "MM/dd/yyyy",
    isCrossFiltering: false,
    commonDateFilterMode: "active",
    dateFiltersModeMap: new Map(),
    attributeFiltersModeMap: new Map(),
    createScheduledEmail: vi.fn(),
    saveScheduledEmail: vi.fn(),
    deleteScheduledEmail: vi.fn(),
    scheduledExportToEdit: undefined,
    notificationChannels: [],
    isLoading: false,
};

function wrapper({ children }: { children: ReactNode }) {
    return (
        <IntlWrapper>
            <AutomationsContextProvider value={AUTOMATIONS_CONTEXT}>
                <ScheduledEmailDialogContextProvider value={SCHEDULED_EMAIL_DIALOG_CONTEXT}>
                    {children}
                </ScheduledEmailDialogContextProvider>
            </AutomationsContextProvider>
        </IntlWrapper>
    );
}

/**
 * `storeFilters` is pinned to true because false makes three of the seven members `undefined`,
 * which would make their `toBe` assertions vacuous.
 */
function useProbe(automationToEdit?: IAutomationMetadataObject) {
    const {
        editedAutomationFilters,
        editedAutomationFiltersByTab,
        availableFiltersAsVisibleFilters,
        availableFiltersAsVisibleFiltersByTab,
        filtersByTab,
    } = useAutomationFiltersSelect({ widget: undefined, automationToEdit });

    return useScheduledEmailEffectiveFilters({
        widget: undefined,
        insight: undefined,
        editedAutomationFilters,
        editedAutomationFiltersByTab,
        availableFiltersAsVisibleFilters,
        availableFiltersAsVisibleFiltersByTab,
        filtersDataByTab: filtersByTab,
        storeFilters: true,
    });
}

describe("useScheduledEmailEffectiveFilters — referential stability on the real chain", () => {
    it("returns referentially identical values when the real chain re-renders unchanged", () => {
        const { result, rerender } = renderHook(() => useProbe(), { wrapper });

        const first = { ...result.current };

        // Guard against vacuous assertions: an `undefined` member would satisfy `toBe` trivially,
        // and an empty result would mean the chain produced no namings at all.
        expect(first.effectiveVisibleWidgetFilters).toHaveLength(1);
        expect(first.effectiveVisibleDashboardFilters).toHaveLength(1);
        expect(Object.keys(first.effectiveVisibleDashboardFiltersByTab ?? {})).toEqual(["tab-1", "tab-2"]);

        rerender();

        expect(result.current.effectiveWidgetFilters).toBe(first.effectiveWidgetFilters);
        expect(result.current.effectiveWidgetFiltersWithInsight).toBe(
            first.effectiveWidgetFiltersWithInsight,
        );
        expect(result.current.effectiveDashboardFilters).toBe(first.effectiveDashboardFilters);
        expect(result.current.effectiveDashboardFiltersByTab).toBe(first.effectiveDashboardFiltersByTab);
        expect(result.current.parametersByTabForNewAutomation).toBe(first.parametersByTabForNewAutomation);

        // These three assertions are the point of the file.
        expect(result.current.effectiveVisibleWidgetFilters).toBe(first.effectiveVisibleWidgetFilters);
        expect(result.current.effectiveVisibleDashboardFilters).toBe(first.effectiveVisibleDashboardFilters);
        expect(result.current.effectiveVisibleDashboardFiltersByTab).toBe(
            first.effectiveVisibleDashboardFiltersByTab,
        );
    });
});
