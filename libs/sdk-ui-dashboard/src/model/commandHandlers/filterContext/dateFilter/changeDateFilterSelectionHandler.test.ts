// (C) 2021-2026 GoodData Corporation

// @vitest-environment node

import { beforeEach, describe, expect, it } from "vitest";

import { TestCorrelation } from "../../../../tests/Dashboard.test.helpers.js";
import { SimpleDashboardIdentifier } from "../../../../tests/SimpleDashboard.test.helpers.js";
import { changeDateFilterSelection, clearDateFilterSelection } from "../../../commands/filters.js";
import { type DashboardTester, preloadedTesterFactory } from "../../../DashboardTester.js";
import { selectConfig } from "../../../store/config/configSelectors.js";
import { configActions } from "../../../store/config/index.js";
import { metaActions } from "../../../store/meta/index.js";
import { selectFilterContextDateFilter } from "../../../store/tabs/filterContext/filterContextSelectors.js";

describe("changeDateFilterSelectionHandler", () => {
    let Tester: DashboardTester;

    beforeEach(async () => {
        await preloadedTesterFactory((tester) => {
            Tester = tester;
        }, SimpleDashboardIdentifier);
    });

    it("should emit the appropriate events for changed date filter", async () => {
        Tester.dispatch(
            changeDateFilterSelection("relative", "GDC.time.month", -3, 0, "someLocalId", TestCorrelation),
        );
        await Tester.waitFor("GDC.DASH/EVT.FILTER_CONTEXT.CHANGED");

        expect(Tester.emittedEventsDigest()).toMatchSnapshot();
    });

    it("should set the date filter in the state when a date filter is changed", async () => {
        Tester.dispatch(
            changeDateFilterSelection(
                "relative",
                "GDC.time.month",
                -3,
                0,
                "dateFilterOptionLocalIdentifier",
                TestCorrelation,
                undefined,
                undefined,
                "dateFilterLocalIdentifier",
            ),
        );

        await Tester.waitFor("GDC.DASH/EVT.FILTER_CONTEXT.CHANGED");

        expect(selectFilterContextDateFilter(Tester.state())).toMatchSnapshot();
    });

    it("should set the date filter in the state when a date filter is added", async () => {
        Tester.dispatch(clearDateFilterSelection());
        await Tester.waitFor("GDC.DASH/EVT.FILTER_CONTEXT.CHANGED");

        Tester.dispatch(
            changeDateFilterSelection(
                "relative",
                "GDC.time.month",
                -3,
                0,
                "dateFilterOptionLocalIdentifier",
                TestCorrelation,
                undefined,
                undefined,
                "dateFilterLocalIdentifier",
            ),
        );
        await Tester.waitFor("GDC.DASH/EVT.FILTER_CONTEXT.CHANGED");

        expect(selectFilterContextDateFilter(Tester.state())).toMatchSnapshot();
    });

    it("should clear date filter in the state", async () => {
        Tester.dispatch(clearDateFilterSelection());

        await Tester.waitFor("GDC.DASH/EVT.FILTER_CONTEXT.CHANGED");

        expect(selectFilterContextDateFilter(Tester.state())).toMatchSnapshot();
    });

    it("should clear the date filter in the state when a date filter is cleared", async () => {
        Tester.dispatch(changeDateFilterSelection("relative", "GDC.time.month", -3, 0));
        await Tester.waitFor("GDC.DASH/EVT.FILTER_CONTEXT.CHANGED");

        Tester.dispatch(clearDateFilterSelection());
        await Tester.waitFor("GDC.DASH/EVT.FILTER_CONTEXT.CHANGED");

        expect(selectFilterContextDateFilter(Tester.state())).toBeUndefined();
    });

    describe("when filters persist across tabs", () => {
        const filterContextChangedCount = () =>
            Tester.emittedEventsDigest().filter(
                (event) => event.type === "GDC.DASH/EVT.FILTER_CONTEXT.CHANGED",
            ).length;

        beforeEach(() => {
            const config = selectConfig(Tester.state());
            Tester.dispatch(
                configActions.setConfig({
                    ...config,
                    settings: { ...config.settings, enableDashboardPersistentFiltersAcrossTabs: true },
                }),
            );
            Tester.dispatch(metaActions.setDisablePersistentFiltersAcrossTabs(false));
        });

        it("emits one filter context changed event for the changed source tab", async () => {
            await Tester.dispatchAndWaitFor(
                changeDateFilterSelection("relative", "GDC.time.month", -3, 0),
                "GDC.DASH/EVT.FILTER_CONTEXT.CHANGED",
            );

            expect(filterContextChangedCount()).toBe(1);
        });

        it("emits a filter context changed event for a command that changes nothing", async () => {
            await Tester.dispatchAndWaitFor(
                changeDateFilterSelection("relative", "GDC.time.month", -3, 0),
                "GDC.DASH/EVT.FILTER_CONTEXT.CHANGED",
            );
            Tester.resetMonitors();

            await Tester.dispatchAndWaitFor(
                changeDateFilterSelection("relative", "GDC.time.month", -3, 0),
                "GDC.DASH/EVT.FILTER_CONTEXT.CHANGED",
            );

            expect(filterContextChangedCount()).toBe(1);
        });
    });
});
