// (C) 2021 GoodData Corporation
import { DashboardTester, preloadedTesterFactory } from "../../../tests/DashboardTester";
import {
    ComplexDashboardIdentifier,
    ComplexDashboardWithReferences,
    SimpleDashboardIdentifier,
    TestCorrelation,
    TestKpiPlaceholderItem,
    TestStash,
} from "../../../tests/Dashboard.fixtures";
import {
    DashboardCommandFailed,
    DashboardLayoutChanged,
    DashboardLayoutSectionItemReplaced,
} from "../../../events";
import { replaceSectionItem, undoLayoutChanges } from "../../../commands";
import { selectLayout, selectStash } from "../../../state/layout/layoutSelectors";

describe("replace section item handler", () => {
    describe("for any dashboard", () => {
        let Tester: DashboardTester;
        beforeEach(preloadedTesterFactory((tester) => (Tester = tester), SimpleDashboardIdentifier));

        it("should fail if bad section index is provided", async () => {
            const fail: DashboardCommandFailed = await Tester.dispatchAndWaitFor(
                replaceSectionItem(1, 0, TestKpiPlaceholderItem, undefined, TestCorrelation),
                "GDC.DASH/EVT.COMMAND.FAILED",
            );

            expect(fail.payload.reason).toEqual("USER_ERROR");
            expect(fail.correlationId).toEqual(TestCorrelation);
        });

        it("should fail if bad item index is provided", async () => {
            const fail: DashboardCommandFailed = await Tester.dispatchAndWaitFor(
                replaceSectionItem(0, 4, TestKpiPlaceholderItem, undefined, TestCorrelation),
                "GDC.DASH/EVT.COMMAND.FAILED",
            );

            expect(fail.payload.reason).toEqual("USER_ERROR");
            expect(fail.correlationId).toEqual(TestCorrelation);
        });

        it("should fail if bad stash identifier is provided", async () => {
            const fail: DashboardCommandFailed = await Tester.dispatchAndWaitFor(
                replaceSectionItem(0, 0, "InvalidStashIdentifier", undefined, TestCorrelation),
                "GDC.DASH/EVT.COMMAND.FAILED",
            );

            expect(fail.payload.reason).toEqual("USER_ERROR");
            expect(fail.correlationId).toEqual(TestCorrelation);
        });
    });

    describe("for dashboard with existing sections", () => {
        let Tester: DashboardTester;
        beforeEach(preloadedTesterFactory((tester) => (Tester = tester), ComplexDashboardIdentifier));

        const [SecondSectionFirstItem, SecondSectionSecondItem] =
            ComplexDashboardWithReferences.dashboard.layout!.sections[1].items;

        const [ThirdSectionFirstItem] = ComplexDashboardWithReferences.dashboard.layout!.sections[2].items;

        it("should replace existing item in section with multiple items", async () => {
            const event: DashboardLayoutSectionItemReplaced = await Tester.dispatchAndWaitFor(
                replaceSectionItem(1, 0, TestKpiPlaceholderItem, undefined),
                "GDC.DASH/EVT.FLUID_LAYOUT.ITEM_REPLACED",
            );

            expect(event.payload.previousItem).toEqual(SecondSectionFirstItem);
            expect(event.payload.items).toEqual([TestKpiPlaceholderItem]);
            const section = selectLayout(Tester.state()).sections[1];
            expect(section.items).toEqual([TestKpiPlaceholderItem, SecondSectionSecondItem]);
        });

        it("should replace existing item in section with single item", async () => {
            const event: DashboardLayoutSectionItemReplaced = await Tester.dispatchAndWaitFor(
                replaceSectionItem(2, 0, TestKpiPlaceholderItem, undefined),
                "GDC.DASH/EVT.FLUID_LAYOUT.ITEM_REPLACED",
            );

            expect(event.payload.previousItem).toEqual(ThirdSectionFirstItem);
            expect(event.payload.items).toEqual([TestKpiPlaceholderItem]);
            const section = selectLayout(Tester.state()).sections[2];
            expect(section.items).toEqual([TestKpiPlaceholderItem]);
        });

        it("should replace existing item and store previous item in stash", async () => {
            const event: DashboardLayoutSectionItemReplaced = await Tester.dispatchAndWaitFor(
                replaceSectionItem(1, 0, TestKpiPlaceholderItem, TestStash),
                "GDC.DASH/EVT.FLUID_LAYOUT.ITEM_REPLACED",
            );

            expect(event.payload.previousItem).toEqual(SecondSectionFirstItem);
            expect(event.payload.stashIdentifier).toEqual(TestStash);
            const stash = selectStash(Tester.state());
            expect(stash[TestStash]).toEqual([SecondSectionFirstItem]);
        });

        it("should replace existing item with item from stash", async () => {
            // stash first item
            await Tester.dispatchAndWaitFor(
                replaceSectionItem(1, 0, TestKpiPlaceholderItem, TestStash),
                "GDC.DASH/EVT.FLUID_LAYOUT.ITEM_REPLACED",
            );

            // now use the stashed item and replace the second item with it
            const event: DashboardLayoutSectionItemReplaced = await Tester.dispatchAndWaitFor(
                replaceSectionItem(1, 1, TestStash, undefined),
                "GDC.DASH/EVT.FLUID_LAYOUT.ITEM_REPLACED",
            );

            expect(event.payload.previousItem).toEqual(SecondSectionSecondItem);
            expect(event.payload.items).toEqual([SecondSectionFirstItem]);
            const section = selectLayout(Tester.state()).sections[1];
            expect(section.items).toEqual([TestKpiPlaceholderItem, SecondSectionFirstItem]);
        });

        it("should resolve stashed item first, then overwrite stash with new item", async () => {
            await Tester.dispatchAndWaitFor(
                replaceSectionItem(1, 0, TestKpiPlaceholderItem, TestStash),
                "GDC.DASH/EVT.FLUID_LAYOUT.ITEM_REPLACED",
            );
            const event: DashboardLayoutSectionItemReplaced = await Tester.dispatchAndWaitFor(
                replaceSectionItem(1, 1, TestStash, TestStash),
                "GDC.DASH/EVT.FLUID_LAYOUT.ITEM_REPLACED",
            );

            expect(event.payload.stashIdentifier).toEqual(TestStash);
            expect(event.payload.items).toEqual([SecondSectionFirstItem]);
            const stash = selectStash(Tester.state());
            expect(stash[TestStash]).toEqual([SecondSectionSecondItem]);
        });

        it("should be undoable", async () => {
            /*
             * the scenario to undo is where first item is replaced & stashed and then second item is replaced
             * with the stashed item and the second item is also stashed
             */
            await Tester.dispatchAndWaitFor(
                replaceSectionItem(1, 0, TestKpiPlaceholderItem, TestStash),
                "GDC.DASH/EVT.FLUID_LAYOUT.ITEM_REPLACED",
            );
            await Tester.dispatchAndWaitFor(
                replaceSectionItem(1, 1, TestStash, TestStash),
                "GDC.DASH/EVT.FLUID_LAYOUT.ITEM_REPLACED",
            );

            const lastReplaceUndone: DashboardLayoutChanged = await Tester.dispatchAndWaitFor(
                undoLayoutChanges(),
                "GDC.DASH/EVT.FLUID_LAYOUT.LAYOUT_CHANGED",
            );

            expect(lastReplaceUndone.payload.layout.sections[1].items).toEqual([
                TestKpiPlaceholderItem,
                SecondSectionSecondItem,
            ]);
            expect(selectStash(Tester.state())[TestStash]).toEqual([SecondSectionFirstItem]);

            const firstReplaceUndone: DashboardLayoutChanged = await Tester.dispatchAndWaitFor(
                undoLayoutChanges(),
                "GDC.DASH/EVT.FLUID_LAYOUT.LAYOUT_CHANGED",
            );

            expect(firstReplaceUndone.payload.layout.sections[1].items).toEqual([
                SecondSectionFirstItem,
                SecondSectionSecondItem,
            ]);
            expect(selectStash(Tester.state())[TestStash]).toBeUndefined();
        });

        it("should emit correct events", async () => {
            await Tester.dispatchAndWaitFor(
                replaceSectionItem(1, 0, TestKpiPlaceholderItem, TestStash, TestCorrelation),
                "GDC.DASH/EVT.FLUID_LAYOUT.ITEM_REPLACED",
            );

            expect(Tester.emittedEventsDigest()).toMatchSnapshot();
        });
    });
});
