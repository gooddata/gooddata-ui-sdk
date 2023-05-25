// (C) 2021-2022 GoodData Corporation
import { beforeEach, describe, it, expect } from "vitest";
import { DashboardTester, preloadedTesterFactory } from "../../../tests/DashboardTester.js";
import {
    EmptyDashboardIdentifier,
    TestCorrelation,
    TestStash,
} from "../../../tests/fixtures/Dashboard.fixtures.js";
import { AddLayoutSection, addLayoutSection, undoLayoutChanges } from "../../../commands/index.js";
import {
    DashboardCommandFailed,
    DashboardLayoutChanged,
    DashboardLayoutSectionAdded,
} from "../../../events/index.js";
import { selectLayout } from "../../../store/layout/layoutSelectors.js";
import { selectInsightByRef } from "../../../store/insights/insightsSelectors.js";
import { uriRef, IAnalyticalWidget } from "@gooddata/sdk-model";
import { SimpleDashboardIdentifier } from "../../../tests/fixtures/SimpleDashboard.fixtures.js";
import {
    createTestInsightItem,
    TestInsightItem,
    TestInsightPlaceholderItem,
    testItemWithDateDataset,
    testItemWithFilterIgnoreList,
    TestKpiPlaceholderItem,
} from "../../../tests/fixtures/Layout.fixtures.js";
import { ActivityDateDatasetRef } from "../../../tests/fixtures/CatalogAvailability.fixtures.js";

describe("add layout section handler", () => {
    describe("for an empty dashboard", () => {
        let Tester: DashboardTester;

        beforeEach(async () => {
            await preloadedTesterFactory(
                (tester) => {
                    Tester = tester;
                },
                EmptyDashboardIdentifier,
                {
                    backendConfig: {
                        useRefType: "id",
                    },
                },
            );
        });

        it("should add a new empty section at relative index 0", async () => {
            const event: DashboardLayoutSectionAdded = await Tester.dispatchAndWaitFor(
                addLayoutSection(0),
                "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_ADDED",
            );
            expect(event.payload.index).toEqual(0);
            expect(event.payload.section).toMatchSnapshot();

            const layout = selectLayout(Tester.state());
            expect(layout.sections[0]).toEqual(event.payload.section);
        });

        it("should add a new empty section at relative index -1", async () => {
            const event: DashboardLayoutSectionAdded = await Tester.dispatchAndWaitFor(
                addLayoutSection(0),
                "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_ADDED",
            );
            expect(event.payload.index).toEqual(0);
            expect(event.payload.section).toMatchSnapshot();

            const layout = selectLayout(Tester.state());
            expect(layout.sections[0]).toEqual(event.payload.section);
        });

        it("should add a new section and initialize its header", async () => {
            const event: DashboardLayoutSectionAdded = await Tester.dispatchAndWaitFor(
                addLayoutSection(0, { title: "My Section", description: "My Section Description" }),
                "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_ADDED",
            );
            expect(event.payload.section).toMatchSnapshot();

            const layout = selectLayout(Tester.state());
            expect(layout.sections[0]).toEqual(event.payload.section);
        });

        it("should add a new section and initialize its items", async () => {
            const event: DashboardLayoutSectionAdded = await Tester.dispatchAndWaitFor(
                addLayoutSection(0, undefined, [TestKpiPlaceholderItem, TestInsightPlaceholderItem]),
                "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_ADDED",
            );
            expect(event.payload.section.items).toMatchObject([
                TestKpiPlaceholderItem,
                TestInsightPlaceholderItem,
            ]);

            const layout = selectLayout(Tester.state());
            expect(layout.sections[0]).toEqual(event.payload.section);
        });

        it("should load and add insight when adding new section insight widget", async () => {
            await Tester.dispatchAndWaitFor(
                addLayoutSection(0, {}, [TestInsightItem], false, TestCorrelation),
                "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_ADDED",
            );

            const insight = selectInsightByRef(TestInsightItem.widget!.insight)(Tester.state());
            expect(insight).toBeDefined();
        });

        it("should auto-resolve insight's date dataset when adding insight widget", async () => {
            const event: DashboardLayoutSectionAdded = await Tester.dispatchAndWaitFor(
                addLayoutSection(0, {}, [TestInsightItem], true, TestCorrelation),
                "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_ADDED",
            );

            expect((event.payload.section.items[0].widget as IAnalyticalWidget).dateDataSet).toEqual(
                ActivityDateDatasetRef,
            );
        });

        it("should be undoable and revert to empty layout", async () => {
            await Tester.dispatchAndWaitFor(addLayoutSection(0), "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_ADDED");

            const event: DashboardLayoutChanged = await Tester.dispatchAndWaitFor(
                undoLayoutChanges(),
                "GDC.DASH/EVT.FLUID_LAYOUT.LAYOUT_CHANGED",
            );
            expect(event.payload.layout.sections).toEqual([]);

            const layout = selectLayout(Tester.state());
            expect(layout.sections).toEqual([]);
        });

        it("should not remove loaded insight during layouting undo", async () => {
            await Tester.dispatchAndWaitFor(
                addLayoutSection(0, {}, [TestInsightItem], false, TestCorrelation),
                "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_ADDED",
            );

            await Tester.dispatchAndWaitFor(undoLayoutChanges(), "GDC.DASH/EVT.FLUID_LAYOUT.LAYOUT_CHANGED");

            const insight = selectInsightByRef(TestInsightItem.widget!.insight)(Tester.state());
            expect(insight).toBeDefined();
        });

        it("should fail if bad section placement index is provided", async () => {
            const event: DashboardCommandFailed<AddLayoutSection> = await Tester.dispatchAndWaitFor(
                addLayoutSection(1, undefined, undefined, false, TestCorrelation),
                "GDC.DASH/EVT.COMMAND.FAILED",
            );

            expect(event.payload.reason).toEqual("USER_ERROR");
            expect(event.correlationId).toEqual(TestCorrelation);
        });

        it("should fail if attempting to add item with non-existent insight", async () => {
            const event: DashboardCommandFailed<AddLayoutSection> = await Tester.dispatchAndWaitFor(
                addLayoutSection(
                    0,
                    {},
                    [createTestInsightItem(uriRef("does-not-exist"))],
                    false,
                    TestCorrelation,
                ),
                "GDC.DASH/EVT.COMMAND.FAILED",
            );

            expect(event.payload.reason).toEqual("USER_ERROR");
            expect(event.correlationId).toEqual(TestCorrelation);
        });

        it("should fail if attempting to add insight widget with bad date dataset setting", async () => {
            const event: DashboardCommandFailed<AddLayoutSection> = await Tester.dispatchAndWaitFor(
                addLayoutSection(
                    0,
                    {},
                    [testItemWithDateDataset(TestInsightItem, uriRef("does-not-exist"))],
                    false,
                    TestCorrelation,
                ),
                "GDC.DASH/EVT.COMMAND.FAILED",
            );

            expect(event.payload.reason).toEqual("USER_ERROR");
            expect(event.correlationId).toEqual(TestCorrelation);
        });

        it("should fail if attempting to add insight widget with bad filter ignore list", async () => {
            const event: DashboardCommandFailed<AddLayoutSection> = await Tester.dispatchAndWaitFor(
                addLayoutSection(
                    0,
                    {},
                    [testItemWithFilterIgnoreList(TestInsightItem, [uriRef("does-not-exist")])],
                    false,
                    TestCorrelation,
                ),
                "GDC.DASH/EVT.COMMAND.FAILED",
            );

            expect(event.payload.reason).toEqual("USER_ERROR");
            expect(event.correlationId).toEqual(TestCorrelation);
        });

        it("should fail if bad stash identifier is provided", async () => {
            const event: DashboardCommandFailed<AddLayoutSection> = await Tester.dispatchAndWaitFor(
                addLayoutSection(0, undefined, [TestStash], false, TestCorrelation),
                "GDC.DASH/EVT.COMMAND.FAILED",
            );

            expect(event.payload.reason).toEqual("USER_ERROR");
            expect(event.correlationId).toEqual(TestCorrelation);
        });

        it("should correctly pass correlationId", async () => {
            const event: DashboardLayoutSectionAdded = await Tester.dispatchAndWaitFor(
                addLayoutSection(
                    0,
                    undefined,
                    [TestKpiPlaceholderItem, TestInsightPlaceholderItem],
                    false,
                    TestCorrelation,
                ),
                "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_ADDED",
            );

            expect(event.correlationId).toEqual(TestCorrelation);
        });
    });

    // Note: the SimpleDashboard contains a single two sections
    describe("for a dashboard with existing sections", () => {
        let Tester: DashboardTester;

        beforeEach(async () => {
            await preloadedTesterFactory((tester) => {
                Tester = tester;
            }, SimpleDashboardIdentifier);
        });

        it("should add new last section by using relative index -1", async () => {
            const originalLayout = selectLayout(Tester.state());
            const event: DashboardLayoutSectionAdded = await Tester.dispatchAndWaitFor(
                addLayoutSection(-1),
                "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_ADDED",
            );
            expect(event.payload.index).toEqual(originalLayout.sections.length);
            expect(event.payload.section).toMatchSnapshot();

            const layout = selectLayout(Tester.state());
            expect(layout.sections[originalLayout.sections.length]).toEqual(event.payload.section);
        });

        it("should add new first section by using index 0", async () => {
            const event: DashboardLayoutSectionAdded = await Tester.dispatchAndWaitFor(
                addLayoutSection(0),
                "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_ADDED",
            );
            expect(event.payload.index).toEqual(0);
            expect(event.payload.section).toMatchSnapshot();

            const layout = selectLayout(Tester.state());
            expect(layout.sections[0]).toEqual(event.payload.section);
        });

        it("should add a new section between two existing sections", async () => {
            const originalLayout = selectLayout(Tester.state());

            const lastSectionAdded: DashboardLayoutSectionAdded = await Tester.dispatchAndWaitFor(
                addLayoutSection(-1, undefined, [TestKpiPlaceholderItem]),
                "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_ADDED",
            );
            const middleSectionAdded: DashboardLayoutSectionAdded = await Tester.dispatchAndWaitFor(
                addLayoutSection(1, undefined, [TestInsightPlaceholderItem]),
                "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_ADDED",
            );

            const layout = selectLayout(Tester.state());
            expect(layout.sections.length).toBe(originalLayout.sections.length + 2);
            expect(layout.sections[4]).toEqual(lastSectionAdded.payload.section);
            expect(layout.sections[1]).toEqual(middleSectionAdded.payload.section);
        });

        it("should be undoable and revert to original layout", async () => {
            const originalLayout = selectLayout(Tester.state());

            await Tester.dispatchAndWaitFor(
                addLayoutSection(-1, undefined, [TestKpiPlaceholderItem]),
                "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_ADDED",
            );

            const updatedLayout = selectLayout(Tester.state());
            expect(originalLayout).not.toEqual(updatedLayout);

            const event: DashboardLayoutChanged = await Tester.dispatchAndWaitFor(
                undoLayoutChanges(),
                "GDC.DASH/EVT.FLUID_LAYOUT.LAYOUT_CHANGED",
            );
            expect(event.payload.layout).toEqual(originalLayout);

            const layoutAfterRevert = selectLayout(Tester.state());
            expect(layoutAfterRevert).toEqual(originalLayout);
        });

        it("should be undoable when multiple sections are added", async () => {
            const originalLayout = selectLayout(Tester.state());

            await Tester.dispatchAndWaitFor(
                addLayoutSection(-1, undefined, [TestKpiPlaceholderItem]),
                "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_ADDED",
            );
            const layoutAfterFirst = selectLayout(Tester.state());

            await Tester.dispatchAndWaitFor(
                addLayoutSection(-1, undefined, [TestInsightPlaceholderItem]),
                "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_ADDED",
            );

            // now undo command by command

            await Tester.dispatchAndWaitFor(undoLayoutChanges(), "GDC.DASH/EVT.FLUID_LAYOUT.LAYOUT_CHANGED");
            expect(selectLayout(Tester.state())).toEqual(layoutAfterFirst);

            await Tester.dispatchAndWaitFor(undoLayoutChanges(), "GDC.DASH/EVT.FLUID_LAYOUT.LAYOUT_CHANGED");
            expect(selectLayout(Tester.state())).toEqual(originalLayout);
        });
    });
});
