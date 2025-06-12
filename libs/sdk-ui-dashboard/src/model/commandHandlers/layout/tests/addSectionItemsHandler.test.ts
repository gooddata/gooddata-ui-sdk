// (C) 2021-2022 GoodData Corporation
import { beforeEach, describe, it, expect } from "vitest";
import { DashboardTester, preloadedTesterFactory } from "../../../tests/DashboardTester.js";
import { TestCorrelation, TestStash } from "../../../tests/fixtures/Dashboard.fixtures.js";
import { DashboardCommandFailed, DashboardLayoutSectionItemsAdded } from "../../../events/index.js";
import { addSectionItem, AddSectionItems, undoLayoutChanges } from "../../../commands/index.js";
import { selectLayout } from "../../../store/layout/layoutSelectors.js";
import { selectInsightByRef } from "../../../store/insights/insightsSelectors.js";
import { uriRef } from "@gooddata/sdk-model";
import { SimpleDashboardIdentifier } from "../../../tests/fixtures/SimpleDashboard.fixtures.js";
import { ComplexDashboardIdentifier } from "../../../tests/fixtures/ComplexDashboard.fixtures.js";
import {
    createTestInsightItem,
    TestInsightItem,
    TestInsightPlaceholderItem,
    TestKpiPlaceholderItem,
} from "../../../tests/fixtures/Layout.fixtures.js";

describe("add section items handler", () => {
    describe("for any dashboard", () => {
        let Tester: DashboardTester;

        beforeEach(async () => {
            await preloadedTesterFactory(
                (tester) => {
                    Tester = tester;
                },
                SimpleDashboardIdentifier,
                {
                    backendConfig: {
                        useRefType: "id",
                    },
                },
            );
        });

        it("should load and add insight when adding insight widget", async () => {
            await Tester.dispatchAndWaitFor(
                addSectionItem(0, 0, TestInsightItem, false, TestCorrelation),
                "GDC.DASH/EVT.FLUID_LAYOUT.ITEMS_ADDED",
            );

            const insight = selectInsightByRef(TestInsightItem.widget!.insight)(Tester.state());
            expect(insight).toBeDefined();
        });

        it("should not undo loaded insight", async () => {
            await Tester.dispatchAndWaitFor(
                addSectionItem(0, 0, TestInsightItem, false, TestCorrelation),
                "GDC.DASH/EVT.FLUID_LAYOUT.ITEMS_ADDED",
            );
            await Tester.dispatchAndWaitFor(undoLayoutChanges(), "GDC.DASH/EVT.FLUID_LAYOUT.LAYOUT_CHANGED");

            const insight = selectInsightByRef(TestInsightItem.widget!.insight)(Tester.state());
            expect(insight).toBeDefined();
        });

        it("should fail if bad section is provided", async () => {
            const originalLayout = selectLayout(Tester.state());

            const event: DashboardCommandFailed<AddSectionItems> = await Tester.dispatchAndWaitFor(
                addSectionItem(
                    originalLayout.sections.length,
                    0,
                    TestKpiPlaceholderItem,
                    false,
                    TestCorrelation,
                ),
                "GDC.DASH/EVT.COMMAND.FAILED",
            );

            expect(event.payload.reason).toEqual("USER_ERROR");
            expect(event.correlationId).toEqual(TestCorrelation);
        });

        it("should fail if bad item index is provided", async () => {
            const event: DashboardCommandFailed<AddSectionItems> = await Tester.dispatchAndWaitFor(
                addSectionItem(0, 4, TestKpiPlaceholderItem, false, TestCorrelation),
                "GDC.DASH/EVT.COMMAND.FAILED",
            );

            expect(event.payload.reason).toEqual("USER_ERROR");
            expect(event.correlationId).toEqual(TestCorrelation);
        });

        it("should fail if attempting to add item with non-existent insight", async () => {
            const event: DashboardCommandFailed<AddSectionItems> = await Tester.dispatchAndWaitFor(
                addSectionItem(0, 4, createTestInsightItem(uriRef("does-not-exist")), false, TestCorrelation),
                "GDC.DASH/EVT.COMMAND.FAILED",
            );

            expect(event.payload.reason).toEqual("USER_ERROR");
            expect(event.correlationId).toEqual(TestCorrelation);
        });

        it("should fail if bad stash identifier is provided", async () => {
            const event: DashboardCommandFailed<AddSectionItems> = await Tester.dispatchAndWaitFor(
                addSectionItem(0, -1, TestStash, false, TestCorrelation),
                "GDC.DASH/EVT.COMMAND.FAILED",
            );

            expect(event.payload.reason).toEqual("USER_ERROR");
            expect(event.correlationId).toEqual(TestCorrelation);
        });
    });

    describe("for dashboard with existing sections", () => {
        let Tester: DashboardTester;

        beforeEach(async () => {
            await preloadedTesterFactory((tester) => {
                Tester = tester;
            }, ComplexDashboardIdentifier);
        });

        // this section has two existing items
        const TestSectionIdx = 1;

        it("should add new item as first item in an existing section", async () => {
            const event: DashboardLayoutSectionItemsAdded = await Tester.dispatchAndWaitFor(
                addSectionItem(TestSectionIdx, 0, TestKpiPlaceholderItem),
                "GDC.DASH/EVT.FLUID_LAYOUT.ITEMS_ADDED",
            );

            expect(event.payload.sectionIndex).toEqual(1);
            expect(event.payload.startIndex).toEqual(0);
            expect(event.payload.itemsAdded).toMatchObject([TestKpiPlaceholderItem]);

            const section = selectLayout(Tester.state()).sections[TestSectionIdx];
            expect(section.items).toMatchObject([
                TestKpiPlaceholderItem,
                expect.any(Object),
                expect.any(Object),
            ]);
        });

        it("should add new item in between to items in an existing section", async () => {
            const event: DashboardLayoutSectionItemsAdded = await Tester.dispatchAndWaitFor(
                addSectionItem(TestSectionIdx, 1, TestKpiPlaceholderItem),
                "GDC.DASH/EVT.FLUID_LAYOUT.ITEMS_ADDED",
            );

            expect(event.payload.sectionIndex).toEqual(1);
            expect(event.payload.startIndex).toEqual(1);
            expect(event.payload.itemsAdded).toMatchObject([TestKpiPlaceholderItem]);

            const section = selectLayout(Tester.state()).sections[TestSectionIdx];
            expect(section.items).toMatchObject([
                expect.any(Object),
                TestKpiPlaceholderItem,
                expect.any(Object),
            ]);
        });

        it("should add new item as last item in an existing section", async () => {
            const event: DashboardLayoutSectionItemsAdded = await Tester.dispatchAndWaitFor(
                addSectionItem(TestSectionIdx, -1, TestKpiPlaceholderItem),
                "GDC.DASH/EVT.FLUID_LAYOUT.ITEMS_ADDED",
            );

            expect(event.payload.sectionIndex).toEqual(1);
            expect(event.payload.startIndex).toEqual(2);
            expect(event.payload.itemsAdded).toMatchObject([TestKpiPlaceholderItem]);

            const section = selectLayout(Tester.state()).sections[TestSectionIdx];
            expect(section.items).toMatchObject([
                expect.any(Object),
                expect.any(Object),
                TestKpiPlaceholderItem,
            ]);
        });

        it("should be undoable", async () => {
            const originalLayout = selectLayout(Tester.state());

            // add two items first
            await Tester.dispatchAndWaitFor(
                addSectionItem(TestSectionIdx, 1, TestInsightPlaceholderItem),
                "GDC.DASH/EVT.FLUID_LAYOUT.ITEMS_ADDED",
            );

            const layoutAfterFirst = selectLayout(Tester.state());

            await Tester.dispatchAndWaitFor(
                addSectionItem(TestSectionIdx, -1, TestKpiPlaceholderItem),
                "GDC.DASH/EVT.FLUID_LAYOUT.ITEMS_ADDED",
            );

            await Tester.dispatchAndWaitFor(undoLayoutChanges(), "GDC.DASH/EVT.FLUID_LAYOUT.LAYOUT_CHANGED");
            expect(selectLayout(Tester.state())).toEqual(layoutAfterFirst);

            await Tester.dispatchAndWaitFor(undoLayoutChanges(), "GDC.DASH/EVT.FLUID_LAYOUT.LAYOUT_CHANGED");
            expect(selectLayout(Tester.state())).toEqual(originalLayout);
        });

        it("should emit events correctly", async () => {
            await Tester.dispatchAndWaitFor(
                addSectionItem(TestSectionIdx, -1, TestKpiPlaceholderItem, false, TestCorrelation),
                "GDC.DASH/EVT.FLUID_LAYOUT.ITEMS_ADDED",
            );

            expect(Tester.emittedEventsDigest()).toMatchSnapshot();
        });
    });
});
