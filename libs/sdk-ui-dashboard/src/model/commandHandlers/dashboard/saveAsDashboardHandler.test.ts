// (C) 2021-2026 GoodData Corporation

import { beforeEach, describe, expect, it } from "vitest";

import { idRef, isInsightWidget } from "@gooddata/sdk-model";

import { TestCorrelation } from "../../../tests/Dashboard.test.helpers.js";
import {
    SimpleDashboardIdentifier,
    SimpleDashboardLayout,
} from "../../../tests/SimpleDashboard.test.helpers.js";
import { saveDashboard, saveDashboardAs } from "../../commands/dashboard.js";
import { addLayoutSection } from "../../commands/layout.js";
import { createDashboardTab } from "../../commands/tabs.js";
import { type DashboardTester, preloadedTesterFactory } from "../../DashboardTester.js";
import { type DashboardCopySaved, type DashboardSaved } from "../../events/dashboard.js";
import { selectDashboardTitle, selectPersistedDashboard } from "../../store/meta/metaSelectors.js";
import { selectFilterContextIdentity } from "../../store/tabs/filterContext/filterContextSelectors.js";
import { tabsActions } from "../../store/tabs/index.js";
import { selectBasicLayout } from "../../store/tabs/layout/layoutSelectors.js";
import { TestInsightItem } from "../../tests/Layout.test.helpers.js";
import { isTemporaryIdentity } from "../../utils/dashboardItemUtils.js";

describe("save as dashboard handler", () => {
    describe("for a new dashboard", () => {
        let Tester: DashboardTester;
        // each test starts with a new dashboard

        beforeEach(async () => {
            await preloadedTesterFactory(
                (tester) => {
                    Tester = tester;
                },
                undefined,
                {
                    backendConfig: {
                        useRefType: "id",
                    },
                },
            );
        });

        const TestDashboardTitle = "My Dashboard Copy";

        it("should save an existing dashboard as a copy and switch to copy", async () => {
            await Tester.dispatchAndWaitFor(
                addLayoutSection(0, {}, [TestInsightItem], false, TestCorrelation),
                "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_ADDED",
            );

            const initialSaveEvent: DashboardSaved = await Tester.dispatchAndWaitFor(
                saveDashboard(),
                "GDC.DASH/EVT.SAVED",
            );

            expect(initialSaveEvent.payload.newDashboard).toEqual(true);
            const source = selectBasicLayout(Tester.state()).sections[0].items[0].widget;
            if (!isInsightWidget(source)) {
                throw new Error("Expected an insight widget");
            }
            Tester.dispatch(
                tabsActions.replaceWidgetDrillWithoutUndo({
                    ref: source.ref,
                    drillDefinitions: [
                        {
                            type: "drillToCustomUrl",
                            transition: "new-window",
                            origin: { type: "drillFromMeasure", measure: { localIdentifier: "m1" } },
                            target: {
                                url: "https://example.com/{dash_attribute_filter_selection(region)}",
                                references: { "{attribute_title(stale)}": [idRef("stale", "displayForm")] },
                            },
                        },
                    ],
                }),
            );
            const originalState = Tester.state();

            const event: DashboardCopySaved = await Tester.dispatchAndWaitFor(
                saveDashboardAs(TestDashboardTitle, true),
                "GDC.DASH/EVT.COPY_SAVED",
            );

            const copiedWidget = event.payload.dashboard.layout?.sections[0].items[0].widget;
            expect(copiedWidget).toMatchObject({
                drills: [
                    {
                        target: {
                            references: {
                                "{dash_attribute_filter_selection(region)}": [idRef("region", "displayForm")],
                            },
                        },
                    },
                ],
            });
            expect(event.payload.dashboard.ref).not.toEqual(initialSaveEvent.payload.dashboard.ref);
            expect(event.payload.dashboard.title).toEqual(TestDashboardTitle);
            expect(event.ctx.dashboardRef).toEqual(event.payload.dashboard.ref);
            const newState = Tester.state();

            const originalLayout = selectBasicLayout(originalState);
            const newLayout = selectBasicLayout(newState);

            expect(newLayout.sections[0].items[0].widget).not.toEqual(
                originalLayout.sections[0].items[0].widget,
            );
            expect(isTemporaryIdentity(newLayout.sections[0].items[0].widget!)).toEqual(false);

            expect(selectDashboardTitle(newState)).not.toEqual(selectDashboardTitle(originalState));
            expect(selectFilterContextIdentity(newState)).not.toEqual(
                selectFilterContextIdentity(originalState),
            );
            expect(selectPersistedDashboard(newState)?.ref).not.toEqual(
                selectPersistedDashboard(originalState)?.ref,
            );
        });

        it("should save an existing dashboard as a copy and leave current dashboard open", async () => {
            await Tester.dispatchAndWaitFor(
                addLayoutSection(0, {}, [TestInsightItem], false, TestCorrelation),
                "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_ADDED",
            );

            const initialSaveEvent: DashboardSaved = await Tester.dispatchAndWaitFor(
                saveDashboard(),
                "GDC.DASH/EVT.SAVED",
            );

            expect(initialSaveEvent.payload.newDashboard).toEqual(true);
            const originalState = Tester.state();

            const event: DashboardCopySaved = await Tester.dispatchAndWaitFor(
                saveDashboardAs(TestDashboardTitle, false),
                "GDC.DASH/EVT.COPY_SAVED",
            );

            expect(event.payload.dashboard.ref).not.toEqual(initialSaveEvent.payload.dashboard.ref);
            expect(event.payload.dashboard.title).toEqual(TestDashboardTitle);
            const newState = Tester.state();

            const originalLayout = selectBasicLayout(originalState);
            const newLayout = selectBasicLayout(newState);

            expect(newLayout.sections[0].items[0].widget).toEqual(originalLayout.sections[0].items[0].widget);
            expect(selectDashboardTitle(newState)).toEqual(selectDashboardTitle(originalState));
            expect(selectFilterContextIdentity(newState)).toEqual(selectFilterContextIdentity(originalState));
            expect(selectPersistedDashboard(newState)?.ref).toEqual(
                selectPersistedDashboard(originalState)?.ref,
            );
        });

        it("should keep the first 255 characters of a longer title", async () => {
            const title = "a".repeat(255);

            const event: DashboardCopySaved = await Tester.dispatchAndWaitFor(
                saveDashboardAs(`${title}b`, false),
                "GDC.DASH/EVT.COPY_SAVED",
            );

            expect(event.payload.dashboard.title).toEqual(title);
        });

        it("should keep a title of exactly 255 characters", async () => {
            const title = "a".repeat(255);

            const event: DashboardCopySaved = await Tester.dispatchAndWaitFor(
                saveDashboardAs(title, false),
                "GDC.DASH/EVT.COPY_SAVED",
            );

            expect(event.payload.dashboard.title).toEqual(title);
        });

        it("should emit correct events", async () => {
            await Tester.dispatchAndWaitFor(
                saveDashboardAs("My Dashboard Copy", false, true, TestCorrelation),
                "GDC.DASH/EVT.COPY_SAVED",
            );

            expect(Tester.emittedEventsDigest()).toMatchSnapshot();
        });
    });

    describe("for an existing dashboard", () => {
        let Tester: DashboardTester;

        beforeEach(async () => {
            await preloadedTesterFactory((tester) => {
                Tester = tester;
            }, SimpleDashboardIdentifier);
        });

        const TestDashboardTitle = "My Dashboard Copy";

        it("should use the original title when the cut leaves only whitespace", async () => {
            const originalTitle = selectDashboardTitle(Tester.state());
            expect(originalTitle).not.toEqual("");

            const event: DashboardCopySaved = await Tester.dispatchAndWaitFor(
                saveDashboardAs(" ".repeat(300), false),
                "GDC.DASH/EVT.COPY_SAVED",
            );

            expect(event.payload.dashboard.title).toEqual(originalTitle);
        });

        it("should save an existing emit correct events", async () => {
            await Tester.dispatchAndWaitFor(
                saveDashboardAs(TestDashboardTitle, true, undefined, TestCorrelation),
                "GDC.DASH/EVT.COPY_SAVED",
            );

            expect(Tester.emittedEventsDigest()).toMatchSnapshot();
        });

        it("should copy every tab when saved from an empty tab", async () => {
            Tester.dispatch(createDashboardTab());
            await Tester.waitFor("GDC.DASH/EVT.TAB.SWITCHED");

            const event: DashboardCopySaved = await Tester.dispatchAndWaitFor(
                saveDashboardAs(TestDashboardTitle, false),
                "GDC.DASH/EVT.COPY_SAVED",
            );

            const copiedTabs = event.payload.dashboard.tabs ?? [];
            expect(copiedTabs).toHaveLength(2);
            expect(copiedTabs[0].layout?.sections.length).toBeGreaterThan(0);
            expect(copiedTabs[0].layout?.sections[0].items ?? []).toHaveLength(
                SimpleDashboardLayout.sections[0].items.length,
            );
            expect(copiedTabs[1].layout?.sections ?? []).toHaveLength(0);
        });
    });
});
