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
            ...InitialUndoState,
        };
    }

    it("should correctly handle remove section", () => {
        const initialState = createLayoutSliceInitialState(SimpleDashboardLayout);

        const newState = produce(initialState, (draft) => {
            const removeAction = layoutActions.removeSection({
                section: 0,
                undo: { cmd: removeLayoutSection(0, undefined, "correlation") },
            });

            return layoutReducers.removeSection(draft, removeAction);
        });

        expect(newState.layout!.sections).toEqual([]);
        expect(newState._undo).toMatchSnapshot();
    });
});
