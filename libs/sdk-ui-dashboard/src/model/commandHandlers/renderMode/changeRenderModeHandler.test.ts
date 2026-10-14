// (C) 2021-2026 GoodData Corporation

import { beforeEach, describe, expect, it } from "vitest";

import {
    type IDashboard,
    type IDashboardAttributeFilter,
    type IDashboardFilterView,
    type IFilterContext,
    idRef,
    isDashboardAttributeFilter,
} from "@gooddata/sdk-model";

import {
    EmptyDashboardIdentifier,
    EmptyDashboardWithReferences,
    TestCorrelation,
} from "../../../tests/Dashboard.test.helpers.js";
import {
    initializeDashboard,
    renameDashboard,
    resetDashboard,
    saveDashboard,
} from "../../commands/dashboard.js";
import { cancelEditRenderMode, changeRenderMode, switchToEditRenderMode } from "../../commands/renderMode.js";
import { type DashboardTester, preloadedTesterFactory } from "../../DashboardTester.js";
import { type DashboardSaved } from "../../events/dashboard.js";
import { selectIsDashboardDirty, selectPersistedDashboard } from "../../store/meta/metaSelectors.js";
import { selectRenderMode } from "../../store/renderMode/renderModeSelectors.js";
import { selectFilterContextFilters } from "../../store/tabs/filterContext/filterContextSelectors.js";
import { selectTabs } from "../../store/tabs/tabsSelectors.js";
import { uiActions } from "../../store/ui/index.js";
import { selectTimezoneOverride } from "../../store/ui/uiSelectors.js";
import { type PrivateDashboardContext } from "../../types/commonTypes.js";
import { EmptyDashboardLayout } from "../dashboard/common/dashboardInitialize.js";
import { SimpleDashboardNoDrillsIdentifier } from "../tests/SimpleDashboardNoDrills.test.helpers.js";

// the Department filter of the recorded dashboard, saved with All selected
const departmentFilter: IDashboardAttributeFilter = {
    attributeFilter: {
        attributeElements: { uris: [] },
        displayForm: { identifier: "f_owner.department_id", type: "displayForm" },
        localIdentifier: "34b4386e227544b39ed0978791b8bd50",
        negativeSelection: true,
        selectionMode: "multi",
    },
};

const defaultFilterView: IDashboardFilterView = {
    ref: idRef("default-filter-view", "filterView"),
    name: "Default view",
    dashboard: idRef(SimpleDashboardNoDrillsIdentifier),
    user: idRef("user", "user"),
    isDefault: true,
    filterContext: {
        title: "filterContext",
        description: "",
        filters: [
            {
                attributeFilter: {
                    ...departmentFilter.attributeFilter,
                    attributeElements: { uris: ["Inside Sales"] },
                    negativeSelection: false,
                },
            },
        ],
    },
};

function selectDepartmentFilter(tester: DashboardTester) {
    return tester
        .select(selectFilterContextFilters)
        .find(
            (filter) =>
                isDashboardAttributeFilter(filter) &&
                filter.attributeFilter.localIdentifier === departmentFilter.attributeFilter.localIdentifier,
        );
}

describe("changeRenderModeHandler", () => {
    let Tester: DashboardTester;

    describe("without initial config", () => {
        beforeEach(async () => {
            await preloadedTesterFactory((tester) => {
                Tester = tester;
            }, SimpleDashboardNoDrillsIdentifier);
        });

        it("should be view if initialRenderMode is not specified on config", () => {
            const renderMode = Tester.select(selectRenderMode);
            expect(renderMode).toBe("view");
        });

        it("should process render mode change", async () => {
            await Tester.dispatchAndWaitFor(
                changeRenderMode("edit", { resetDashboard: true }, TestCorrelation),
                "GDC.DASH/EVT.RENDER_MODE.CHANGED",
            );
            expect(Tester.emittedEventsDigest()).toMatchSnapshot();

            const renderMode = Tester.select(selectRenderMode);
            expect(renderMode).toBe("edit");
        });

        it("should process switch to edit mode", async () => {
            await Tester.dispatchAndWaitFor(
                switchToEditRenderMode(TestCorrelation),
                "GDC.DASH/EVT.RENDER_MODE.CHANGED",
            );
            expect(Tester.emittedEventsDigest()).toMatchSnapshot();

            const renderMode = Tester.select(selectRenderMode);
            expect(renderMode).toBe("edit");
        });

        it("should reset the ad-hoc timezone override when entering edit mode", async () => {
            Tester.dispatch(uiActions.setTimezoneOverride("Europe/Prague"));
            expect(Tester.select(selectTimezoneOverride)).toBe("Europe/Prague");

            await Tester.dispatchAndWaitFor(
                switchToEditRenderMode(TestCorrelation),
                "GDC.DASH/EVT.RENDER_MODE.CHANGED",
            );

            expect(Tester.select(selectTimezoneOverride)).toBeUndefined();
        });

        it("should keep the ad-hoc timezone override when leaving edit mode", async () => {
            await Tester.dispatchAndWaitFor(
                switchToEditRenderMode(TestCorrelation),
                "GDC.DASH/EVT.RENDER_MODE.CHANGED",
            );
            // set after the entry reset, so that the assertion below is about leaving edit mode
            // and not about an override that the entry never cleared
            Tester.dispatch(uiActions.setTimezoneOverride("Europe/Prague"));

            await Tester.dispatchAndWaitFor(
                cancelEditRenderMode(TestCorrelation),
                "GDC.DASH/EVT.RENDER_MODE.CHANGED",
            );

            expect(Tester.select(selectTimezoneOverride)).toBe("Europe/Prague");
        });

        it("should process cancel edit mode", async () => {
            await Tester.dispatchAndWaitFor(
                cancelEditRenderMode(TestCorrelation),
                "GDC.DASH/EVT.RENDER_MODE.CHANGED",
            );
            expect(Tester.emittedEventsDigest()).toMatchSnapshot();

            const renderMode = Tester.select(selectRenderMode);
            expect(renderMode).toBe("view");
        });
    });

    describe("with a default filter view", () => {
        const backendConfig = { filterViews: [defaultFilterView] };

        describe("loaded in view mode", () => {
            beforeEach(async () => {
                await preloadedTesterFactory(
                    (tester) => {
                        Tester = tester;
                    },
                    SimpleDashboardNoDrillsIdentifier,
                    { backendConfig },
                );
            });

            it("should apply the default filter view on load", () => {
                expect(selectDepartmentFilter(Tester)).toEqual(defaultFilterView.filterContext.filters[0]);
            });

            it("should start edit mode from the saved dashboard filters", async () => {
                await Tester.dispatchAndWaitFor(
                    switchToEditRenderMode(TestCorrelation),
                    "GDC.DASH/EVT.RENDER_MODE.CHANGED",
                );

                expect(selectDepartmentFilter(Tester)).toEqual(departmentFilter);
                expect(Tester.select(selectIsDashboardDirty)).toBe(false);
            });

            it("should keep the saved dashboard filters when reset in edit mode", async () => {
                await Tester.dispatchAndWaitFor(
                    switchToEditRenderMode(TestCorrelation),
                    "GDC.DASH/EVT.RENDER_MODE.CHANGED",
                );
                await Tester.dispatchAndWaitFor(resetDashboard(TestCorrelation), "GDC.DASH/EVT.RESET");

                expect(selectDepartmentFilter(Tester)).toEqual(departmentFilter);
                expect(Tester.select(selectIsDashboardDirty)).toBe(false);
            });

            it("should save dashboard filters and restore the default view after a title-only edit", async () => {
                await Tester.dispatchAndWaitFor(
                    switchToEditRenderMode(TestCorrelation),
                    "GDC.DASH/EVT.RENDER_MODE.CHANGED",
                );
                await Tester.dispatchAndWaitFor(
                    renameDashboard("Renamed dashboard", TestCorrelation),
                    "GDC.DASH/EVT.RENAMED",
                );
                expect(Tester.select(selectIsDashboardDirty)).toBe(true);

                const event: DashboardSaved = await Tester.dispatchAndWaitFor(
                    saveDashboard(undefined, TestCorrelation),
                    "GDC.DASH/EVT.SAVED",
                );

                const savedDashboard = event.payload.dashboard;
                expect(savedDashboard.title).toBe("Renamed dashboard");
                expect(savedDashboard.filterContext?.filters).toContainEqual(departmentFilter);
                expect(savedDashboard.tabs?.[0].filterContext?.filters).toContainEqual(departmentFilter);
                expect(Tester.select(selectPersistedDashboard)).toEqual(savedDashboard);
                expect(Tester.select(selectRenderMode)).toBe("view");
                expect(selectDepartmentFilter(Tester)).toEqual(defaultFilterView.filterContext.filters[0]);

                await Tester.dispatchAndWaitFor(
                    switchToEditRenderMode(TestCorrelation),
                    "GDC.DASH/EVT.RENDER_MODE.CHANGED",
                );
                expect(selectDepartmentFilter(Tester)).toEqual(departmentFilter);
                expect(Tester.select(selectIsDashboardDirty)).toBe(false);
            });

            it("should apply the default filter view again when leaving edit mode", async () => {
                await Tester.dispatchAndWaitFor(
                    switchToEditRenderMode(TestCorrelation),
                    "GDC.DASH/EVT.RENDER_MODE.CHANGED",
                );
                await Tester.dispatchAndWaitFor(
                    cancelEditRenderMode(TestCorrelation),
                    "GDC.DASH/EVT.RENDER_MODE.CHANGED",
                );

                expect(selectDepartmentFilter(Tester)).toEqual(defaultFilterView.filterContext.filters[0]);
            });
        });

        describe("initialized in edit mode", () => {
            beforeEach(async () => {
                await preloadedTesterFactory(
                    (tester) => {
                        Tester = tester;
                    },
                    SimpleDashboardNoDrillsIdentifier,
                    { backendConfig, initCommand: initializeDashboard({ initialRenderMode: "edit" }) },
                );
            });

            it("should start from the saved dashboard filters", () => {
                expect(selectDepartmentFilter(Tester)).toEqual(departmentFilter);
                expect(Tester.select(selectIsDashboardDirty)).toBe(false);
            });
        });

        describe("on a dashboard with tabs", () => {
            const tabFilterContext = (id: string): IFilterContext => ({
                ref: idRef(id, "filterContext"),
                uri: `/${id}`,
                identifier: id,
                title: "filterContext",
                description: "",
                filters: [departmentFilter],
            });
            const dashboardWithTabs: IDashboard = {
                ...EmptyDashboardWithReferences.dashboard,
                ref: idRef(EmptyDashboardIdentifier),
                identifier: EmptyDashboardIdentifier,
                layout: EmptyDashboardLayout,
                tabs: [
                    { localIdentifier: "tab-a", title: "A", filterContext: tabFilterContext("fc-a") },
                    { localIdentifier: "tab-b", title: "B", filterContext: tabFilterContext("fc-b") },
                ],
            };
            const privateContext: PrivateDashboardContext = { preloadedDashboard: dashboardWithTabs };
            const tabBDefaultFilterView: IDashboardFilterView = {
                ...defaultFilterView,
                dashboard: idRef(EmptyDashboardIdentifier),
                tabLocalIdentifier: "tab-b",
            };

            function selectTabBDepartmentFilter(tester: DashboardTester) {
                return tester
                    .select(selectTabs)
                    ?.find((tab) => tab.localIdentifier === "tab-b")
                    ?.filterContext?.filterContextDefinition?.filters.find(isDashboardAttributeFilter);
            }

            beforeEach(async () => {
                await preloadedTesterFactory(
                    (tester) => {
                        Tester = tester;
                    },
                    EmptyDashboardIdentifier,
                    {
                        backendConfig: { filterViews: [tabBDefaultFilterView] },
                        customizationFns: privateContext,
                    },
                );
            });

            it("should keep the default filter view of another tab when leaving edit mode", async () => {
                expect(selectTabBDepartmentFilter(Tester)).toEqual(
                    tabBDefaultFilterView.filterContext.filters[0],
                );

                await Tester.dispatchAndWaitFor(
                    switchToEditRenderMode(TestCorrelation),
                    "GDC.DASH/EVT.RENDER_MODE.CHANGED",
                );
                expect(selectTabBDepartmentFilter(Tester)).toEqual(departmentFilter);

                await Tester.dispatchAndWaitFor(
                    cancelEditRenderMode(TestCorrelation),
                    "GDC.DASH/EVT.RENDER_MODE.CHANGED",
                );
                expect(selectTabBDepartmentFilter(Tester)).toEqual(
                    tabBDefaultFilterView.filterContext.filters[0],
                );
            });
        });
    });

    describe("with initial config for new dashboard", () => {
        beforeEach(async () => {
            await preloadedTesterFactory(
                (tester) => {
                    Tester = tester;
                },
                undefined,
                {
                    initCommand: initializeDashboard({
                        initialRenderMode: "edit",
                    }),
                },
            );
        });

        it("should respect initialRenderMode config", () => {
            const renderMode = Tester.select(selectRenderMode);
            expect(renderMode).toBe("edit");
        });
    });

    describe("with initial config for existing dashboard", () => {
        beforeEach(async () => {
            await preloadedTesterFactory(
                (tester) => {
                    Tester = tester;
                },
                SimpleDashboardNoDrillsIdentifier,
                {
                    initCommand: initializeDashboard({
                        initialRenderMode: "edit",
                    }),
                },
            );
        });

        it("should respect initialRenderMode config", () => {
            const renderMode = Tester.select(selectRenderMode);
            expect(renderMode).toBe("edit");
        });
    });
});
