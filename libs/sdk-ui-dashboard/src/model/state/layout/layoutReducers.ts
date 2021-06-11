// (C) 2021 GoodData Corporation
import { CaseReducer, PayloadAction } from "@reduxjs/toolkit";
import { LayoutState } from "./layoutState";
import { IDashboardLayout, IDashboardLayoutSectionHeader } from "@gooddata/sdk-backend-spi";
import { invariant } from "ts-invariant";
import { withUndo } from "../_infra/undoEnhancer";
import {
    ExtendedDashboardItem,
    ExtendedDashboardLayoutSection,
    RelativeIndex,
    StashedDashboardItemsId,
} from "../../types/layoutTypes";
import { addArrayElements, moveArrayElement, removeArrayElement } from "./arrayOps";

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
    index: RelativeIndex;
    usedStashes: StashedDashboardItemsId[];
};

const addSection: LayoutReducer<AddSectionActionPayload> = (state, action) => {
    invariant(state.layout);

    const { index, section, usedStashes } = action.payload;

    addArrayElements(state.layout.sections, index, [section]);

    usedStashes.forEach((stashIdentifier) => {
        delete state.stash[stashIdentifier];
    });
};

//
//
//

type RemoveSectionActionPayload = { index: RelativeIndex; stashIdentifier?: StashedDashboardItemsId };

const removeSection: LayoutReducer<RemoveSectionActionPayload> = (state, action) => {
    invariant(state.layout);

    const { index, stashIdentifier } = action.payload;

    if (stashIdentifier) {
        const items = state.layout.sections[index].items;

        state.stash[stashIdentifier] = items;
    }

    removeArrayElement(state.layout.sections, index);
};

//
//
//

type ChangeSectionActionPayload = { index: number; header: IDashboardLayoutSectionHeader };

const changeSectionHeader: LayoutReducer<ChangeSectionActionPayload> = (state, action) => {
    invariant(state.layout);

    const { index, header } = action.payload;

    state.layout.sections[index].header = header;
};

//
//
//

type MoveSectionActionPayload = { sectionIndex: number; toIndex: RelativeIndex };

const moveSection: LayoutReducer<MoveSectionActionPayload> = (state, action) => {
    invariant(state.layout);

    const { sectionIndex, toIndex } = action.payload;

    moveArrayElement(state.layout.sections, sectionIndex, toIndex);
};

//
//
//

type AddSectionItemsActionPayload = {
    sectionIndex: number;
    itemIndex: number;
    items: ExtendedDashboardItem[];
    usedStashes: StashedDashboardItemsId[];
};

const addSectionItems: LayoutReducer<AddSectionItemsActionPayload> = (state, action) => {
    invariant(state.layout);

    const { sectionIndex, itemIndex, items, usedStashes } = action.payload;
    const section = state.layout.sections[sectionIndex];

    invariant(section);

    addArrayElements(section.items, itemIndex, items);

    usedStashes.forEach((stashIdentifier) => {
        delete state.stash[stashIdentifier];
    });
};

//
//
//

export const layoutReducers = {
    setLayout,
    addSection: withUndo(addSection),
    removeSection: withUndo(removeSection),
    moveSection: withUndo(moveSection),
    changeSectionHeader,
    addSectionItems: withUndo(addSectionItems),
};
