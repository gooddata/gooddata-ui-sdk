// (C) 2026 GoodData Corporation

// @vitest-environment node

import { isEqual } from "lodash-es";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    type FilterContextItem,
    type IDashboardDateFilter,
    type IDashboardFilterView,
    type IDashboardParameter,
    dashboardFilterLocalIdentifier,
    idRef,
    isDashboardAttributeFilter,
    isDashboardDateFilter,
    newRelativeDashboardDateFilter,
} from "@gooddata/sdk-model";

import { SimpleDashboardIdentifier } from "../../../tests/SimpleDashboard.test.helpers.js";
import { initializeDashboard } from "../../commands/dashboard.js";
import { changeParameterValues } from "../../commands/parameters.js";
import { switchDashboardTab } from "../../commands/tabs.js";
import { type DashboardTester, preloadedTesterFactory } from "../../DashboardTester.js";
import { catalogActions } from "../../store/catalog/index.js";
import { selectConfig } from "../../store/config/configSelectors.js";
import { configActions } from "../../store/config/index.js";
import { drillActions } from "../../store/drill/index.js";
import { selectDashboardFilterViews } from "../../store/filterViews/filterViewsReducersSelectors.js";
import { filterViewsActions } from "../../store/filterViews/index.js";
import { metaActions } from "../../store/meta/index.js";
import { selectDashboardRef } from "../../store/meta/metaSelectors.js";
import { tabsActions } from "../../store/tabs/index.js";
import {
    selectActiveTabParameterResetTargets,
    selectParameterValuesByTab,
} from "../../store/tabs/parameters/parametersSelectors.js";
import { selectActiveTabLocalIdentifier, selectTabs } from "../../store/tabs/tabsSelectors.js";
import { changeParameterValuesHandler } from "../parameters/changeParameterValuesHandler.js";

vi.mock("../parameters/changeParameterValuesHandler.js", async (importOriginal) => {
    const original = await importOriginal<{
        changeParameterValuesHandler: typeof changeParameterValuesHandler;
    }>();
    return { ...original, changeParameterValuesHandler: vi.fn(original.changeParameterValuesHandler) };
});

describe("switchDashboardTab handler", () => {
    const otherTabId = "tab-2";
    const topNRef = idRef("topN", "parameter");
    const topNParameter: IDashboardParameter = {
        ref: topNRef,
        parameterType: "NUMBER",
        mode: "active",
    };

    let Tester: DashboardTester;
    let firstTabId: string;

    beforeEach(async function setup() {
        await preloadedTesterFactory(
            function setTester(tester) {
                Tester = tester;
            },
            SimpleDashboardIdentifier,
            {
                initCommand: initializeDashboard({ settings: { enableParameters: true } }),
            },
        );
        Tester.dispatch(
            catalogActions.setCatalogParameters({
                status: "loaded",
                parameters: [
                    {
                        type: "parameter",
                        id: "topN",
                        uri: "/topN",
                        ref: topNRef,
                        title: "Top N",
                        description: "",
                        production: true,
                        deprecated: false,
                        unlisted: false,
                        definition: { type: "NUMBER", defaultValue: 5 },
                    },
                ],
            }),
        );
        Tester.dispatch(tabsActions.addParameter({ parameter: topNParameter, workspaceDefault: 5 }));
        firstTabId = selectActiveTabLocalIdentifier(Tester.state())!;
        const tabs = selectTabs(Tester.state()) ?? [];
        Tester.dispatch(
            tabsActions.setTabs({
                tabs: [...tabs, { ...tabs[0], localIdentifier: otherTabId, title: "Tab 2" }],
                activeTabLocalIdentifier: firstTabId,
            }),
        );
        const defaultView: IDashboardFilterView = {
            ref: idRef("tab-2-default", "filterView"),
            name: "Tab 2 default",
            dashboard: selectDashboardRef(Tester.state())!,
            user: idRef("user", "user"),
            filterContext: { title: "", description: "", filters: [] },
            isDefault: true,
            tabLocalIdentifier: otherTabId,
            parameters: [{ ...topNParameter, value: 42 }],
        };
        Tester.dispatch(
            filterViewsActions.setFilterViews({
                dashboard: selectDashboardRef(Tester.state())!,
                filterViews: [defaultView],
            }),
        );
        Tester.dispatch(filterViewsActions.setDefaultFilterViewAppliedTabs([firstTabId]));
    });

    function enableCrossTabFilters(): void {
        const config = selectConfig(Tester.state());
        Tester.dispatch(
            configActions.setConfig({
                ...config,
                settings: { ...config.settings, enableDashboardPersistentFiltersAcrossTabs: true },
            }),
        );
        Tester.dispatch(metaActions.setDisablePersistentFiltersAcrossTabs(false));
    }

    async function switchTo(tabId: string): Promise<void> {
        await Tester.dispatchAndWaitFor(switchDashboardTab(tabId), "GDC.DASH/EVT.TAB.SWITCHED");
    }

    function appliedStateIsInitial(tabId: string): boolean {
        const tab = selectTabs(Tester.state())?.find((item) => item.localIdentifier === tabId);
        const filtersMatch = isEqual(
            tab?.filterContext?.filterContextDefinition?.filters,
            tab?.filterContext?.originalFilterContextDefinition?.filters,
        );
        const parametersMatch = (tab?.parameters?.parameters ?? []).every(
            (entry) => entry.parameter.value === entry.runtimeOverride,
        );
        return filtersMatch && parametersMatch;
    }

    it("applies the default view of a tab to every tab and keeps it as the initial state", async () => {
        enableCrossTabFilters();

        await switchTo(otherTabId);

        expect(selectParameterValuesByTab(Tester.state())).toMatchObject({
            [firstTabId]: [{ ref: topNRef, value: 42 }],
            [otherTabId]: [{ ref: topNRef, value: 42 }],
        });
        // the view is the initial state, so the reset button has nothing to restore
        expect(appliedStateIsInitial(firstTabId)).toBe(true);
        expect(appliedStateIsInitial(otherTabId)).toBe(true);
        expect(selectActiveTabParameterResetTargets(Tester.state())).toEqual([]);
    });

    it("applies the filters of the default view before the switch completes", async () => {
        enableCrossTabFilters();
        const viewDateFilter: IDashboardDateFilter = newRelativeDashboardDateFilter("GDC.time.month", -2, 0);
        const [defaultView] = selectDashboardFilterViews(Tester.state());
        Tester.dispatch(
            filterViewsActions.setFilterViews({
                dashboard: selectDashboardRef(Tester.state())!,
                filterViews: [
                    {
                        ...defaultView,
                        filterContext: { ...defaultView.filterContext, filters: [viewDateFilter] },
                    },
                ],
            }),
        );
        Tester.resetMonitors();

        await switchTo(otherTabId);

        // a queued command would run after the caller's next filter change and overwrite it
        expect(
            Tester.dispatchedActions().some(
                (action) => action.type === "GDC.DASH/CMD.FILTER_CONTEXT.CHANGE_SELECTION",
            ),
        ).toBe(false);
        for (const tabId of [firstTabId, otherTabId]) {
            const tab = selectTabs(Tester.state())?.find((item) => item.localIdentifier === tabId);
            const commonDateFilter = tab?.filterContext?.filterContextDefinition?.filters.find(
                (filter) => isDashboardDateFilter(filter) && !filter.dateFilter.dataSet,
            );
            expect(commonDateFilter).toMatchObject({
                dateFilter: { type: "relative", granularity: "GDC.time.month", from: -2, to: 0 },
            });
        }
    });

    it("completes the switch and retries the view on the next visit when applying the view fails", async () => {
        enableCrossTabFilters();
        vi.spyOn(console, "error").mockImplementation(() => {});
        const handler = vi.mocked(changeParameterValuesHandler);
        const originalHandler = handler.getMockImplementation()!;
        let failed = false;
        // only the command of the view fails: sagas of other testers can call the handler meanwhile
        handler.mockImplementation((ctx, cmd) => {
            const appliesView = cmd.payload.parameters.some((parameter) => parameter.value === 42);
            if (appliesView && !failed) {
                failed = true;
                throw new Error("failed to apply the view");
            }
            return originalHandler(ctx, cmd);
        });

        await switchTo(otherTabId);

        expect(selectActiveTabLocalIdentifier(Tester.state())).toBe(otherTabId);
        expect(selectParameterValuesByTab(Tester.state())).toMatchObject({
            [otherTabId]: [{ ref: topNRef, value: 5 }],
        });

        await switchTo(firstTabId);
        await switchTo(otherTabId);

        expect(selectParameterValuesByTab(Tester.state())).toMatchObject({
            [firstTabId]: [{ ref: topNRef, value: 42 }],
            [otherTabId]: [{ ref: topNRef, value: 42 }],
        });
        expect(failed).toBe(true);
        handler.mockImplementation(originalHandler);
        vi.mocked(console.error).mockRestore();
    });

    it("does not apply the default view on a drill to the tab, nor on later visits", async () => {
        enableCrossTabFilters();

        await Tester.dispatchAndWaitFor(
            switchDashboardTab(otherTabId, undefined, "drillToSelf"),
            "GDC.DASH/EVT.TAB.SWITCHED",
        );
        await switchTo(firstTabId);
        await switchTo(otherTabId);

        expect(selectParameterValuesByTab(Tester.state())).toMatchObject({
            [firstTabId]: [{ ref: topNRef, value: 5 }],
            [otherTabId]: [{ ref: topNRef, value: 5 }],
        });
    });

    it("keeps a change to a filter the default view does not write resettable", async () => {
        enableCrossTabFilters();
        const tabs = selectTabs(Tester.state()) ?? [];
        const firstTab = tabs.find((tab) => tab.localIdentifier === firstTabId)!;
        const firstTabOnlyFilter =
            firstTab.filterContext!.filterContextDefinition!.filters.find(isDashboardAttributeFilter)!;
        const firstTabOnlyLocalId = firstTabOnlyFilter.attributeFilter.localIdentifier!;
        const withoutFirstTabOnlyFilter = (filters: FilterContextItem[]) =>
            filters.filter((filter) => dashboardFilterLocalIdentifier(filter) !== firstTabOnlyLocalId);
        const otherTab = tabs.find((tab) => tab.localIdentifier === otherTabId)!;
        Tester.dispatch(
            tabsActions.setTabs({
                tabs: [
                    firstTab,
                    {
                        ...otherTab,
                        filterContext: {
                            ...otherTab.filterContext!,
                            filterContextDefinition: {
                                ...otherTab.filterContext!.filterContextDefinition!,
                                filters: withoutFirstTabOnlyFilter(
                                    otherTab.filterContext!.filterContextDefinition!.filters,
                                ),
                            },
                            originalFilterContextDefinition: {
                                ...otherTab.filterContext!.originalFilterContextDefinition!,
                                filters: withoutFirstTabOnlyFilter(
                                    otherTab.filterContext!.originalFilterContextDefinition!.filters,
                                ),
                            },
                        },
                    },
                ],
                activeTabLocalIdentifier: firstTabId,
            }),
        );
        Tester.dispatch(
            tabsActions.updateAttributeFilterSelection({
                filterLocalId: firstTabOnlyLocalId,
                elements: { uris: ["/user-change"] },
                negativeSelection: false,
            }),
        );

        await switchTo(otherTabId);

        const firstTabAfter = selectTabs(Tester.state())!.find((tab) => tab.localIdentifier === firstTabId)!;
        const findFirstTabOnlyFilter = (filters: FilterContextItem[] | undefined) =>
            filters?.find((filter) => dashboardFilterLocalIdentifier(filter) === firstTabOnlyLocalId);
        expect(
            findFirstTabOnlyFilter(firstTabAfter.filterContext?.filterContextDefinition?.filters),
        ).toMatchObject({ attributeFilter: { attributeElements: { uris: ["/user-change"] } } });
        expect(
            findFirstTabOnlyFilter(firstTabAfter.filterContext?.originalFilterContextDefinition?.filters),
        ).toEqual(firstTabOnlyFilter);
        expect(appliedStateIsInitial(otherTabId)).toBe(true);
        // the filters the view wrote are adopted on the first tab as well
        expect(
            withoutFirstTabOnlyFilter(firstTabAfter.filterContext!.filterContextDefinition!.filters),
        ).toEqual(
            withoutFirstTabOnlyFilter(firstTabAfter.filterContext!.originalFilterContextDefinition!.filters),
        );
    });

    it("keeps the cross-filtering filters of another tab out of its initial values", async () => {
        enableCrossTabFilters();
        const tabs = selectTabs(Tester.state()) ?? [];
        const firstTab = tabs.find((tab) => tab.localIdentifier === firstTabId)!;
        const definition = firstTab.filterContext!.filterContextDefinition!;
        const realFilter = definition.filters.find(isDashboardAttributeFilter)!;
        const crossFilteringLocalId = "cross-filtering-filter";
        // same display form as a real filter, so identity matching would find the real filter's initial value
        const crossFilteringFilter: FilterContextItem = {
            attributeFilter: {
                ...realFilter.attributeFilter,
                localIdentifier: crossFilteringLocalId,
                attributeElements: { uris: ["/cross-filtered"] },
                negativeSelection: false,
            },
        };
        Tester.dispatch(
            tabsActions.setTabs({
                tabs: tabs.map((tab) =>
                    tab.localIdentifier === firstTabId
                        ? {
                              ...tab,
                              filterContext: {
                                  ...tab.filterContext!,
                                  filterContextDefinition: {
                                      ...definition,
                                      filters: [...definition.filters, crossFilteringFilter],
                                  },
                              },
                          }
                        : tab,
                ),
                activeTabLocalIdentifier: firstTabId,
            }),
        );
        Tester.dispatch(
            drillActions.crossFilterByWidget({
                item: { widgetRef: undefined, filterLocalIdentifiers: [crossFilteringLocalId] },
                tabId: firstTabId,
            }),
        );

        await switchTo(otherTabId);

        const firstTabAfter = selectTabs(Tester.state())!.find((tab) => tab.localIdentifier === firstTabId)!;
        const filtersAfter = firstTabAfter.filterContext!.filterContextDefinition!.filters;
        // the cross-filtering filter stays applied, but not as an initial value, so a reset removes it
        expect(filtersAfter.map(dashboardFilterLocalIdentifier)).toContain(crossFilteringLocalId);
        expect(firstTabAfter.filterContext!.originalFilterContextDefinition!.filters).toEqual(
            filtersAfter.filter((filter) => dashboardFilterLocalIdentifier(filter) !== crossFilteringLocalId),
        );
    });

    it("keeps the shared state on later visits", async () => {
        enableCrossTabFilters();
        await switchTo(otherTabId);
        await switchTo(firstTabId);
        await Tester.dispatchAndWaitFor(
            changeParameterValues({ parameters: [{ ref: topNRef, value: 3 }] }),
            "GDC.DASH/CMD.PARAMETERS.CHANGE_VALUES",
        );

        await switchTo(otherTabId);

        expect(selectParameterValuesByTab(Tester.state())).toMatchObject({
            [firstTabId]: [{ ref: topNRef, value: 3 }],
            [otherTabId]: [{ ref: topNRef, value: 3 }],
        });
    });

    it("does not apply the default view when filters do not persist across tabs", async () => {
        await switchTo(otherTabId);

        expect(selectParameterValuesByTab(Tester.state())).toMatchObject({
            [firstTabId]: [{ ref: topNRef, value: 5 }],
            [otherTabId]: [{ ref: topNRef, value: 5 }],
        });
    });
});
