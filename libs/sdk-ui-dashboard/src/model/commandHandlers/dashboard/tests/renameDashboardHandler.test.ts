// (C) 2021-2025 GoodData Corporation
import { beforeEach, describe, expect, it } from "vitest";

import { renameDashboard } from "../../../commands/index.js";
import { type DashboardRenamed } from "../../../events/index.js";
import { selectDashboardTitle, selectPersistedDashboard } from "../../../store/meta/metaSelectors.js";
import { type DashboardTester, preloadedTesterFactory } from "../../../tests/DashboardTester.js";
import { TestCorrelation } from "../../../tests/fixtures/Dashboard.fixtures.js";
import { SimpleDashboardIdentifier } from "../../../tests/fixtures/SimpleDashboard.fixtures.js";

describe("rename dashboard handler", () => {
    const TestTitle = "newTitle";

    describe("for any dashboard", () => {
        let Tester: DashboardTester;
        // each test starts with a new dashboard

        beforeEach(async () => {
            await preloadedTesterFactory((tester) => {
                Tester = tester;
            }, undefined);
        });

        it("should allow to set empty title", async () => {
            const event: DashboardRenamed = await Tester.dispatchAndWaitFor(
                renameDashboard(""),
                "GDC.DASH/EVT.RENAMED",
            );

            expect(event.payload.newTitle).toEqual("");
        });

        it("should allow to set title", async () => {
            const event: DashboardRenamed = await Tester.dispatchAndWaitFor(
                renameDashboard(TestTitle),
                "GDC.DASH/EVT.RENAMED",
            );

            expect(event.payload.newTitle).toEqual(TestTitle);
        });

        it("should emit correct events", async () => {
            await Tester.dispatchAndWaitFor(
                renameDashboard(TestTitle, TestCorrelation),
                "GDC.DASH/EVT.RENAMED",
            );

            expect(Tester.emittedEventsDigest()).toMatchSnapshot();
        });
    });

    describe("for existing dashboard", () => {
        let Tester: DashboardTester;

        beforeEach(async () => {
            await preloadedTesterFactory((tester) => {
                Tester = tester;
            }, SimpleDashboardIdentifier);
        });

        it("should set title in descriptor and keep persisted dashboard data untouched", async () => {
            const event: DashboardRenamed = await Tester.dispatchAndWaitFor(
                renameDashboard(TestTitle),
                "GDC.DASH/EVT.RENAMED",
            );

            expect(event.payload.newTitle).toEqual(TestTitle);
            expect(selectDashboardTitle(Tester.state())).toEqual(TestTitle);
            expect(selectPersistedDashboard(Tester.state())?.title).not.toEqual(TestTitle);
        });
    });
});
