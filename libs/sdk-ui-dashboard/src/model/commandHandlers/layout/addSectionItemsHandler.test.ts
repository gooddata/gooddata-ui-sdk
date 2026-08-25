// (C) 2021-2026 GoodData Corporation

// @vitest-environment node

import { afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { uriRef } from "@gooddata/sdk-model";

import { type IAddSectionItems, addSectionItem, undoLayoutChanges } from "../../commands/layout.js";
import { type DashboardTester, preloadedTesterFactory } from "../../DashboardTester.js";
import { type IDashboardCommandFailed } from "../../events/general.js";
import { type IDashboardLayoutSectionItemsAdded } from "../../events/layout.js";
import { ComplexDashboardIdentifier } from "../../fixtures/ComplexDashboard.fixtures.js";
import { TestCorrelation, TestStash } from "../../fixtures/Dashboard.fixtures.js";
import {
    TestInsightItem,
    TestInsightPlaceholderItem,
    TestKpiPlaceholderItem,
    createTestInsightItem,
} from "../../fixtures/Layout.fixtures.js";
import { SimpleDashboardIdentifier } from "../../fixtures/SimpleDashboard.fixtures.js";
import { selectInsightByRef } from "../../store/insights/insightsSelectors.js";
import { selectLayout, selectUndoableLayoutCommands } from "../../store/tabs/layout/layoutSelectors.js";

/*
 * Bootstrapping a dashboard tester (recorded backend + store + the whole InitializeDashboard flow) is by far the
 * most expensive thing happening in this file - it costs roughly an order of magnitude more than dispatching the
 * tested command and running the assertions. The tests below therefore share a single bootstrapped dashboard
 * wherever they can and roll the layout back to its initial state instead of paying for a fresh bootstrap.
 */

/**
 * Reverts all layout changes done by a test, so that the next test using the same tester starts with the very
 * same layout it would get from a freshly bootstrapped dashboard.
 */
async function rollbackLayoutChanges(tester: DashboardTester): Promise<void> {
    while (selectUndoableLayoutCommands(tester.state()).length > 0) {
        await tester.dispatchAndWaitFor(undoLayoutChanges(), "GDC.DASH/EVT.FLUID_LAYOUT.LAYOUT_CHANGED");
    }
}

describe("add section items handler", () => {
    describe("for any dashboard", () => {
        /*
         * These tests assert on insights being loaded into the state - that is not part of the layout and cannot
         * be rolled back, so each of them needs its own freshly bootstrapped dashboard.
         */
        describe("insight loading", () => {
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
                await Tester.dispatchAndWaitFor(
                    undoLayoutChanges(),
                    "GDC.DASH/EVT.FLUID_LAYOUT.LAYOUT_CHANGED",
                );

                const insight = selectInsightByRef(TestInsightItem.widget!.insight)(Tester.state());
                expect(insight).toBeDefined();
            });
        });

        /*
         * These tests only verify that the command is rejected. A rejected command leaves the dashboard
         * untouched, so a single bootstrapped dashboard shared by all of them is enough.
         */
        describe("command validation", () => {
            let Tester: DashboardTester;

            beforeAll(async () => {
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

            beforeEach(() => {
                Tester.resetMonitors();
            });

            it("should fail if bad section is provided", async () => {
                const originalLayout = selectLayout(Tester.state());

                const event: IDashboardCommandFailed<IAddSectionItems> = await Tester.dispatchAndWaitFor(
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
                const event: IDashboardCommandFailed<IAddSectionItems> = await Tester.dispatchAndWaitFor(
                    addSectionItem(0, 4, TestKpiPlaceholderItem, false, TestCorrelation),
                    "GDC.DASH/EVT.COMMAND.FAILED",
                );

                expect(event.payload.reason).toEqual("USER_ERROR");
                expect(event.correlationId).toEqual(TestCorrelation);
            });

            it("should fail if attempting to add item with non-existent insight", async () => {
                const event: IDashboardCommandFailed<IAddSectionItems> = await Tester.dispatchAndWaitFor(
                    addSectionItem(
                        0,
                        4,
                        createTestInsightItem(uriRef("does-not-exist")),
                        false,
                        TestCorrelation,
                    ),
                    "GDC.DASH/EVT.COMMAND.FAILED",
                );

                expect(event.payload.reason).toEqual("USER_ERROR");
                expect(event.correlationId).toEqual(TestCorrelation);
            });

            it("should fail if bad stash identifier is provided", async () => {
                const event: IDashboardCommandFailed<IAddSectionItems> = await Tester.dispatchAndWaitFor(
                    addSectionItem(0, -1, TestStash, false, TestCorrelation),
                    "GDC.DASH/EVT.COMMAND.FAILED",
                );

                expect(event.payload.reason).toEqual("USER_ERROR");
                expect(event.correlationId).toEqual(TestCorrelation);
            });
        });
    });

    describe("for dashboard with existing sections", () => {
        let Tester: DashboardTester;

        /*
         * All the tests here only add items to the layout, which is fully undoable - a single bootstrapped
         * dashboard plus a rollback after each test gives the same isolation as a bootstrap per test.
         */
        beforeAll(async () => {
            await preloadedTesterFactory((tester) => {
                Tester = tester;
            }, ComplexDashboardIdentifier);
        });

        beforeEach(() => {
            Tester.resetMonitors();
        });

        afterEach(async () => {
            await rollbackLayoutChanges(Tester);
        });

        // this section has two existing items
        const TestSectionIdx = 1;

        it("should add new item as first item in an existing section", async () => {
            const event: IDashboardLayoutSectionItemsAdded = await Tester.dispatchAndWaitFor(
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
            const event: IDashboardLayoutSectionItemsAdded = await Tester.dispatchAndWaitFor(
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
            const event: IDashboardLayoutSectionItemsAdded = await Tester.dispatchAndWaitFor(
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
