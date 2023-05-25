// (C) 2021-2023 GoodData Corporation
import { beforeEach, describe, it, expect } from "vitest";
import { DashboardTester, preloadedTesterFactory } from "../../../tests/DashboardTester.js";
import { addLayoutSection, saveDashboard, saveDashboardAs } from "../../../commands/index.js";
import { TestInsightItem } from "../../../tests/fixtures/Layout.fixtures.js";
import { TestCorrelation } from "../../../tests/fixtures/Dashboard.fixtures.js";
import { DashboardCopySaved, DashboardSaved } from "../../../events/index.js";
import { selectBasicLayout } from "../../../store/layout/layoutSelectors.js";
import { isTemporaryIdentity } from "../../../utils/dashboardItemUtils.js";
import { selectFilterContextIdentity } from "../../../store/filterContext/filterContextSelectors.js";
import {
    selectDashboardDescriptor,
    selectDashboardTitle,
    selectPersistedDashboard,
} from "../../../store/meta/metaSelectors.js";
import {
    LockedDashboardIdentifier,
    TestCorrelation as TestCorrelationLocked,
} from "../../../tests/fixtures/LockedDashboard.fixtures.js";

describe("save as dashboard handler", () => {
    describe("for a new dashboard", () => {
        let Tester: DashboardTester;
        // each test starts with a new dashboard

        beforeEach(async () => {
            await preloadedTesterFactory(
                (tester) => {
                    Tester = tester;
                },
                undefined,
                {
                    backendConfig: {
                        useRefType: "id",
                    },
                },
            );
        });

        const TestDashboardTitle = "My Dashboard Copy";

        it("should save an existing dashboard as a copy and switch to copy", async () => {
            await Tester.dispatchAndWaitFor(
                addLayoutSection(0, {}, [TestInsightItem], false, TestCorrelation),
                "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_ADDED",
            );

            const initialSaveEvent: DashboardSaved = await Tester.dispatchAndWaitFor(
                saveDashboard(),
                "GDC.DASH/EVT.SAVED",
            );

            expect(initialSaveEvent.payload.newDashboard).toEqual(true);
            const originalState = Tester.state();

            const event: DashboardCopySaved = await Tester.dispatchAndWaitFor(
                saveDashboardAs(TestDashboardTitle, true),
                "GDC.DASH/EVT.COPY_SAVED",
            );

            expect(event.payload.dashboard.ref).not.toEqual(initialSaveEvent.payload.dashboard.ref);
            expect(event.payload.dashboard.title).toEqual(TestDashboardTitle);
            expect(event.ctx.dashboardRef).toEqual(event.payload.dashboard.ref);
            const newState = Tester.state();

            const originalLayout = selectBasicLayout(originalState);
            const newLayout = selectBasicLayout(newState);

            expect(newLayout.sections[0].items[0].widget).not.toEqual(
                originalLayout.sections[0].items[0].widget,
            );
            expect(isTemporaryIdentity(newLayout.sections[0].items[0].widget!)).toEqual(false);

            expect(selectDashboardTitle(newState)).not.toEqual(selectDashboardTitle(originalState));
            expect(selectFilterContextIdentity(newState)).not.toEqual(
                selectFilterContextIdentity(originalState),
            );
            expect(selectPersistedDashboard(newState)?.ref).not.toEqual(
                selectPersistedDashboard(originalState)?.ref,
            );
        });

        it("should save an existing dashboard as a copy and leave current dashboard open", async () => {
            await Tester.dispatchAndWaitFor(
                addLayoutSection(0, {}, [TestInsightItem], false, TestCorrelation),
                "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_ADDED",
            );

            const initialSaveEvent: DashboardSaved = await Tester.dispatchAndWaitFor(
                saveDashboard(),
                "GDC.DASH/EVT.SAVED",
            );

            expect(initialSaveEvent.payload.newDashboard).toEqual(true);
            const originalState = Tester.state();

            const event: DashboardCopySaved = await Tester.dispatchAndWaitFor(
                saveDashboardAs(TestDashboardTitle, false),
                "GDC.DASH/EVT.COPY_SAVED",
            );

            expect(event.payload.dashboard.ref).not.toEqual(initialSaveEvent.payload.dashboard.ref);
            expect(event.payload.dashboard.title).toEqual(TestDashboardTitle);
            const newState = Tester.state();

            const originalLayout = selectBasicLayout(originalState);
            const newLayout = selectBasicLayout(newState);

            expect(newLayout.sections[0].items[0].widget).toEqual(originalLayout.sections[0].items[0].widget);
            expect(selectDashboardTitle(newState)).toEqual(selectDashboardTitle(originalState));
            expect(selectFilterContextIdentity(newState)).toEqual(selectFilterContextIdentity(originalState));
            expect(selectPersistedDashboard(newState)?.ref).toEqual(
                selectPersistedDashboard(originalState)?.ref,
            );
        });

        it("should emit correct events", async () => {
            await Tester.dispatchAndWaitFor(
                saveDashboardAs("My Dashboard Copy", false, true, TestCorrelation),
                "GDC.DASH/EVT.COPY_SAVED",
            );

            expect(Tester.emittedEventsDigest()).toMatchSnapshot();
        });
    });

    describe("for an existing dashboard", () => {
        let Tester: DashboardTester;

        beforeEach(async () => {
            await preloadedTesterFactory((tester) => {
                Tester = tester;
            }, LockedDashboardIdentifier);
        });

        const TestDashboardTitle = "My Dashboard Copy";

        it("should save an existing locked dashboard as a copy with isLocked flag cleaned", async () => {
            const originalState = Tester.state();
            expect(selectDashboardDescriptor(originalState).isLocked).toBeTruthy();

            await Tester.dispatchAndWaitFor(
                saveDashboardAs(TestDashboardTitle, true, undefined, TestCorrelationLocked),
                "GDC.DASH/EVT.COPY_SAVED",
            );

            const newState = Tester.state();

            expect(selectDashboardDescriptor(newState).isLocked).toBeFalsy();
        });
    });
});
