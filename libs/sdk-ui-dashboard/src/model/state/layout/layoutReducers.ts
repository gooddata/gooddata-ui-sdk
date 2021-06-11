// (C) 2021 GoodData Corporation
import { CaseReducer, Draft, PayloadAction } from "@reduxjs/toolkit";
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
import { WritableDraft } from "immer/dist/types/types-external";

type LayoutReducer<A> = CaseReducer<LayoutState, PayloadAction<A>>;

//
//
//

function addArrayElements<T>(arr: WritableDraft<T[]>, index: RelativeIndex, items: Draft<T[]>) {
    if (index === 0) {
        arr.unshift(...items);
    } else if (index === -1) {
        arr.push(...items);
    } else {
        arr.splice(index, 0, ...items);
    }
}

function removeArrayElement<T>(arr: WritableDraft<T[]>, index: RelativeIndex): Draft<T> | undefined {
    if (index === 0) {
        return arr.shift();
    } else if (index === -1) {
        return arr.pop();
    } else {
        const element = arr.splice(index, 1);

        return element[0];
    }
}

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
    changeSectionHeader,
    addSectionItems: withUndo(addSectionItems),
};
