// (C) 2021 GoodData Corporation
import cloneDeep from "lodash/cloneDeep";
import { SimpleDashboardLayout } from "../../../tests/Dashboard.fixtures";
import { LayoutState } from "../layoutState";
import { InitialUndoState } from "../../_infra/undoEnhancer";
import { IDashboardLayout } from "@gooddata/sdk-backend-spi";
import produce from "immer";
import { layoutReducers } from "../layoutReducers";
import { removeLayoutSection } from "../../../commands";
import { layoutActions } from "../index";

describe("layout slice reducer", () => {
    function createLayoutSliceInitialState(layout?: IDashboardLayout): LayoutState {
        const copyOfLayout = cloneDeep(layout);

        return {
            layout: copyOfLayout,
            stash: {},
            ...InitialUndoState,
        };
    }

    it("should correctly handle remove section and create undo entry", () => {
        const initialState = createLayoutSliceInitialState(SimpleDashboardLayout);

        const newState = produce(initialState, (draft) => {
            const removeAction = layoutActions.removeSection({
                index: 0,
                undo: { cmd: removeLayoutSection(0, undefined, "correlation") },
            });

            return layoutReducers.removeSection(draft, removeAction);
        });

        expect(newState.layout!.sections).toEqual([]);
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

            return layoutReducers.removeSection(draft, removeAction);
        });

        expect(newState.layout!.sections).toEqual([]);
        expect(newState.stash["testStash"]).toEqual(initialState.layout!.sections[0].items);
    });
});
