// (C) 2021-2022 GoodData Corporation
import cloneDeep from "lodash/cloneDeep.js";
import { LayoutState } from "../layoutState.js";
import { InitialUndoState } from "../../_infra/undoEnhancer.js";
import {
    InsightDrillDefinition,
    IInsightWidget,
    IDashboardLayout,
    IAttributeHierarchyReference,
} from "@gooddata/sdk-model";
import { layoutReducers } from "../layoutReducers.js";
import {
    addDrillDownForInsightWidget,
    modifyDrillsForInsightWidget,
    removeLayoutSection,
} from "../../../commands/index.js";
import { layoutActions } from "../index.js";
import { produce } from "immer";
import {
    DrillToDashboardFromWonMeasureDefinition,
    SimpleDashboardLayout,
    SimpleSortedTableWidgetRef,
} from "../../../tests/fixtures/SimpleDashboard.fixtures.js";
import { ExtendedDashboardWidget } from "../../../types/layoutTypes.js";
import { describe, it, expect } from "vitest";
import { ignoredHierarchies } from "../../../tests/fixtures/Dashboard.fixtures.js";

describe("layout slice reducer", () => {
    function createLayoutSliceInitialState(layout?: IDashboardLayout): LayoutState {
        const copyOfLayout = cloneDeep(layout);

        return {
            layout: copyOfLayout as IDashboardLayout<ExtendedDashboardWidget>,
            stash: {},
            ...InitialUndoState,
        };
    }

    describe("removeSection action", () => {
        it("should correctly handle remove section and create undo entry", () => {
            const initialState = createLayoutSliceInitialState(SimpleDashboardLayout);

            const newState = produce(initialState, (draft) => {
                const removeAction = layoutActions.removeSection({
                    index: 0,
                    undo: { cmd: removeLayoutSection(0, undefined, "correlation") },
                });

                return layoutReducers.removeSection(draft, removeAction) as any;
            });

            expect(newState.layout!.sections).toEqual(initialState.layout?.sections.slice(1));
            expect(newState._undo).toMatchSnapshot();
        });

        it("should correctly stash items when section is removed", () => {
            const initialState = createLayoutSliceInitialState(SimpleDashboardLayout);

            const newState = produce(initialState, (draft) => {
                const removeAction = layoutActions.removeSection({
                    index: 0,
                    stashIdentifier: "testStash",
                    undo: { cmd: removeLayoutSection(0, "testStash", "correlation") },
                });

                return layoutReducers.removeSection(draft, removeAction) as any;
            });

            expect(newState.layout!.sections).toEqual(initialState.layout?.sections.slice(1));
            expect(newState.stash["testStash"]).toEqual(initialState.layout!.sections[0].items);
        });
    });

    describe("replaceWidgetDrill action", () => {
        const drills: InsightDrillDefinition[] = [DrillToDashboardFromWonMeasureDefinition];

        const getModifiedWidgetFromLayoutState = (
            layoutState: LayoutState,
            sectionIndex: number,
            itemIndex: number,
        ): IInsightWidget => {
            return layoutState.layout!.sections[sectionIndex].items[itemIndex].widget as IInsightWidget;
        };

        it("should correctly handle replace widget drill and create undo entry", () => {
            const initialState = createLayoutSliceInitialState(SimpleDashboardLayout);
            const newState = produce(initialState, (draft) => {
                const removeAction = layoutActions.replaceWidgetDrills({
                    ref: SimpleSortedTableWidgetRef,
                    drillDefinitions: drills,
                    undo: {
                        cmd: modifyDrillsForInsightWidget(SimpleSortedTableWidgetRef, drills, "correlation"),
                    },
                });

                return layoutReducers.replaceWidgetDrills(draft, removeAction) as any;
            });

            expect(getModifiedWidgetFromLayoutState(newState, 1, 0).drills).toEqual(drills);

            expect(newState._undo).toMatchSnapshot();
        });
    });

    describe("replaceWidgetBlacklistHierarchies action", () => {
        const getModifiedWidgetFromLayoutState = (
            layoutState: LayoutState,
            sectionIndex: number,
            itemIndex: number,
        ): IInsightWidget => {
            return layoutState.layout!.sections[sectionIndex].items[itemIndex].widget as IInsightWidget;
        };

        it("should correctly handle replace widget blacklist hierarchies and create undo entry", () => {
            const attribute = (ignoredHierarchies[0] as IAttributeHierarchyReference).label;
            const hierarchy = (ignoredHierarchies[0] as IAttributeHierarchyReference).attributeHierarchy;
            const initialState = createLayoutSliceInitialState(SimpleDashboardLayout);
            const newState = produce(initialState, (draft) => {
                const removeAction = layoutActions.replaceWidgetBlacklistHierarchies({
                    ref: SimpleSortedTableWidgetRef,
                    blacklistHierarchies: ignoredHierarchies,
                    undo: {
                        cmd: addDrillDownForInsightWidget(
                            SimpleSortedTableWidgetRef,
                            attribute,
                            hierarchy,
                            "correlation",
                        ),
                    },
                });

                return layoutReducers.replaceWidgetBlacklistHierarchies(draft, removeAction) as any;
            });

            expect(getModifiedWidgetFromLayoutState(newState, 1, 0).ignoredDrillDownHierarchies).toEqual(
                ignoredHierarchies,
            );

            expect(newState._undo).toMatchSnapshot();
        });
    });
});
