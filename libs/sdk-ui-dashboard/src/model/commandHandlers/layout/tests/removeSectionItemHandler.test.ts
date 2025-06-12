// (C) 2021-2022 GoodData Corporation
import { beforeEach, describe, it, expect } from "vitest";
import { DashboardTester, preloadedTesterFactory } from "../../../tests/DashboardTester.js";
import { TestCorrelation, TestStash } from "../../../tests/fixtures/Dashboard.fixtures.js";
import {
    DashboardCommandFailed,
    DashboardLayoutChanged,
    DashboardLayoutSectionItemRemoved,
    DashboardLayoutSectionRemoved,
} from "../../../events/index.js";
import {
    eagerRemoveSectionItem,
    RemoveSectionItem,
    removeSectionItem,
    undoLayoutChanges,
} from "../../../commands/layout.js";
import { selectLayout, selectStash } from "../../../store/layout/layoutSelectors.js";
import { SimpleDashboardIdentifier } from "../../../tests/fixtures/SimpleDashboard.fixtures.js";
import {
    ComplexDashboardIdentifier,
    ComplexDashboardLayout,
    ComplexDashboardWithReferences,
} from "../../../tests/fixtures/ComplexDashboard.fixtures.js";

describe("remove layout section item handler", () => {
    describe("for any dashboard", () => {
        let Tester: DashboardTester;
        beforeEach(async () => {
            await preloadedTesterFactory((tester) => {
                Tester = tester;
            }, SimpleDashboardIdentifier);
        });

        it("should fail if bad section index specified", async () => {
            const layout = selectLayout(Tester.state());
            const fail: DashboardCommandFailed<RemoveSectionItem> = await Tester.dispatchAndWaitFor(
                removeSectionItem(layout.sections.length, 0, undefined, TestCorrelation),
                "GDC.DASH/EVT.COMMAND.FAILED",
            );

            expect(fail.payload.reason).toEqual("USER_ERROR");
            expect(fail.correlationId).toEqual(TestCorrelation);
        });

        it("should fail if bad item index specified", async () => {
            const fail: DashboardCommandFailed<RemoveSectionItem> = await Tester.dispatchAndWaitFor(
                removeSectionItem(0, 4, undefined, TestCorrelation),
                "GDC.DASH/EVT.COMMAND.FAILED",
            );

            expect(fail.payload.reason).toEqual("USER_ERROR");
            expect(fail.correlationId).toEqual(TestCorrelation);
        });
    });

    describe("for dashboard with existing sections", () => {
        let Tester: DashboardTester;

        beforeEach(async () => {
            await preloadedTesterFactory((tester) => {
                Tester = tester;
            }, ComplexDashboardIdentifier);
        });

        const [SecondSectionFirstItem, SecondSectionSecondItem] =
            ComplexDashboardWithReferences.dashboard.layout!.sections[1].items;

        const [ThirdSectionFirstItem] = ComplexDashboardWithReferences.dashboard.layout!.sections[2].items;

        it("should remove first item from a section", async () => {
            const event: DashboardLayoutSectionItemRemoved = await Tester.dispatchAndWaitFor(
                removeSectionItem(1, 0, undefined),
                "GDC.DASH/EVT.FLUID_LAYOUT.ITEM_REMOVED",
            );

            expect(event.payload.item).toEqual(SecondSectionFirstItem);
            const section = selectLayout(Tester.state()).sections[1];
            expect(section.items).toEqual([SecondSectionSecondItem]);
        });

        it("should remove last item from a section", async () => {
            const event: DashboardLayoutSectionItemRemoved = await Tester.dispatchAndWaitFor(
                removeSectionItem(1, 1, undefined),
                "GDC.DASH/EVT.FLUID_LAYOUT.ITEM_REMOVED",
            );

            expect(event.payload.item).toEqual(SecondSectionSecondItem);
            const section = selectLayout(Tester.state()).sections[1];
            expect(section.items).toEqual([SecondSectionFirstItem]);
        });

        it("should remove item from a section and leave the section empty", async () => {
            const event: DashboardLayoutSectionItemRemoved = await Tester.dispatchAndWaitFor(
                removeSectionItem(2, 0, undefined),
                "GDC.DASH/EVT.FLUID_LAYOUT.ITEM_REMOVED",
            );

            expect(event.payload.item).toEqual(ThirdSectionFirstItem);
            const section = selectLayout(Tester.state()).sections[2];
            expect(section.items).toEqual([]);
        });

        it("should eagerly remove last remaining item from a section and remove section", async () => {
            const event: DashboardLayoutSectionItemRemoved = await Tester.dispatchAndWaitFor(
                eagerRemoveSectionItem(2, 0, undefined),
                "GDC.DASH/EVT.FLUID_LAYOUT.ITEM_REMOVED",
            );

            const sectionRemovedEvent: DashboardLayoutSectionRemoved = await Tester.waitFor(
                "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_REMOVED",
            );

            expect(sectionRemovedEvent.payload.section?.items).toEqual([]);
            expect(event.payload.item).toEqual(ThirdSectionFirstItem);
            expect(event.payload.section?.items).toEqual([]);
            const layout = selectLayout(Tester.state());
            expect(layout.sections).toEqual(ComplexDashboardLayout.sections.slice(0, 2));
        });

        it("should not eagerly remove section if it still has some items remaining", async () => {
            const event: DashboardLayoutSectionItemRemoved = await Tester.dispatchAndWaitFor(
                eagerRemoveSectionItem(1, 1, undefined),
                "GDC.DASH/EVT.FLUID_LAYOUT.ITEM_REMOVED",
            );

            expect(event.payload.item).toEqual(SecondSectionSecondItem);
            expect(event.payload.section).toBeUndefined();
            const section = selectLayout(Tester.state()).sections[1];
            expect(section.items).toEqual([SecondSectionFirstItem]);
        });

        it("should stash item that was removed", async () => {
            const event: DashboardLayoutSectionItemRemoved = await Tester.dispatchAndWaitFor(
                removeSectionItem(2, 0, TestStash),
                "GDC.DASH/EVT.FLUID_LAYOUT.ITEM_REMOVED",
            );

            expect(event.payload.stashIdentifier).toEqual(TestStash);
            const stash = selectStash(Tester.state());
            expect(stash[TestStash]).toEqual([ThirdSectionFirstItem]);
        });

        it("should stash item that was removed during eager removal", async () => {
            const event: DashboardLayoutSectionItemRemoved = await Tester.dispatchAndWaitFor(
                eagerRemoveSectionItem(2, 0, TestStash),
                "GDC.DASH/EVT.FLUID_LAYOUT.ITEM_REMOVED",
            );

            expect(event.payload.stashIdentifier).toEqual(TestStash);
            const stash = selectStash(Tester.state());
            expect(stash[TestStash]).toEqual([ThirdSectionFirstItem]);
        });

        it("should be undoable when doing single eager removal", async () => {
            Tester.dispatch(eagerRemoveSectionItem(2, 0, undefined, TestCorrelation));

            const removalUndone: DashboardLayoutChanged = await Tester.dispatchAndWaitFor(
                undoLayoutChanges(),
                "GDC.DASH/EVT.FLUID_LAYOUT.LAYOUT_CHANGED",
            );

            expect(removalUndone.payload.layout.sections[2]).toBeDefined();
            expect(removalUndone.payload.layout.sections[2].items).toEqual([ThirdSectionFirstItem]);
        });

        it("should be undoable when doing multiple removals", async () => {
            // two eager removals from second section that has two items. after first removal the section still exists,
            // after second removal even the section goes away
            Tester.dispatch(eagerRemoveSectionItem(1, 0, undefined, TestCorrelation));
            Tester.dispatch(eagerRemoveSectionItem(1, 0, undefined, TestCorrelation));

            const lastRemoveUndone: DashboardLayoutChanged = await Tester.dispatchAndWaitFor(
                undoLayoutChanges(),
                "GDC.DASH/EVT.FLUID_LAYOUT.LAYOUT_CHANGED",
            );
            expect(lastRemoveUndone.payload.layout.sections[1]).toBeDefined();
            expect(lastRemoveUndone.payload.layout.sections[1].items).toEqual([SecondSectionSecondItem]);

            const firstRemoveUndone: DashboardLayoutChanged = await Tester.dispatchAndWaitFor(
                undoLayoutChanges(),
                "GDC.DASH/EVT.FLUID_LAYOUT.LAYOUT_CHANGED",
            );
            expect(firstRemoveUndone.payload.layout.sections[1].items).toEqual([
                SecondSectionFirstItem,
                SecondSectionSecondItem,
            ]);
        });

        it("should emit correct events during eager removal", async () => {
            Tester.dispatch(eagerRemoveSectionItem(2, 0, undefined, TestCorrelation));

            // both of these need to fly
            await Tester.waitForAll([
                "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_REMOVED",
                "GDC.DASH/EVT.FLUID_LAYOUT.ITEM_REMOVED",
            ]);

            // their order & correlation should be matching the snapshot
            expect(Tester.emittedEventsDigest()).toMatchSnapshot();
        });
    });
});
