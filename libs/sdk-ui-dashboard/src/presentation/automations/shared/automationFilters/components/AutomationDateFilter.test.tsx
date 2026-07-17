// (C) 2026 GoodData Corporation

import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { type DateFilterGranularity, newRelativeDashboardDateFilter } from "@gooddata/sdk-model";
import type { IDateFilterOptionsByType } from "@gooddata/sdk-ui-filters";

import {
    AutomationsContextProvider,
    type IAutomationsContextValue,
} from "../../../contexts/AutomationsContext.js";

const captured = vi.hoisted(() => ({
    lastConfig: undefined as unknown,
}));

vi.mock("react-intl", () => ({
    useIntl: () => ({
        formatMessage: ({ id }: { id: string }) => id,
    }),
}));

vi.mock("../../../../../model/react/DashboardStoreProvider.js", () => ({
    useDashboardSelector: vi.fn(() => {
        throw new Error("AutomationDateFilter must not read dashboard selectors directly");
    }),
}));

vi.mock("../../../../filterBar/dateFilter/DefaultDashboardDateFilter.js", () => ({
    DefaultDashboardDateFilter: vi.fn((props: { config: unknown }) => {
        captured.lastConfig = props.config;
        return null;
    }),
}));

import { AutomationDateFilter } from "./AutomationDateFilter.js";

function createAutomationsContextValue(
    overrides: Pick<IAutomationsContextValue, "catalogDateDatasets" | "dateFilterConfig">,
): IAutomationsContextValue {
    return {
        locale: "en-US",
        separators: { decimal: ".", thousand: "," },
        settings: undefined,
        catalogAttributes: [],
        catalogDateDatasets: overrides.catalogDateDatasets,
        catalogMeasures: [],
        dateFilterConfig: overrides.dateFilterConfig,
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
        commonDateFilterId: undefined,
        lockedFilters: [],
        hiddenFilters: [],
        availableFilters: [],
        automationFiltersByTab: [],
        defaultSelectedFilters: [],
        automationAvailableFilters: [],
        maxAutomationsRecipients: 10,
        isExecutionTimestampMode: false,
        allowHourlyRecurrence: true,
        currentUser: { login: "test@example.com", ref: { identifier: "test" } } as any,
        weekStart: "Sunday" as const,
        timezone: undefined,
        isWhiteLabeled: false,
        isSecondaryTitleVisible: false,
        externalRecipient: undefined,
        features: {
            canCreateAutomation: false,
            enableAlertOncePerInterval: false,
            enableAnomalyDetectionAlert: false,
            canUseAiAssistant: false,
            canManageWorkspace: false,
            enableSlideshowExports: false,
            enableAutomationEvaluationMode: false,
        },
        getCatalogAttributeByRef: () => undefined,
        getAttributeFilterDisplayForm: () => undefined,
        widgetExistsByRef: () => false,
        scheduleEmailDialogReturnFocusTo: undefined,
    };
}

describe("AutomationDateFilter", () => {
    const activeGranularities: DateFilterGranularity[] = ["GDC.time.date"];
    const tabGranularities: DateFilterGranularity[] = ["GDC.time.month"];
    const activeOptions: IDateFilterOptionsByType = {
        allTime: {
            localIdentifier: "allTime",
            type: "allTime",
            name: "All time",
            visible: true,
        },
    };
    const tabOptions: IDateFilterOptionsByType = {
        relativeForm: {
            fromLimit: -30,
            toLimit: 0,
            localIdentifier: "relative",
            type: "relativeForm",
            name: "Relative",
            visible: true,
        },
    } as unknown as IDateFilterOptionsByType;

    const filter = newRelativeDashboardDateFilter("GDC.time.date", -6, 0);

    it("uses tab-specific values from AutomationsContext without reading dashboard selectors", () => {
        captured.lastConfig = undefined;

        const value = createAutomationsContextValue({
            catalogDateDatasets: [],
            dateFilterConfig: {
                availableGranularities: activeGranularities,
                dateFilterOptions: activeOptions,
                getGranularitiesForTab: (tabId: string) => (tabId === "tab1" ? tabGranularities : []),
                getOptionsForTab: (tabId: string) => (tabId === "tab1" ? tabOptions : undefined),
            },
        });

        render(
            <AutomationsContextProvider value={value}>
                <AutomationDateFilter filter={filter} onChange={vi.fn()} onDelete={vi.fn()} tabId="tab1" />
            </AutomationsContextProvider>,
        );

        expect(captured.lastConfig).toMatchObject({
            availableGranularities: tabGranularities,
            dateFilterOptions: tabOptions,
        });
    });

    it("falls back to active values when the tab-specific config is empty", () => {
        captured.lastConfig = undefined;

        const value = createAutomationsContextValue({
            catalogDateDatasets: [],
            dateFilterConfig: {
                availableGranularities: activeGranularities,
                dateFilterOptions: activeOptions,
                getGranularitiesForTab: () => [],
                getOptionsForTab: () => undefined,
            },
        });

        render(
            <AutomationsContextProvider value={value}>
                <AutomationDateFilter
                    filter={filter}
                    onChange={vi.fn()}
                    onDelete={vi.fn()}
                    tabId="missing-tab"
                />
            </AutomationsContextProvider>,
        );

        expect(captured.lastConfig).toMatchObject({
            availableGranularities: activeGranularities,
            dateFilterOptions: activeOptions,
        });
    });

    it("falls back to active options when tab-specific options map is empty", () => {
        captured.lastConfig = undefined;

        const value = createAutomationsContextValue({
            catalogDateDatasets: [],
            dateFilterConfig: {
                availableGranularities: activeGranularities,
                dateFilterOptions: activeOptions,
                getGranularitiesForTab: () => tabGranularities,
                getOptionsForTab: () => ({}) as IDateFilterOptionsByType,
            },
        });

        render(
            <AutomationsContextProvider value={value}>
                <AutomationDateFilter filter={filter} onChange={vi.fn()} onDelete={vi.fn()} tabId="tab1" />
            </AutomationsContextProvider>,
        );

        expect(captured.lastConfig).toMatchObject({
            availableGranularities: tabGranularities,
            dateFilterOptions: activeOptions,
        });
    });
});
