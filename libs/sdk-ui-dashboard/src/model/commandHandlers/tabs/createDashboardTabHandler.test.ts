// (C) 2026 GoodData Corporation

import { describe, expect, it } from "vitest";

import { idRef, isDashboardAttributeFilter } from "@gooddata/sdk-model";

import {
    absoluteForm,
    relativeForm,
} from "../../../_staging/dateFilterConfig/dateFilterConfig.test.helpers.js";
import { deriveAbsoluteFormGranularitiesFromRelativeForm } from "../../../_staging/dateFilterConfig/merge.js";
import { SimpleDashboardIdentifier } from "../../../tests/SimpleDashboard.test.helpers.js";
import { initializeDashboard } from "../../commands/dashboard.js";
import { createDashboardTab } from "../../commands/tabs.js";
import { type DashboardTester, preloadedTesterFactory } from "../../DashboardTester.js";
import { metaActions } from "../../store/meta/index.js";
import { selectEffectiveDateFilterConfig } from "../../store/tabs/dateFilterConfig/dateFilterConfigSelectors.js";
import { selectFilterContextFilters } from "../../store/tabs/filterContext/filterContextSelectors.js";
import { tabsActions } from "../../store/tabs/index.js";
import { selectTabs, selectTabsState } from "../../store/tabs/tabsSelectors.js";

describe("createDashboardTabHandler", () => {
    const dateFilterConfig = {
        ref: idRef("createTabDateFilterConfig"),
        absoluteForm,
        relativeForm,
        selectedOption: absoluteForm.localIdentifier,
    };

    it("should derive absoluteForm.availableGranularities for a newly created tab when the feature is enabled", async () => {
        let Tester: DashboardTester;
        await preloadedTesterFactory(
            (tester) => {
                Tester = tester;
            },
            undefined,
            {
                initCommand: initializeDashboard({ dateFilterConfig }),
                backendConfig: {
                    globalSettings: { enableAbsoluteDateFilterGranularity: true },
                },
            },
        );

        Tester!.dispatch(createDashboardTab());
        await Tester!.waitFor("GDC.DASH/EVT.TAB.SWITCHED");

        const effectiveDateFilterConfig = selectEffectiveDateFilterConfig(Tester!.state());

        expect(effectiveDateFilterConfig.absoluteForm).toEqual(
            deriveAbsoluteFormGranularitiesFromRelativeForm(dateFilterConfig, true).absoluteForm,
        );
    });

    describe("filter context of the new tab", () => {
        let Tester: DashboardTester;

        async function loadTester(enablePersistentFiltersAcrossTabs: boolean) {
            await preloadedTesterFactory(
                (tester) => {
                    Tester = tester;
                },
                SimpleDashboardIdentifier,
                {
                    initCommand: initializeDashboard({
                        settings: {
                            enableDashboardPersistentFiltersAcrossTabs: enablePersistentFiltersAcrossTabs,
                        },
                    }),
                },
            );

            Tester.dispatch(metaActions.setDisablePersistentFiltersAcrossTabs(false));
        }

        function createTab() {
            const { tabs, activeTabLocalIdentifier } = selectTabsState(Tester.state());
            Tester.dispatch(tabsActions.setTabs({ tabs, activeTabLocalIdentifier }));
            const sourceFilters = selectFilterContextFilters(Tester.state());

            Tester.dispatch(createDashboardTab());
            return { sourceFilters, previousTabIds: (tabs ?? []).map((tab) => tab.localIdentifier) };
        }

        function newTab(previousTabIds: string[]) {
            return selectTabs(Tester.state())?.find((tab) => !previousTabIds.includes(tab.localIdentifier));
        }

        it("should seed the new tab from the active tab's applied filters when filters sync across tabs", async () => {
            await loadTester(true);

            const { sourceFilters, previousTabIds } = createTab();
            await Tester.waitFor("GDC.DASH/EVT.TAB.SWITCHED");

            expect(sourceFilters.some(isDashboardAttributeFilter)).toBe(true);
            const tab = newTab(previousTabIds);
            expect(tab?.filterContext?.filterContextDefinition?.filters).toEqual(sourceFilters);
            expect(tab?.filterContext?.originalFilterContextDefinition?.filters).toEqual(sourceFilters);
        });

        it("should create the new tab with only the default date filter when filters do not sync", async () => {
            await loadTester(false);

            const { previousTabIds } = createTab();
            await Tester.waitFor("GDC.DASH/EVT.TAB.SWITCHED");

            const tab = newTab(previousTabIds);
            expect(
                tab?.filterContext?.filterContextDefinition?.filters.some(isDashboardAttributeFilter),
            ).toBe(false);
            expect(tab?.filterContext?.originalFilterContextDefinition).toBeUndefined();
        });
    });
});
