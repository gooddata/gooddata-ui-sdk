// (C) 2021-2026 GoodData Corporation

import { beforeEach, describe, expect, it } from "vitest";

import { type IMoveLayoutSection, moveLayoutSection, undoLayoutChanges } from "../../../commands/layout.js";
import { type IDashboardCommandFailed } from "../../../events/general.js";
import { type IDashboardLayoutChanged, type IDashboardLayoutSectionMoved } from "../../../events/layout.js";
import { selectLayout } from "../../../store/tabs/layout/layoutSelectors.js";
import { type DashboardTester, preloadedTesterFactory } from "../../../tests/DashboardTester.js";
import {
    ComplexDashboardIdentifier,
    ComplexDashboardWithReferences,
} from "../../../tests/fixtures/ComplexDashboard.fixtures.js";
import { TestCorrelation } from "../../../tests/fixtures/Dashboard.fixtures.js";
import { SimpleDashboardIdentifier } from "../../../tests/fixtures/SimpleDashboard.fixtures.js";

describe("move section command handler", () => {
    describe("for any dashboard", () => {
        let Tester: DashboardTester;

        beforeEach(async () => {
            await preloadedTesterFactory((tester) => {
                Tester = tester;
            }, SimpleDashboardIdentifier);
        });

        it("should fail if bad section index specified", async () => {
            const originalLayout = selectLayout(Tester.state());
            const event: IDashboardCommandFailed<IMoveLayoutSection> = await Tester.dispatchAndWaitFor(
                moveLayoutSection(originalLayout.sections.length, -1, TestCorrelation),
                "GDC.DASH/EVT.COMMAND.FAILED",
            );

            expect(event.payload.reason).toEqual("USER_ERROR");
            expect(event.correlationId).toEqual(TestCorrelation);
        });
    });

    describe("for dashboard with three sections", () => {
        const [FirstSection, SecondSection, ThirdSection] =
            ComplexDashboardWithReferences.dashboard.layout!.sections;

        let Tester: DashboardTester;

        beforeEach(async () => {
            await preloadedTesterFactory((tester) => {
                Tester = tester;
            }, ComplexDashboardIdentifier);
        });

        it("should move first section to the end of the section list", async () => {
            const event: IDashboardLayoutSectionMoved = await Tester.dispatchAndWaitFor(
                moveLayoutSection(0, -1),
                "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_MOVED",
            );

            expect(event.payload.section).toEqual(FirstSection);
            expect(event.payload.toIndex).toEqual(2);

            const layout = selectLayout(Tester.state());
            expect(layout.sections).toEqual([SecondSection, ThirdSection, FirstSection]);
        });

        it("should move first section to the end of the section list using absolute index", async () => {
            const event: IDashboardLayoutSectionMoved = await Tester.dispatchAndWaitFor(
                moveLayoutSection(0, 2),
                "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_MOVED",
            );

            expect(event.payload.section).toEqual(FirstSection);
            expect(event.payload.toIndex).toEqual(2);

            const layout = selectLayout(Tester.state());
            expect(layout.sections).toEqual([SecondSection, ThirdSection, FirstSection]);
        });

        it("should move first section to the middle of the section list", async () => {
            const event: IDashboardLayoutSectionMoved = await Tester.dispatchAndWaitFor(
                moveLayoutSection(0, 1),
                "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_MOVED",
            );

            expect(event.payload.section).toEqual(FirstSection);
            expect(event.payload.toIndex).toEqual(1);

            const layout = selectLayout(Tester.state());
            expect(layout.sections).toEqual([SecondSection, FirstSection, ThirdSection]);
        });

        it("should move second section to the end of the section list", async () => {
            const event: IDashboardLayoutSectionMoved = await Tester.dispatchAndWaitFor(
                moveLayoutSection(1, -1),
                "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_MOVED",
            );

            expect(event.payload.section).toEqual(SecondSection);
            expect(event.payload.toIndex).toEqual(2);

            const layout = selectLayout(Tester.state());
            expect(layout.sections).toEqual([FirstSection, ThirdSection, SecondSection]);
        });

        it("should move second section to the end of the section list using absolute index", async () => {
            const event: IDashboardLayoutSectionMoved = await Tester.dispatchAndWaitFor(
                moveLayoutSection(1, 2),
                "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_MOVED",
            );

            expect(event.payload.section).toEqual(SecondSection);
            expect(event.payload.toIndex).toEqual(2);

            const layout = selectLayout(Tester.state());
            expect(layout.sections).toEqual([FirstSection, ThirdSection, SecondSection]);
        });

        it("should move second section to the beginning of the section list", async () => {
            const event: IDashboardLayoutSectionMoved = await Tester.dispatchAndWaitFor(
                moveLayoutSection(1, 0),
                "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_MOVED",
            );

            expect(event.payload.section).toEqual(SecondSection);
            expect(event.payload.toIndex).toEqual(0);

            const layout = selectLayout(Tester.state());
            expect(layout.sections).toEqual([SecondSection, FirstSection, ThirdSection]);
        });

        it("should move third section to the middle of the section list", async () => {
            const event: IDashboardLayoutSectionMoved = await Tester.dispatchAndWaitFor(
                moveLayoutSection(2, 1),
                "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_MOVED",
            );

            expect(event.payload.section).toEqual(ThirdSection);
            expect(event.payload.toIndex).toEqual(1);

            const layout = selectLayout(Tester.state());
            expect(layout.sections).toEqual([FirstSection, ThirdSection, SecondSection]);
        });

        it("should be undoable", async () => {
            // move first section into the middle
            await Tester.dispatchAndWaitFor(
                moveLayoutSection(0, 1),
                "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_MOVED",
            );

            // then move it from middle to the end of the list
            await Tester.dispatchAndWaitFor(
                moveLayoutSection(1, 2),
                "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_MOVED",
            );

            const lastMoveUndone: IDashboardLayoutChanged = await Tester.dispatchAndWaitFor(
                undoLayoutChanges(),
                "GDC.DASH/EVT.FLUID_LAYOUT.LAYOUT_CHANGED",
            );

            expect(lastMoveUndone.payload.layout.sections).toEqual([
                SecondSection,
                FirstSection,
                ThirdSection,
            ]);
            expect(selectLayout(Tester.state()).sections).toEqual([
                SecondSection,
                FirstSection,
                ThirdSection,
            ]);

            const firstMoveUndone: IDashboardLayoutChanged = await Tester.dispatchAndWaitFor(
                undoLayoutChanges(),
                "GDC.DASH/EVT.FLUID_LAYOUT.LAYOUT_CHANGED",
            );

            expect(firstMoveUndone.payload.layout.sections).toEqual([
                FirstSection,
                SecondSection,
                ThirdSection,
            ]);
            expect(selectLayout(Tester.state()).sections).toEqual([
                FirstSection,
                SecondSection,
                ThirdSection,
            ]);
        });

        it("should emit correct event", async () => {
            await Tester.dispatchAndWaitFor(
                moveLayoutSection(0, 1, TestCorrelation),
                "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_MOVED",
            );
            expect(Tester.emittedEventsDigest()).toMatchSnapshot();
        });
    });
});
