// (C) 2021-2022 GoodData Corporation
import { beforeEach, describe, it, expect } from "vitest";
import { DashboardTester, preloadedTesterFactory } from "../../../tests/DashboardTester.js";
import { TestCorrelation, TestStash } from "../../../tests/fixtures/Dashboard.fixtures.js";
import {
    DashboardCommandFailed,
    DashboardLayoutChanged,
    DashboardLayoutSectionItemReplaced,
} from "../../../events/index.js";
import { ReplaceSectionItem, replaceSectionItem, undoLayoutChanges } from "../../../commands/index.js";
import { selectLayout, selectStash } from "../../../store/layout/layoutSelectors.js";
import { SimpleDashboardIdentifier } from "../../../tests/fixtures/SimpleDashboard.fixtures.js";
import {
    ComplexDashboardIdentifier,
    ComplexDashboardWithReferences,
} from "../../../tests/fixtures/ComplexDashboard.fixtures.js";
import {
    TestInsightItem,
    testItemWithDateDataset,
    testItemWithFilterIgnoreList,
    TestKpiPlaceholderItem,
} from "../../../tests/fixtures/Layout.fixtures.js";
import { uriRef } from "@gooddata/sdk-model";
import { selectInsightByRef } from "../../../store/insights/insightsSelectors.js";

describe("replace section item handler", () => {
    describe("for any dashboard", () => {
        let Tester: DashboardTester;
        beforeEach(async () => {
            await preloadedTesterFactory((tester) => {
                Tester = tester;
            }, SimpleDashboardIdentifier);
        });

        it("should fail if bad section index is provided", async () => {
            const originalLayout = selectLayout(Tester.state());
            const fail: DashboardCommandFailed<ReplaceSectionItem> = await Tester.dispatchAndWaitFor(
                replaceSectionItem(
                    originalLayout.sections.length,
                    0,
                    TestKpiPlaceholderItem,
                    undefined,
                    false,
                    TestCorrelation,
                ),
                "GDC.DASH/EVT.COMMAND.FAILED",
            );

            expect(fail.payload.reason).toEqual("USER_ERROR");
            expect(fail.correlationId).toEqual(TestCorrelation);
        });

        it("should fail if bad item index is provided", async () => {
            const fail: DashboardCommandFailed<ReplaceSectionItem> = await Tester.dispatchAndWaitFor(
                replaceSectionItem(0, 4, TestKpiPlaceholderItem, undefined, false, TestCorrelation),
                "GDC.DASH/EVT.COMMAND.FAILED",
            );

            expect(fail.payload.reason).toEqual("USER_ERROR");
            expect(fail.correlationId).toEqual(TestCorrelation);
        });

        it("should fail if bad stash identifier is provided", async () => {
            const fail: DashboardCommandFailed<ReplaceSectionItem> = await Tester.dispatchAndWaitFor(
                replaceSectionItem(0, 0, "InvalidStashIdentifier", undefined, false, TestCorrelation),
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

        it("should replace existing item in section with multiple items", async () => {
            const event: DashboardLayoutSectionItemReplaced = await Tester.dispatchAndWaitFor(
                replaceSectionItem(1, 0, TestKpiPlaceholderItem, undefined),
                "GDC.DASH/EVT.FLUID_LAYOUT.ITEM_REPLACED",
            );

            expect(event.payload.previousItem).toEqual(SecondSectionFirstItem);
            expect(event.payload.items).toMatchObject([TestKpiPlaceholderItem]);
            const section = selectLayout(Tester.state()).sections[1];
            expect(section.items).toMatchObject([TestKpiPlaceholderItem, SecondSectionSecondItem]);
        });

        it("should replace existing item in section with single item", async () => {
            const event: DashboardLayoutSectionItemReplaced = await Tester.dispatchAndWaitFor(
                replaceSectionItem(2, 0, TestKpiPlaceholderItem, undefined),
                "GDC.DASH/EVT.FLUID_LAYOUT.ITEM_REPLACED",
            );

            expect(event.payload.previousItem).toEqual(ThirdSectionFirstItem);
            expect(event.payload.items).toMatchObject([TestKpiPlaceholderItem]);
            const section = selectLayout(Tester.state()).sections[2];
            expect(section.items).toMatchObject([TestKpiPlaceholderItem]);
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
            expect(section.items).toMatchObject([TestKpiPlaceholderItem, SecondSectionFirstItem]);
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

        it("should resolve insight used in the replacing item and store that insight in state", async () => {
            await Tester.dispatchAndWaitFor(
                replaceSectionItem(1, 0, TestInsightItem, undefined, false, TestCorrelation),
                "GDC.DASH/EVT.FLUID_LAYOUT.ITEM_REPLACED",
            );

            const insight = selectInsightByRef(TestInsightItem.widget!.insight)(Tester.state());
            expect(insight).toBeDefined();
        });

        it("should fail if attempting to add insight widget with bad date dataset setting", async () => {
            const event: DashboardCommandFailed<ReplaceSectionItem> = await Tester.dispatchAndWaitFor(
                replaceSectionItem(
                    1,
                    0,
                    testItemWithDateDataset(TestInsightItem, uriRef("does-not-exist")),
                    undefined,
                    false,
                    TestCorrelation,
                ),
                "GDC.DASH/EVT.COMMAND.FAILED",
            );

            expect(event.payload.reason).toEqual("USER_ERROR");
            expect(event.correlationId).toEqual(TestCorrelation);
        });

        it("should fail if attempting to add insight widget with bad filter ignore list", async () => {
            const event: DashboardCommandFailed<ReplaceSectionItem> = await Tester.dispatchAndWaitFor(
                replaceSectionItem(
                    1,
                    0,
                    testItemWithFilterIgnoreList(TestInsightItem, [uriRef("does-not-exist")]),
                    undefined,
                    false,
                    TestCorrelation,
                ),
                "GDC.DASH/EVT.COMMAND.FAILED",
            );

            expect(event.payload.reason).toEqual("USER_ERROR");
            expect(event.correlationId).toEqual(TestCorrelation);
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

            expect(lastReplaceUndone.payload.layout.sections[1].items).toMatchObject([
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
                replaceSectionItem(1, 0, TestKpiPlaceholderItem, TestStash, false, TestCorrelation),
                "GDC.DASH/EVT.FLUID_LAYOUT.ITEM_REPLACED",
            );

            expect(Tester.emittedEventsDigest()).toMatchSnapshot();
        });
    });
});
