// (C) 2021 GoodData Corporation
import { CaseReducer, PayloadAction } from "@reduxjs/toolkit";
import { LayoutState } from "./layoutState";
import { IDashboardLayout } from "@gooddata/sdk-backend-spi";
import { invariant } from "ts-invariant";
import { withUndo } from "../_infra/undoEnhancer";
import { ExtendedDashboardLayoutSection, StashedDashboardItemsId } from "../../types/layoutTypes";

type LayoutReducer<A> = CaseReducer<LayoutState, PayloadAction<A>>;

//
//
//

const setLayout: LayoutReducer<IDashboardLayout> = (state, action) => {
    state.layout = action.payload;
};

//
//
//

type AddSectionActionPayload = {
    section: ExtendedDashboardLayoutSection;
    index: number;
    usedStashes: StashedDashboardItemsId[];
};

const addSection: LayoutReducer<AddSectionActionPayload> = (state, action) => {
    invariant(state.layout);

    const { index, section, usedStashes } = action.payload;

    if (index === 0) {
        state.layout.sections.unshift(section);
    } else if (index === -1) {
        state.layout.sections.push(section);
    } else {
        state.layout.sections.splice(index, 0, section);
    }

    usedStashes.forEach((stashIdentifier) => {
        delete state.stash[stashIdentifier];
    });
};

//
//
//

type RemoveSectionActionPayload = { index: number; stashIdentifier?: StashedDashboardItemsId };

const removeSection: LayoutReducer<RemoveSectionActionPayload> = (state, action) => {
    invariant(state.layout);

    const { index, stashIdentifier } = action.payload;

    if (stashIdentifier) {
        const items = state.layout.sections[index].items;

        state.stash[stashIdentifier] = items;
    }

    state.layout.sections.splice(action.payload.index, 1);
};

//
//
//

export const layoutReducers = {
    setLayout,
    addSection: withUndo(addSection),
    removeSection: withUndo(removeSection),
};
