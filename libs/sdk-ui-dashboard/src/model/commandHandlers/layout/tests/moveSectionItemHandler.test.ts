// (C) 2021-2022 GoodData Corporation
import { beforeEach, describe, it, expect } from "vitest";
import { DashboardTester, preloadedTesterFactory } from "../../../tests/DashboardTester.js";
import { TestCorrelation } from "../../../tests/fixtures/Dashboard.fixtures.js";
import { MoveLayoutSection, moveSectionItem, undoLayoutChanges } from "../../../commands/index.js";
import {
    DashboardCommandFailed,
    DashboardLayoutChanged,
    DashboardLayoutSectionItemMoved,
} from "../../../events/index.js";
import { selectLayout } from "../../../store/layout/layoutSelectors.js";
import { SimpleDashboardIdentifier } from "../../../tests/fixtures/SimpleDashboard.fixtures.js";
import { moveSectionItemAndRemoveOriginalSectionIfEmpty } from "../../../commands/layout.js";
import {
    ComplexDashboardIdentifier,
    ComplexDashboardWithReferences,
} from "../../../tests/fixtures/ComplexDashboard.fixtures.js";

describe("move layout section item handler", () => {
    describe("for any dashboard", () => {
        let Tester: DashboardTester;
        beforeEach(async () => {
            await preloadedTesterFactory((tester) => {
                Tester = tester;
            }, SimpleDashboardIdentifier);
        });

        it("should fail if bad source section index is provided", async () => {
            const event: DashboardCommandFailed<MoveLayoutSection> = await Tester.dispatchAndWaitFor(
                moveSectionItem(2, 0, -1, -1, TestCorrelation),
                "GDC.DASH/EVT.COMMAND.FAILED",
            );

            expect(event.payload.reason).toEqual("USER_ERROR");
            expect(event.correlationId).toEqual(TestCorrelation);
        });

        it("should fail if bad source item index is provided", async () => {
            const event: DashboardCommandFailed<MoveLayoutSection> = await Tester.dispatchAndWaitFor(
                moveSectionItem(0, 4, -1, -1, TestCorrelation),
                "GDC.DASH/EVT.COMMAND.FAILED",
            );

            expect(event.payload.reason).toEqual("USER_ERROR");
            expect(event.correlationId).toEqual(TestCorrelation);
        });

        it("should fail if bad target section index is provided", async () => {
            const originalLayout = selectLayout(Tester.state());
            const event: DashboardCommandFailed<MoveLayoutSection> = await Tester.dispatchAndWaitFor(
                moveSectionItem(0, 0, originalLayout.sections.length + 1, -1, TestCorrelation),
                "GDC.DASH/EVT.COMMAND.FAILED",
            );

            expect(event.payload.reason).toEqual("USER_ERROR");
            expect(event.correlationId).toEqual(TestCorrelation);
        });

        it("should fail if bad target item index is provided", async () => {
            const event: DashboardCommandFailed<MoveLayoutSection> = await Tester.dispatchAndWaitFor(
                moveSectionItem(0, 0, 0, 4, TestCorrelation),
                "GDC.DASH/EVT.COMMAND.FAILED",
            );

            expect(event.payload.reason).toEqual("USER_ERROR");
            expect(event.correlationId).toEqual(TestCorrelation);
        });

        it("should fail if no move would happen", async () => {
            const event: DashboardCommandFailed<MoveLayoutSection> = await Tester.dispatchAndWaitFor(
                moveSectionItem(0, 0, 0, 0, TestCorrelation),
                "GDC.DASH/EVT.COMMAND.FAILED",
            );

            expect(event.payload.reason).toEqual("USER_ERROR");
            expect(event.correlationId).toEqual(TestCorrelation);
        });

        it("should fail if no move would happen using relative index", async () => {
            const event: DashboardCommandFailed<MoveLayoutSection> = await Tester.dispatchAndWaitFor(
                moveSectionItem(0, 3, 0, -1, TestCorrelation),
                "GDC.DASH/EVT.COMMAND.FAILED",
            );

            expect(event.payload.reason).toEqual("USER_ERROR");
            expect(event.correlationId).toEqual(TestCorrelation);
        });
    });

    describe("for dashboard with multiple sections", () => {
        let Tester: DashboardTester;

        beforeEach(async () => {
            await preloadedTesterFactory((tester) => {
                Tester = tester;
            }, ComplexDashboardIdentifier);
        });

        const [SecondSectionFirstItem, SecondSectionSecondItem] =
            ComplexDashboardWithReferences.dashboard.layout!.sections[1].items;

        const [ThirdSectionFirstItem] = ComplexDashboardWithReferences.dashboard.layout!.sections[2].items;

        it("should move item within section using absolute indexes", async () => {
            const event: DashboardLayoutSectionItemMoved = await Tester.dispatchAndWaitFor(
                moveSectionItem(1, 0, 1, 1),
                "GDC.DASH/EVT.FLUID_LAYOUT.ITEM_MOVED",
            );

            expect(event.payload.item).toEqual(SecondSectionFirstItem);
            const section = selectLayout(Tester.state()).sections[1];
            expect(section.items).toEqual([SecondSectionSecondItem, SecondSectionFirstItem]);
        });

        it("should move item to the end of same section using relative item index", async () => {
            const event: DashboardLayoutSectionItemMoved = await Tester.dispatchAndWaitFor(
                moveSectionItem(1, 0, 1, -1),
                "GDC.DASH/EVT.FLUID_LAYOUT.ITEM_MOVED",
            );

            expect(event.payload.item).toEqual(SecondSectionFirstItem);
            const section = selectLayout(Tester.state()).sections[1];
            expect(section.items).toEqual([SecondSectionSecondItem, SecondSectionFirstItem]);
        });

        it("should move item to the end of another section using relative item index", async () => {
            const event: DashboardLayoutSectionItemMoved = await Tester.dispatchAndWaitFor(
                moveSectionItem(1, 0, 2, -1),
                "GDC.DASH/EVT.FLUID_LAYOUT.ITEM_MOVED",
            );

            expect(event.payload.item).toEqual(SecondSectionFirstItem);
            const layout = selectLayout(Tester.state());
            expect(layout.sections[1].items).toEqual([SecondSectionSecondItem]);
            expect(layout.sections[2].items).toEqual([ThirdSectionFirstItem, SecondSectionFirstItem]);
        });

        it("should move item to the beginning of another section using relative item index", async () => {
            const event: DashboardLayoutSectionItemMoved = await Tester.dispatchAndWaitFor(
                moveSectionItem(1, 1, 2, 0),
                "GDC.DASH/EVT.FLUID_LAYOUT.ITEM_MOVED",
            );

            expect(event.payload.item).toEqual(SecondSectionSecondItem);
            const layout = selectLayout(Tester.state());
            expect(layout.sections[1].items).toEqual([SecondSectionFirstItem]);
            expect(layout.sections[2].items).toEqual([SecondSectionSecondItem, ThirdSectionFirstItem]);
        });

        it("should move last item from section and leave an empty section", async () => {
            const event: DashboardLayoutSectionItemMoved = await Tester.dispatchAndWaitFor(
                moveSectionItem(2, 0, 1, -1),
                "GDC.DASH/EVT.FLUID_LAYOUT.ITEM_MOVED",
            );

            expect(event.payload.item).toEqual(ThirdSectionFirstItem);
            const layout = selectLayout(Tester.state());
            expect(layout.sections[1].items).toEqual([
                SecondSectionFirstItem,
                SecondSectionSecondItem,
                ThirdSectionFirstItem,
            ]);
            expect(layout.sections[2].items).toEqual([]);
        });

        it("should move last item from section and remove an empty section", async () => {
            const event: DashboardLayoutSectionItemMoved = await Tester.dispatchAndWaitFor(
                moveSectionItemAndRemoveOriginalSectionIfEmpty(2, 0, 1, -1),
                "GDC.DASH/EVT.FLUID_LAYOUT.ITEM_MOVED",
            );

            expect(event.payload.item).toEqual(ThirdSectionFirstItem);
            const layout = selectLayout(Tester.state());
            expect(layout.sections[1].items).toEqual([
                SecondSectionFirstItem,
                SecondSectionSecondItem,
                ThirdSectionFirstItem,
            ]);
            expect(layout.sections.length).toEqual(2);
        });

        it("should be undoable", async () => {
            // do two moves. first move item to the end of its own section, then move item between sections
            await Tester.dispatchAndWaitFor(
                moveSectionItem(1, 0, 1, 1),
                "GDC.DASH/EVT.FLUID_LAYOUT.ITEM_MOVED",
            );

            await Tester.dispatchAndWaitFor(
                moveSectionItem(1, 0, 2, -1),
                "GDC.DASH/EVT.FLUID_LAYOUT.ITEM_MOVED",
            );

            const lastMoveUndone: DashboardLayoutChanged = await Tester.dispatchAndWaitFor(
                undoLayoutChanges(),
                "GDC.DASH/EVT.FLUID_LAYOUT.LAYOUT_CHANGED",
            );

            expect(lastMoveUndone.payload.layout.sections[2].items).toEqual([ThirdSectionFirstItem]);
            expect(lastMoveUndone.payload.layout.sections[1].items).toEqual([
                SecondSectionSecondItem,
                SecondSectionFirstItem,
            ]);

            const firstMoveUndone: DashboardLayoutChanged = await Tester.dispatchAndWaitFor(
                undoLayoutChanges(),
                "GDC.DASH/EVT.FLUID_LAYOUT.LAYOUT_CHANGED",
            );

            expect(firstMoveUndone.payload.layout.sections[1].items).toEqual([
                SecondSectionFirstItem,
                SecondSectionSecondItem,
            ]);
        });
    });
});
