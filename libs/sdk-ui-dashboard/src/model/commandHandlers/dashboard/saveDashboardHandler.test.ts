// (C) 2021-2026 GoodData Corporation

import { beforeEach, describe, expect, it, vi } from "vitest";

import {
    type IDashboard,
    type IDashboardDefinition,
    type IDashboardLayout,
    type IDashboardWidget,
    type IInsightWidget,
    type ObjRef,
    areObjRefsEqual,
    idRef,
    isInsightWidget,
    isInsightWidgetDefinition,
} from "@gooddata/sdk-model";

import { TestCorrelation } from "../../../tests/Dashboard.test.helpers.js";
import {
    SimpleDashboardFilterContext,
    SimpleDashboardIdentifier,
    SimpleDashboardWithReferences,
} from "../../../tests/SimpleDashboard.test.helpers.js";
import { changeDashboardDefinition, saveDashboard } from "../../commands/dashboard.js";
import { addLayoutSection } from "../../commands/layout.js";
import { createDashboardTab, switchDashboardTab } from "../../commands/tabs.js";
import { type DashboardTester, preloadedTesterFactory } from "../../DashboardTester.js";
import { type DashboardSaved } from "../../events/dashboard.js";
import { configActions } from "../../store/config/index.js";
import { selectInsights } from "../../store/insights/insightsSelectors.js";
import { selectPersistedDashboard } from "../../store/meta/metaSelectors.js";
import { selectFilterContextIdentity } from "../../store/tabs/filterContext/filterContextSelectors.js";
import { tabsActions } from "../../store/tabs/index.js";
import { selectBasicLayout } from "../../store/tabs/layout/layoutSelectors.js";
import { selectActiveTabLocalIdentifier } from "../../store/tabs/tabsSelectors.js";
import { uiActions } from "../../store/ui/index.js";
import {
    selectInsightNotSavedDialogDraftInsightsToPersist,
    selectIsInsightNotSavedDialogOpen,
} from "../../store/ui/uiSelectors.js";
import { TestInsightItem } from "../../tests/Layout.test.helpers.js";
import { isTemporaryIdentity } from "../../utils/dashboardItemUtils.js";

import { dashboardWithDrillReferences } from "./dashboardDrillReferences.js";
import { getDashboardWithSharing } from "./saveDashboardHandler.js";

const AiDrafts = ["A", "B"].map((suffix, index) => ({
    ...SimpleDashboardWithReferences.dashboard,
    identifier: `draft-${suffix}`,
    ref: idRef(`draft-${suffix}`),
    uri: `/draft-${suffix}`,
    title: `Draft ${suffix}`,
    filterContext: SimpleDashboardFilterContext,
    tabs: undefined,
    layout: {
        ...SimpleDashboardWithReferences.dashboard.layout!,
        sections: SimpleDashboardWithReferences.dashboard
            .layout!.sections.slice(1, index + 2)
            .map((section) => ({ ...section, items: section.items.slice(0, 1) })),
    },
}));

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
            expect(event.payload.savedInsights).toEqual([]);

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
            expect(event.payload.savedInsights).toEqual([]);
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

        it("should use updated AI mode when saving an existing dashboard", async () => {
            let existingDashboardTester: DashboardTester;
            await preloadedTesterFactory((tester) => {
                existingDashboardTester = tester;
            }, SimpleDashboardIdentifier);

            existingDashboardTester!.dispatch(configActions.setAiMode("active"));

            const event: DashboardSaved = await existingDashboardTester!.dispatchAndWaitFor(
                saveDashboard(),
                "GDC.DASH/EVT.SAVED",
            );

            expect(event.payload.originalDashboardId).toEqual(SimpleDashboardIdentifier);
            expect(event.payload.savedInsights).toEqual([]);
        });

        it.each([
            [0, 1, false],
            [1, 0, false],
            [0, 1, true],
            [1, 0, true],
        ] as const)(
            "saves the opened AI draft, not the previously opened one (first: %s, opened: %s, first already saved: %s)",
            async (firstIndex, openedIndex, firstAlreadySaved) => {
                const firstDraft = AiDrafts[firstIndex];
                const openedDraft = AiDrafts[openedIndex];
                const workspace = Tester.ctx.backend.workspace(Tester.ctx.workspace);
                const dashboards = workspace.dashboards();
                vi.spyOn(workspace, "dashboards").mockReturnValue(dashboards);
                vi.spyOn(Tester.ctx.backend, "workspace").mockReturnValue(workspace);

                // The recorded backend's create always generates an ID; use its persistence
                // implementation with the supplied identity to support the AI create contract.
                const create = vi
                    .spyOn(dashboards, "createDashboard")
                    .mockImplementation((definition) =>
                        dashboards.updateDashboard({ ...definition, title: "" } as IDashboard, definition),
                    );
                const get = vi.spyOn(dashboards, "getDashboard");
                if (firstAlreadySaved) {
                    await dashboards.updateDashboard({ ...firstDraft, title: "" }, firstDraft);
                }

                Tester.dispatch(configActions.setAiMode("active"));
                for (const draft of [firstDraft, openedDraft]) {
                    await Tester.dispatchAndWaitFor(
                        changeDashboardDefinition(draft),
                        "GDC.DASH/EVT.DEFINITION_CHANGED",
                    );
                }
                get.mockClear();

                const event: DashboardSaved = await Tester.dispatchAndWaitFor(
                    saveDashboard(),
                    "GDC.DASH/EVT.SAVED",
                );

                expect(get).toHaveBeenCalledExactlyOnceWith(openedDraft.ref);
                expect(create).toHaveBeenCalledExactlyOnceWith(
                    expect.objectContaining({
                        identifier: openedDraft.identifier,
                        ref: openedDraft.ref,
                        uri: openedDraft.uri,
                        title: openedDraft.title,
                    }),
                    false,
                );
                expect(event.payload.newDashboard).toBe(true);
                expect(event.payload.originalDashboardId).toBe(openedDraft.identifier);
                expect(event.payload.dashboard.identifier).toBe(openedDraft.identifier);
                expect(event.ctx.dashboardRef).toEqual(openedDraft.ref);

                const storedDashboard = await dashboards.getDashboard(openedDraft.ref);
                expect(storedDashboard.title).toBe(openedDraft.title);
                expect(storedDashboard.layout).toEqual(openedDraft.layout);
                expect(storedDashboard.layout?.sections.flatMap((section) => section.items)).toHaveLength(
                    openedIndex + 1,
                );
                const previousDashboard = await dashboards
                    .getDashboard(firstDraft.ref)
                    .catch(({ httpStatus }) => ({ httpStatus }));
                expect(previousDashboard).toEqual(firstAlreadySaved ? firstDraft : { httpStatus: 404 });
            },
        );

        it("keeps the saved dashboard identity when applying other AI definitions", async () => {
            let existingDashboardTester: DashboardTester;
            await preloadedTesterFactory((tester) => {
                existingDashboardTester = tester;
            }, SimpleDashboardIdentifier);
            existingDashboardTester!.dispatch(configActions.setAiMode("active"));

            for (const draft of AiDrafts) {
                await existingDashboardTester!.dispatchAndWaitFor(
                    changeDashboardDefinition(draft),
                    "GDC.DASH/EVT.DEFINITION_CHANGED",
                );
            }
            const event: DashboardSaved = await existingDashboardTester!.dispatchAndWaitFor(
                saveDashboard(),
                "GDC.DASH/EVT.SAVED",
            );

            expect(event.payload.newDashboard).toBe(false);
            expect(event.payload.originalDashboardId).toBe(SimpleDashboardIdentifier);
            expect(event.payload.dashboard.identifier).toBe(SimpleDashboardIdentifier);
            expect(event.payload.dashboard.title).toBe(AiDrafts[1].title);
            expect(event.payload.dashboard.layout).toEqual(AiDrafts[1].layout);
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
            const layoutWithSection = selectBasicLayout(stateWithSection);
            const firstWidget = layoutWithSection.sections[0].items[0].widget;
            expect(firstWidget && isInsightWidget(firstWidget)).toBe(true);

            if (!firstWidget || !isInsightWidget(firstWidget)) {
                throw new Error("Expected first dashboard widget to be an insight widget.");
            }

            const draftInsightRef = idRef("unsaved-draft-insight-1", "insight");

            Tester.dispatch(
                tabsActions.setLayout({
                    ...layoutWithSection,
                    sections: [
                        {
                            ...layoutWithSection.sections[0],
                            items: [
                                {
                                    ...layoutWithSection.sections[0].items[0],
                                    widget: {
                                        ...firstWidget,
                                        insight: draftInsightRef,
                                    },
                                },
                            ],
                        },
                    ],
                }),
            );

            Tester.dispatch({
                type: "insights/setInsights",
                payload: [
                    {
                        insight: {
                            ref: draftInsightRef,
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
            const layoutWithSection = selectBasicLayout(stateWithSection);
            const firstWidget = layoutWithSection.sections[0].items[0].widget;
            expect(firstWidget && isInsightWidget(firstWidget)).toBe(true);

            if (!firstWidget || !isInsightWidget(firstWidget) || !firstTabId) {
                throw new Error(
                    "Expected first dashboard widget to be an insight widget and first tab id set.",
                );
            }

            const draftInsightRef = idRef("unsaved-draft-insight-2", "insight");

            Tester.dispatch(
                tabsActions.setLayout({
                    ...layoutWithSection,
                    sections: [
                        {
                            ...layoutWithSection.sections[0],
                            items: [
                                {
                                    ...layoutWithSection.sections[0].items[0],
                                    widget: {
                                        ...firstWidget,
                                        insight: draftInsightRef,
                                    },
                                },
                            ],
                        },
                    ],
                }),
            );

            Tester.dispatch({
                type: "insights/setInsights",
                payload: [
                    {
                        insight: {
                            ref: draftInsightRef,
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
            const layoutWithSection = selectBasicLayout(stateWithSection);
            const firstWidget = layoutWithSection.sections[0].items[0].widget;
            expect(firstWidget && isInsightWidget(firstWidget)).toBe(true);

            if (!firstWidget || !isInsightWidget(firstWidget)) {
                throw new Error("Expected first dashboard widget to be an insight widget.");
            }

            const draftInsightRef = idRef("unsaved-draft-insight-3", "insight");

            Tester.dispatch(
                tabsActions.setLayout({
                    ...layoutWithSection,
                    sections: [
                        {
                            ...layoutWithSection.sections[0],
                            items: [
                                {
                                    ...layoutWithSection.sections[0].items[0],
                                    widget: {
                                        ...firstWidget,
                                        insight: draftInsightRef,
                                    },
                                },
                            ],
                        },
                    ],
                }),
            );

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

            const oldInsightRef = draftInsightRef;

            Tester.dispatch(saveDashboard(undefined, TestCorrelation));
            await Tester.wait(200);

            expect(selectIsInsightNotSavedDialogOpen(Tester.state())).toBe(true);
            const draftInsightsToPersistOnDialog = selectInsightNotSavedDialogDraftInsightsToPersist(
                Tester.state(),
            );
            const draftInsightToPersistRef = draftInsightsToPersistOnDialog[0]?.insight.ref;

            expect(draftInsightsToPersistOnDialog).toHaveLength(1);
            expect(
                draftInsightToPersistRef && areObjRefsEqual(draftInsightToPersistRef, draftInsightRef),
            ).toBe(true);
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
            expect(selectInsightNotSavedDialogDraftInsightsToPersist(stateAfterSave)).toEqual([]);
            expect(savedEvent.correlationId).toBe(TestCorrelation);
            expect(areObjRefsEqual(insightWidgetAfterSave.insight, oldInsightRef)).toBe(true);
            expect(insightsAfterSave.some((insight) => insight.insight.isDraft)).toBe(false);
            expect(savedEvent.payload.savedInsights).toEqual([
                {
                    originalInsightId: "unsaved-draft-insight-3",
                    savedInsightId: "unsaved-draft-insight-3",
                },
            ]);
        });

        it("should save dashboard without warning dialog when draft insight already exists on backend", async () => {
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
                            title: "Already persisted insight",
                            isDraft: true,
                        },
                    },
                ],
            });

            const savedEvent: DashboardSaved = await Tester.dispatchAndWaitFor(
                saveDashboard(undefined, TestCorrelation),
                "GDC.DASH/EVT.SAVED",
            );

            expect(savedEvent.correlationId).toBe(TestCorrelation);
            expect(savedEvent.payload.savedInsights).toEqual([]);
            expect(selectIsInsightNotSavedDialogOpen(Tester.state())).toBe(false);
            expect(selectInsightNotSavedDialogDraftInsightsToPersist(Tester.state())).toEqual([]);
        });

        it("should ignore pending save when draft insight save is canceled", async () => {
            await Tester.dispatchAndWaitFor(
                addLayoutSection(0, {}, [TestInsightItem], false, TestCorrelation),
                "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_ADDED",
            );

            const stateWithSection = Tester.state();
            const layoutWithSection = selectBasicLayout(stateWithSection);
            const firstWidget = layoutWithSection.sections[0].items[0].widget;
            expect(firstWidget && isInsightWidget(firstWidget)).toBe(true);

            if (!firstWidget || !isInsightWidget(firstWidget)) {
                throw new Error("Expected first dashboard widget to be an insight widget.");
            }

            const draftInsightRef = idRef("unsaved-draft-insight-4", "insight");

            Tester.dispatch(
                tabsActions.setLayout({
                    ...layoutWithSection,
                    sections: [
                        {
                            ...layoutWithSection.sections[0],
                            items: [
                                {
                                    ...layoutWithSection.sections[0].items[0],
                                    widget: {
                                        ...firstWidget,
                                        insight: draftInsightRef,
                                    },
                                },
                            ],
                        },
                    ],
                }),
            );

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

            Tester.dispatch(saveDashboard(undefined, TestCorrelation));
            await Tester.wait(200);

            expect(selectIsInsightNotSavedDialogOpen(Tester.state())).toBe(true);
            const draftInsightsToPersistOnDialog = selectInsightNotSavedDialogDraftInsightsToPersist(
                Tester.state(),
            );
            const draftInsightToPersistRef = draftInsightsToPersistOnDialog[0]?.insight.ref;

            expect(draftInsightsToPersistOnDialog).toHaveLength(1);
            expect(
                draftInsightToPersistRef && areObjRefsEqual(draftInsightToPersistRef, draftInsightRef),
            ).toBe(true);

            Tester.dispatch(uiActions.closeInsightNotSavedDialog());
            await Tester.wait(200);

            expect(selectIsInsightNotSavedDialogOpen(Tester.state())).toBe(false);
            expect(selectInsightNotSavedDialogDraftInsightsToPersist(Tester.state())).toEqual([]);
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

            const firstTabLayout = selectBasicLayout(stateWithFirstTabSection);
            const draftInsightRef = idRef("unsaved-draft-insight-5", "insight");

            Tester.dispatch(
                tabsActions.setLayout({
                    ...firstTabLayout,
                    sections: [
                        {
                            ...firstTabLayout.sections[0],
                            items: [
                                {
                                    ...firstTabLayout.sections[0].items[0],
                                    widget: {
                                        ...firstTabWidget,
                                        insight: draftInsightRef,
                                    },
                                },
                            ],
                        },
                    ],
                }),
            );

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

            const secondTabLayout = selectBasicLayout(stateWithSecondTabSection);

            Tester.dispatch(
                tabsActions.setLayout({
                    ...secondTabLayout,
                    sections: [
                        {
                            ...secondTabLayout.sections[0],
                            items: [
                                {
                                    ...secondTabLayout.sections[0].items[0],
                                    widget: {
                                        ...secondTabWidget,
                                        insight: draftInsightRef,
                                    },
                                },
                            ],
                        },
                    ],
                }),
            );

            const updatedSecondTabWidget = selectBasicLayout(Tester.state()).sections[0].items[0].widget;

            expect(updatedSecondTabWidget && isInsightWidget(updatedSecondTabWidget)).toBe(true);

            if (!updatedSecondTabWidget || !isInsightWidget(updatedSecondTabWidget)) {
                throw new Error("Expected second tab widget to be an insight widget.");
            }

            expect(areObjRefsEqual(updatedSecondTabWidget.insight, draftInsightRef)).toBe(true);

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

describe("saved custom URL dependencies", () => {
    it.each(["root", "tab", "nested", "switcher"])(
        "refreshes dependencies in a %s layout without mutating state",
        (location) => {
            const definition = TestInsightItem.widget;
            if (!isInsightWidgetDefinition(definition)) {
                throw new Error("Expected an insight widget");
            }
            const source: IInsightWidget = {
                ...definition,
                ref: idRef("source"),
                identifier: "source",
                uri: "source",
            };
            const dashboardWithReferences = (references?: Record<string, ObjRef[]>): IDashboardDefinition => {
                const insightWidget = {
                    ...source,
                    drills: [
                        {
                            type: "drillToCustomUrl",
                            transition: "new-window",
                            origin: { type: "drillFromMeasure", measure: { localIdentifier: "m1" } },
                            target: {
                                url: "https://example.com/{dash_attribute_filter_selection(region)}",
                                references,
                            },
                        },
                    ],
                } satisfies IDashboardWidget;
                const baseLayout: IDashboardLayout = {
                    type: "IDashboardLayout",
                    sections: [
                        {
                            type: "IDashboardLayoutSection",
                            items: [
                                {
                                    ...TestInsightItem,
                                    widget: insightWidget,
                                },
                            ],
                        },
                    ],
                };
                const widget: IDashboardWidget =
                    location === "switcher"
                        ? {
                              ...source,
                              type: "visualizationSwitcher",
                              drills: [],
                              visualizations: [insightWidget],
                          }
                        : { ...baseLayout, ref: idRef("nested"), identifier: "nested", uri: "nested" };
                const resultLayout =
                    location === "nested" || location === "switcher"
                        ? {
                              ...baseLayout,
                              sections: [
                                  { ...baseLayout.sections[0], items: [{ ...TestInsightItem, widget }] },
                              ],
                          }
                        : baseLayout;
                return location === "tab"
                    ? {
                          type: "IDashboard",
                          shareStatus: "private",
                          title: "Test",
                          description: "",
                          tabs: [{ localIdentifier: "tab", title: "Tab", layout: resultLayout }],
                      }
                    : {
                          type: "IDashboard",
                          shareStatus: "private",
                          title: "Test",
                          description: "",
                          layout: resultLayout,
                      };
            };
            const stale = { "{attribute_title(removed)}": [idRef("removed", "displayForm")] };
            const input = dashboardWithReferences(stale);
            expect(dashboardWithDrillReferences(input, [])).toEqual(
                dashboardWithReferences({
                    "{dash_attribute_filter_selection(region)}": [idRef("region", "displayForm")],
                }),
            );
            expect(input).toEqual(dashboardWithReferences(stale));
        },
    );
});
