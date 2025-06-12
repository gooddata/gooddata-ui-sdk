// (C) 2021-2022 GoodData Corporation
import { beforeEach, describe, it, expect } from "vitest";
import { DashboardTester, preloadedTesterFactory } from "../../../tests/DashboardTester.js";
import {
    EmptyDashboardIdentifier,
    TestCorrelation,
    TestStash,
} from "../../../tests/fixtures/Dashboard.fixtures.js";
import {
    DashboardCommandFailed,
    DashboardLayoutChanged,
    DashboardLayoutSectionRemoved,
} from "../../../events/index.js";
import { RemoveLayoutSection, removeLayoutSection, undoLayoutChanges } from "../../../commands/index.js";
import { selectLayout, selectStash } from "../../../store/layout/layoutSelectors.js";
import { SimpleDashboardIdentifier } from "../../../tests/fixtures/SimpleDashboard.fixtures.js";

describe("remove layout section handler", () => {
    describe("for an empty dashboard", () => {
        let Tester: DashboardTester;

        beforeEach(async () => {
            await preloadedTesterFactory((tester) => {
                Tester = tester;
            }, EmptyDashboardIdentifier);
        });

        it("should fail the command", async () => {
            const event: DashboardCommandFailed<RemoveLayoutSection> = await Tester.dispatchAndWaitFor(
                removeLayoutSection(0, undefined, TestCorrelation),
                "GDC.DASH/EVT.COMMAND.FAILED",
            );

            expect(event.payload.reason).toEqual("USER_ERROR");
            expect(event.correlationId).toEqual(TestCorrelation);
        });
    });

    describe("for any dashboard", () => {
        let Tester: DashboardTester;

        beforeEach(async () => {
            await preloadedTesterFactory((tester) => {
                Tester = tester;
            }, SimpleDashboardIdentifier);
        });

        it("should remove the section", async () => {
            const originalLayout = selectLayout(Tester.state());

            const event: DashboardLayoutSectionRemoved = await Tester.dispatchAndWaitFor(
                removeLayoutSection(0, undefined),
                "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_REMOVED",
            );

            expect(event.payload.index).toEqual(0);
            expect(event.payload.section).toEqual(originalLayout.sections[0]);

            const layout = selectLayout(Tester.state());

            expect(layout.sections).toEqual(originalLayout.sections.slice(1));
        });

        it("should remove the section and stash the items", async () => {
            const originalLayout = selectLayout(Tester.state());
            await Tester.dispatchAndWaitFor(
                removeLayoutSection(0, TestStash),
                "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_REMOVED",
            );

            const stash = selectStash(Tester.state());

            expect(stash[TestStash]).toEqual(originalLayout.sections[0].items);
        });

        it("should be undoable and including stashed items in undo", async () => {
            const originalLayout = selectLayout(Tester.state());

            await Tester.dispatchAndWaitFor(
                removeLayoutSection(0, TestStash),
                "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_REMOVED",
            );

            const event: DashboardLayoutChanged = await Tester.dispatchAndWaitFor(
                undoLayoutChanges(),
                "GDC.DASH/EVT.FLUID_LAYOUT.LAYOUT_CHANGED",
            );

            const restoredLayout = selectLayout(Tester.state());
            const restoredStash = selectStash(Tester.state());

            expect(event.payload.layout).toEqual(originalLayout);
            expect(restoredLayout).toEqual(originalLayout);
            expect(restoredStash[TestStash]).toBeUndefined();
        });

        it("should emit the correct events", async () => {
            await Tester.dispatchAndWaitFor(
                removeLayoutSection(0, undefined, TestCorrelation),
                "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_REMOVED",
            );

            expect(Tester.emittedEventsDigest()).toMatchSnapshot();
        });

        it("should fail command if the section does not exist", async () => {
            const originalLayout = selectLayout(Tester.state());
            const event: DashboardCommandFailed<RemoveLayoutSection> = await Tester.dispatchAndWaitFor(
                removeLayoutSection(originalLayout.sections.length, undefined, TestCorrelation),
                "GDC.DASH/EVT.COMMAND.FAILED",
            );

            expect(event.payload.reason).toEqual("USER_ERROR");
            expect(event.correlationId).toEqual(TestCorrelation);
        });
    });
});
