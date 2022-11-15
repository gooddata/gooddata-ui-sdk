// (C) 2021-2022 GoodData Corporation

import { DashboardTester, preloadedTesterFactory } from "../../../tests/DashboardTester";
import { TestCorrelation } from "../../../tests/fixtures/Dashboard.fixtures";
import { MoveLayoutSection, moveSectionItemToNewSection, undoLayoutChanges } from "../../../commands";
import {
    DashboardCommandFailed,
    DashboardLayoutChanged,
    DashboardLayoutSectionItemMoved,
} from "../../../events";
import { selectLayout } from "../../../store/layout/layoutSelectors";
import { SimpleDashboardIdentifier } from "../../../tests/fixtures/SimpleDashboard.fixtures";
import { moveSectionItemToNewSectionAndRemoveOriginalSectionIfEmpty } from "../../../commands/layout";
import {
    ComplexDashboardIdentifier,
    ComplexDashboardWithReferences,
} from "../../../tests/fixtures/ComplexDashboard.fixtures";

describe("move layout section item to new section handler", () => {
    describe("for any dashboard", () => {
        let Tester: DashboardTester;
        beforeEach(
            preloadedTesterFactory((tester) => {
                Tester = tester;
            }, SimpleDashboardIdentifier),
        );

        it("should fail if bad source section index is provided", async () => {
            const event: DashboardCommandFailed<MoveLayoutSection> = await Tester.dispatchAndWaitFor(
                moveSectionItemToNewSection(8, 0, -1, TestCorrelation),
                "GDC.DASH/EVT.COMMAND.FAILED",
            );

            expect(event.payload.reason).toEqual("USER_ERROR");
            expect(event.correlationId).toEqual(TestCorrelation);
        });

        it("should fail if bad source item index is provided", async () => {
            const event: DashboardCommandFailed<MoveLayoutSection> = await Tester.dispatchAndWaitFor(
                moveSectionItemToNewSection(0, 4, -1, TestCorrelation),
                "GDC.DASH/EVT.COMMAND.FAILED",
            );

            expect(event.payload.reason).toEqual("USER_ERROR");
            expect(event.correlationId).toEqual(TestCorrelation);
        });

        it("should fail if no move would happen using relative index", async () => {
            const event: DashboardCommandFailed<MoveLayoutSection> = await Tester.dispatchAndWaitFor(
                moveSectionItemToNewSection(0, 3, 0, TestCorrelation),
                "GDC.DASH/EVT.COMMAND.FAILED",
            );

            expect(event.payload.reason).toEqual("USER_ERROR");
            expect(event.correlationId).toEqual(TestCorrelation);
        });
    });

    describe("for dashboard with multiple sections", () => {
        let Tester: DashboardTester;
        beforeEach(
            preloadedTesterFactory((tester) => {
                Tester = tester;
            }, ComplexDashboardIdentifier),
        );

        const [SecondSectionFirstItem, SecondSectionSecondItem] =
            ComplexDashboardWithReferences.dashboard.layout!.sections[1].items;

        const [ThirdSectionFirstItem] = ComplexDashboardWithReferences.dashboard.layout!.sections[2].items;

        it("should move item within section to new section above", async () => {
            const event: DashboardLayoutSectionItemMoved = await Tester.dispatchAndWaitFor(
                moveSectionItemToNewSection(1, 0, 0),
                "GDC.DASH/EVT.FLUID_LAYOUT.ITEM_MOVED_TO_NEW_SECTION",
            );

            expect(event.payload.item).toEqual(SecondSectionFirstItem);
            const newSection = selectLayout(Tester.state()).sections[0];
            expect(newSection.items).toEqual([SecondSectionFirstItem]);
            const originalSection = selectLayout(Tester.state()).sections[2];
            expect(originalSection.items).toEqual([SecondSectionSecondItem]);
        });

        it("should move item within section to new section below", async () => {
            const event: DashboardLayoutSectionItemMoved = await Tester.dispatchAndWaitFor(
                moveSectionItemToNewSection(1, 0, 3),
                "GDC.DASH/EVT.FLUID_LAYOUT.ITEM_MOVED_TO_NEW_SECTION",
            );

            expect(event.payload.item).toEqual(SecondSectionFirstItem);
            const newSection = selectLayout(Tester.state()).sections[3];
            expect(newSection.items).toEqual([SecondSectionFirstItem]);
            const originalSection = selectLayout(Tester.state()).sections[1];
            expect(originalSection.items).toEqual([SecondSectionSecondItem]);
        });

        it("should move last item from section and remove an empty section", async () => {
            const event: DashboardLayoutSectionItemMoved = await Tester.dispatchAndWaitFor(
                moveSectionItemToNewSectionAndRemoveOriginalSectionIfEmpty(2, 0, 0),
                "GDC.DASH/EVT.FLUID_LAYOUT.ITEM_MOVED_TO_NEW_SECTION",
            );

            expect(event.payload.item).toEqual(ThirdSectionFirstItem);
            const layout = selectLayout(Tester.state());
            expect(layout.sections[0].items).toEqual([ThirdSectionFirstItem]);
            expect(layout.sections.length).toEqual(3);
        });

        it("should move last item from section and leave an empty section", async () => {
            const event: DashboardLayoutSectionItemMoved = await Tester.dispatchAndWaitFor(
                moveSectionItemToNewSection(2, 0, 0),
                "GDC.DASH/EVT.FLUID_LAYOUT.ITEM_MOVED_TO_NEW_SECTION",
            );

            expect(event.payload.item).toEqual(ThirdSectionFirstItem);
            const layout = selectLayout(Tester.state());
            expect(layout.sections[0].items).toEqual([ThirdSectionFirstItem]);
            expect(layout.sections.length).toEqual(4);
            expect(layout.sections[3].items).toEqual([]);
        });

        it("should be undoable", async () => {
            // do two moves. first move item to the end of its own section, then move item between sections
            await Tester.dispatchAndWaitFor(
                moveSectionItemToNewSection(1, 0, 0),
                "GDC.DASH/EVT.FLUID_LAYOUT.ITEM_MOVED_TO_NEW_SECTION",
            );

            await Tester.dispatchAndWaitFor(
                moveSectionItemToNewSection(1, 0, 3),
                "GDC.DASH/EVT.FLUID_LAYOUT.ITEM_MOVED_TO_NEW_SECTION",
            );

            const lastMoveUndone: DashboardLayoutChanged = await Tester.dispatchAndWaitFor(
                undoLayoutChanges(),
                "GDC.DASH/EVT.FLUID_LAYOUT.LAYOUT_CHANGED",
            );

            expect(lastMoveUndone.payload.layout.sections[0].items).toEqual([SecondSectionFirstItem]);
            expect(lastMoveUndone.payload.layout.sections[2].items).toEqual([SecondSectionSecondItem]);

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
