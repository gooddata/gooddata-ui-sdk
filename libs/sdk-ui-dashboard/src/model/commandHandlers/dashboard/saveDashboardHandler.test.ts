// (C) 2021-2026 GoodData Corporation

import { beforeEach, describe, expect, it } from "vitest";

import {
    type IDashboardDefinition,
    type IDashboardLayout,
    areObjRefsEqual,
    idRef,
    isInsightWidget,
} from "@gooddata/sdk-model";

import { TestCorrelation } from "../../../tests/Dashboard.test.helpers.js";
import {
    SimpleDashboardFilterContext,
    SimpleDashboardWithReferences,
} from "../../../tests/SimpleDashboard.test.helpers.js";
import { saveDashboard } from "../../commands/dashboard.js";
import { addLayoutSection } from "../../commands/layout.js";
import { createDashboardTab, switchDashboardTab } from "../../commands/tabs.js";
import { type DashboardTester, preloadedTesterFactory } from "../../DashboardTester.js";
import { type DashboardSaved } from "../../events/dashboard.js";
import { selectInsights } from "../../store/insights/insightsSelectors.js";
import { selectPersistedDashboard } from "../../store/meta/metaSelectors.js";
import { selectFilterContextIdentity } from "../../store/tabs/filterContext/filterContextSelectors.js";
import { tabsActions } from "../../store/tabs/index.js";
import { selectBasicLayout } from "../../store/tabs/layout/layoutSelectors.js";
import { selectActiveTabLocalIdentifier } from "../../store/tabs/tabsSelectors.js";
import { uiActions } from "../../store/ui/index.js";
import { selectIsInsightNotSavedDialogOpen } from "../../store/ui/uiSelectors.js";
import { TestInsightItem } from "../../tests/Layout.test.helpers.js";
import { isTemporaryIdentity } from "../../utils/dashboardItemUtils.js";

import { getDashboardWithSharing } from "./saveDashboardHandler.js";

describe("save dashboard handler", () => {
    describe("for a new dashboard", () => {
        let Tester: DashboardTester;

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

        it("should save a new dashboard", async () => {
            // add something onto the layout
            await Tester.dispatchAndWaitFor(
                addLayoutSection(0, {}, [TestInsightItem], false, TestCorrelation),
                "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_ADDED",
            );
            // .. and perform save
            const event: DashboardSaved = await Tester.dispatchAndWaitFor(
                saveDashboard(),
                "GDC.DASH/EVT.SAVED",
            );

            expect(event.payload.dashboard.ref).toBeDefined();
            expect(event.payload.newDashboard).toEqual(true);

            const state = Tester.state();

            // verify that assigned identities of the entities that make up the dashboard are stored in the state
            expect(selectPersistedDashboard(state)?.ref).toEqual(event.payload.dashboard.ref);
            const filterContextIdentity = selectFilterContextIdentity(state);
            expect(filterContextIdentity).toBeDefined();
            expect(isTemporaryIdentity(filterContextIdentity!)).toBe(false);

            const layout = selectBasicLayout(state);
            expect(isTemporaryIdentity(layout.sections[0].items[0].widget!)).toEqual(false);
        });

        it("keeps a widget whose insight the user may not read", async () => {
            // Load a widget with an unavailable insight directly: the add command requires a readable insight.
            const restrictedInsight = idRef("restricted-insight-the-user-cannot-read", "insight");

            await Tester.dispatchAndWaitFor(
                addLayoutSection(0, {}, [TestInsightItem], false, TestCorrelation),
                "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_ADDED",
            );

            const loadedLayout = selectBasicLayout(Tester.state());
            const readableItem = loadedLayout.sections[0].items[0];
            const readableWidget = readableItem.widget;
            if (!isInsightWidget(readableWidget)) {
                throw new Error("Expected an insight widget in the loaded layout");
            }
            const restrictedItem = {
                ...readableItem,
                widget: {
                    ...readableWidget,
                    identifier: "widget-on-a-restricted-insight",
                    ref: idRef("widget-on-a-restricted-insight"),
                    insight: restrictedInsight,
                },
            };

            Tester.dispatch(
                tabsActions.setLayout({
                    ...loadedLayout,
                    sections: [{ ...loadedLayout.sections[0], items: [readableItem, restrictedItem] }],
                }),
            );
            expect(selectBasicLayout(Tester.state()).sections[0].items).toHaveLength(2);

            const event: DashboardSaved = await Tester.dispatchAndWaitFor(
                saveDashboard(),
                "GDC.DASH/EVT.SAVED",
            );

            const savedLayout: IDashboardLayout | undefined = event.payload.dashboard.layout;
            const savedWidgets =
                savedLayout?.sections.flatMap((section) => section.items.map((item) => item.widget)) ?? [];
            expect(savedWidgets).toHaveLength(2);
            expect(
                savedWidgets.some(
                    (widget) => isInsightWidget(widget) && areObjRefsEqual(widget.insight, restrictedInsight),
                ),
            ).toBe(true);
        });

        it("should save an existing dashboard", async () => {
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

            await Tester.dispatchAndWaitFor(
                addLayoutSection(-1, {}, [TestInsightItem], false, TestCorrelation),
                "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_ADDED",
            );
            const event: DashboardSaved = await Tester.dispatchAndWaitFor(
                saveDashboard(),
                "GDC.DASH/EVT.SAVED",
            );

            expect(event.payload.newDashboard).toEqual(false);
            const newState = Tester.state();

            const originalLayout = selectBasicLayout(originalState);
            const newLayout = selectBasicLayout(newState);

            expect(newLayout.sections[0].items[0].widget).toEqual(originalLayout.sections[0].items[0].widget);
            expect(isTemporaryIdentity(newLayout.sections[1].items[0].widget!)).toEqual(false);

            expect(selectFilterContextIdentity(newState)).toEqual(selectFilterContextIdentity(originalState));
            expect(selectPersistedDashboard(newState)?.ref).toEqual(
                selectPersistedDashboard(originalState)?.ref,
            );
        });

        it("should emit correct events", async () => {
            await Tester.dispatchAndWaitFor(saveDashboard(undefined, TestCorrelation), "GDC.DASH/EVT.SAVED");

            expect(Tester.emittedEventsDigest()).toMatchSnapshot();
        });

        it("should open warning dialog and block save when dashboard contains draft insight", async () => {
            await Tester.dispatchAndWaitFor(
                addLayoutSection(0, {}, [TestInsightItem], false, TestCorrelation),
                "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_ADDED",
            );

            const stateWithSection = Tester.state();
            const firstWidget = selectBasicLayout(stateWithSection).sections[0].items[0].widget;
            expect(firstWidget && isInsightWidget(firstWidget)).toBe(true);

            if (!firstWidget || !isInsightWidget(firstWidget)) {
                throw new Error("Expected first dashboard widget to be an insight widget.");
            }

            Tester.dispatch({
                type: "insights/setInsights",
                payload: [
                    {
                        insight: {
                            ref: firstWidget.insight,
                            isDraft: true,
                        },
                    },
                ],
            });

            Tester.dispatch(saveDashboard());
            await Tester.wait(200);

            expect(selectIsInsightNotSavedDialogOpen(Tester.state())).toBe(true);
            expect(Tester.emittedEvents().some((event) => event.type === "GDC.DASH/EVT.SAVED")).toBe(false);
        });

        it("should open warning dialog when draft insight exists only on an inactive tab", async () => {
            const firstTabId = Tester.select(selectActiveTabLocalIdentifier);
            expect(firstTabId).toBeDefined();

            await Tester.dispatchAndWaitFor(createDashboardTab("Tab 2"), "GDC.DASH/EVT.TAB.SWITCHED");
            await Tester.dispatchAndWaitFor(
                addLayoutSection(0, {}, [TestInsightItem], false, TestCorrelation),
                "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_ADDED",
            );

            const stateWithSection = Tester.state();
            const firstWidget = selectBasicLayout(stateWithSection).sections[0].items[0].widget;
            expect(firstWidget && isInsightWidget(firstWidget)).toBe(true);

            if (!firstWidget || !isInsightWidget(firstWidget) || !firstTabId) {
                throw new Error(
                    "Expected first dashboard widget to be an insight widget and first tab id set.",
                );
            }

            Tester.dispatch({
                type: "insights/setInsights",
                payload: [
                    {
                        insight: {
                            ref: firstWidget.insight,
                            isDraft: true,
                        },
                    },
                ],
            });

            await Tester.dispatchAndWaitFor(switchDashboardTab(firstTabId), "GDC.DASH/EVT.TAB.SWITCHED");

            Tester.dispatch(saveDashboard());
            await Tester.wait(200);

            expect(selectIsInsightNotSavedDialogOpen(Tester.state())).toBe(true);
            expect(Tester.emittedEvents().some((event) => event.type === "GDC.DASH/EVT.SAVED")).toBe(false);
        });

        it("should save draft insight first and then save dashboard after confirmation", async () => {
            await Tester.dispatchAndWaitFor(
                addLayoutSection(0, {}, [TestInsightItem], false, TestCorrelation),
                "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_ADDED",
            );

            const stateWithSection = Tester.state();
            const firstWidget = selectBasicLayout(stateWithSection).sections[0].items[0].widget;
            expect(firstWidget && isInsightWidget(firstWidget)).toBe(true);

            if (!firstWidget || !isInsightWidget(firstWidget)) {
                throw new Error("Expected first dashboard widget to be an insight widget.");
            }

            Tester.dispatch({
                type: "insights/setInsights",
                payload: [
                    {
                        insight: {
                            ref: firstWidget.insight,
                            title: "Draft insight",
                            isDraft: true,
                        },
                    },
                ],
            });

            const oldInsightRef = firstWidget.insight;

            Tester.dispatch(saveDashboard(undefined, TestCorrelation));
            await Tester.wait(200);

            expect(selectIsInsightNotSavedDialogOpen(Tester.state())).toBe(true);
            expect(Tester.emittedEvents().some((event) => event.type === "GDC.DASH/EVT.SAVED")).toBe(false);

            Tester.dispatch(uiActions.confirmInsightNotSavedDialogSubmit());
            const savedEvent: DashboardSaved = await Tester.waitFor("GDC.DASH/EVT.SAVED", 5000);

            const stateAfterSave = Tester.state();
            const insightWidgetAfterSave = selectBasicLayout(stateAfterSave).sections[0].items[0].widget;
            expect(insightWidgetAfterSave && isInsightWidget(insightWidgetAfterSave)).toBe(true);

            if (!insightWidgetAfterSave || !isInsightWidget(insightWidgetAfterSave)) {
                throw new Error("Expected first dashboard widget to be an insight widget.");
            }

            const insightsAfterSave = selectInsights(stateAfterSave);

            expect(selectIsInsightNotSavedDialogOpen(stateAfterSave)).toBe(false);
            expect(savedEvent.correlationId).toBe(TestCorrelation);
            expect(areObjRefsEqual(insightWidgetAfterSave.insight, oldInsightRef)).toBe(true);
            expect(insightsAfterSave.some((insight) => insight.insight.isDraft)).toBe(false);
        });

        it("should ignore pending save when draft insight save is canceled", async () => {
            await Tester.dispatchAndWaitFor(
                addLayoutSection(0, {}, [TestInsightItem], false, TestCorrelation),
                "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_ADDED",
            );

            const stateWithSection = Tester.state();
            const firstWidget = selectBasicLayout(stateWithSection).sections[0].items[0].widget;
            expect(firstWidget && isInsightWidget(firstWidget)).toBe(true);

            if (!firstWidget || !isInsightWidget(firstWidget)) {
                throw new Error("Expected first dashboard widget to be an insight widget.");
            }

            Tester.dispatch({
                type: "insights/setInsights",
                payload: [
                    {
                        insight: {
                            ref: firstWidget.insight,
                            title: "Draft insight",
                            isDraft: true,
                        },
                    },
                ],
            });

            Tester.dispatch(saveDashboard(undefined, TestCorrelation));
            await Tester.wait(200);

            expect(selectIsInsightNotSavedDialogOpen(Tester.state())).toBe(true);

            Tester.dispatch(uiActions.closeInsightNotSavedDialog());
            await Tester.wait(200);

            expect(selectIsInsightNotSavedDialogOpen(Tester.state())).toBe(false);
            expect(
                Tester.emittedEvents().some(
                    (event) =>
                        event.type === "GDC.DASH/EVT.COMMAND.FAILED" &&
                        event.correlationId === TestCorrelation,
                ),
            ).toBe(false);
            expect(
                Tester.emittedEvents().some(
                    (event) => event.type === "GDC.DASH/EVT.SAVED" && event.correlationId === TestCorrelation,
                ),
            ).toBe(false);
        });

        it("should save dashboard after confirmation when draft insight is used on active and inactive tabs", async () => {
            const firstTabId = Tester.select(selectActiveTabLocalIdentifier);
            expect(firstTabId).toBeDefined();

            await Tester.dispatchAndWaitFor(
                addLayoutSection(0, {}, [TestInsightItem], false, TestCorrelation),
                "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_ADDED",
            );

            const stateWithFirstTabSection = Tester.state();
            const firstTabWidget = selectBasicLayout(stateWithFirstTabSection).sections[0].items[0].widget;

            expect(firstTabWidget && isInsightWidget(firstTabWidget)).toBe(true);

            if (!firstTabWidget || !isInsightWidget(firstTabWidget) || !firstTabId) {
                throw new Error("Expected first tab widget to be an insight widget and first tab id set.");
            }

            const draftInsightRef = firstTabWidget.insight;

            await Tester.dispatchAndWaitFor(createDashboardTab("Tab 2"), "GDC.DASH/EVT.TAB.SWITCHED");
            const secondTabId = Tester.select(selectActiveTabLocalIdentifier);

            await Tester.dispatchAndWaitFor(
                addLayoutSection(0, {}, [TestInsightItem], false, TestCorrelation),
                "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_ADDED",
            );

            const stateWithSecondTabSection = Tester.state();
            const secondTabWidget = selectBasicLayout(stateWithSecondTabSection).sections[0].items[0].widget;

            expect(secondTabWidget && isInsightWidget(secondTabWidget)).toBe(true);

            if (!secondTabWidget || !isInsightWidget(secondTabWidget) || !secondTabId) {
                throw new Error("Expected second tab widget to be an insight widget and second tab id set.");
            }

            expect(areObjRefsEqual(secondTabWidget.insight, draftInsightRef)).toBe(true);

            Tester.dispatch({
                type: "insights/setInsights",
                payload: [
                    {
                        insight: {
                            ref: draftInsightRef,
                            title: "Draft insight",
                            isDraft: true,
                        },
                    },
                ],
            });

            await Tester.dispatchAndWaitFor(switchDashboardTab(firstTabId), "GDC.DASH/EVT.TAB.SWITCHED");

            Tester.dispatch(saveDashboard(undefined, TestCorrelation));
            await Tester.wait(200);

            expect(selectIsInsightNotSavedDialogOpen(Tester.state())).toBe(true);
            expect(Tester.emittedEvents().some((event) => event.type === "GDC.DASH/EVT.SAVED")).toBe(false);

            Tester.dispatch(uiActions.confirmInsightNotSavedDialogSubmit());
            const savedEvent: DashboardSaved = await Tester.waitFor("GDC.DASH/EVT.SAVED", 5000);

            await Tester.dispatchAndWaitFor(switchDashboardTab(secondTabId), "GDC.DASH/EVT.TAB.SWITCHED");

            const stateAfterSave = Tester.state();
            const secondTabWidgetAfterSave = selectBasicLayout(stateAfterSave).sections[0].items[0].widget;

            expect(secondTabWidgetAfterSave && isInsightWidget(secondTabWidgetAfterSave)).toBe(true);

            if (!secondTabWidgetAfterSave || !isInsightWidget(secondTabWidgetAfterSave)) {
                throw new Error("Expected second tab widget to be an insight widget.");
            }

            expect(areObjRefsEqual(secondTabWidgetAfterSave.insight, draftInsightRef)).toBe(true);
            expect(selectIsInsightNotSavedDialogOpen(stateAfterSave)).toBe(false);
            expect(savedEvent.correlationId).toBe(TestCorrelation);
        });
    });
});

describe("getDashboardWithSharing", () => {
    const filterContextDefinition = SimpleDashboardFilterContext;
    const dashboard: IDashboardDefinition = {
        ...SimpleDashboardWithReferences.dashboard,
        type: "IDashboard",
        filterContext: {
            ...filterContextDefinition,
        },
    };
    it.each([
        [true, { shareStatus: "private", isLocked: false, isUnderStrictControl: true }],
        [false, { shareStatus: "public", isLocked: false, isUnderStrictControl: undefined }],
    ])(
        "should set proper sharing on dashboard for new dashboard when supportsAccessControl %s",
        (sharingSupported, expectedResult) => {
            const { shareStatus, isLocked, isUnderStrictControl } = getDashboardWithSharing(
                dashboard,
                sharingSupported,
                true,
            );
            expect(shareStatus).toBe(expectedResult.shareStatus);
            expect(isLocked).toBe(expectedResult.isLocked);
            expect(isUnderStrictControl).toBe(expectedResult.isUnderStrictControl);
        },
    );
});
