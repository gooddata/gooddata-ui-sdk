// (C) 2019-2026 GoodData Corporation

import { clone, isEqual, range } from "lodash-es";

import { areObjRefsEqual } from "@gooddata/sdk-model";

import { isInsightContentResetEvent } from "../app_context/application_reset_events.js";

import {
    AttributeElementsActionTypeKeys,
    type AttributeElementsActions,
    type IAttributeElementsUpdateAction,
    type IAttributeElementsUpdatedAction,
} from "./attribute_elements_store_actions.js";
import { type IAttributeElements, type IAttributeElementsState } from "./attribute_elements_types.js";

export const ATTRIBUTE_ELEMENTS_INITIAL_STATE: IAttributeElementsState = {
    query: {
        attributeDisplayFormRef: undefined,
        searchPhrase: undefined,
    },
    items: [],
    total: undefined,
    filteredTotal: undefined,
    isLoading: false,
};

function attributeElementsUpdate(
    state: IAttributeElementsState,
    action: IAttributeElementsUpdateAction,
): IAttributeElementsState {
    const { attributeDisplayFormRef, searchPhrase, start, end } = action.payload;
    const currentQuery = state.query;
    const newQuery = { attributeDisplayFormRef, searchPhrase };

    if (!isEqual(currentQuery, newQuery)) {
        const isSameAttribute = areObjRefsEqual(
            currentQuery.attributeDisplayFormRef,
            newQuery.attributeDisplayFormRef,
        );
        return {
            filteredTotal: undefined,
            items: markLoadingElements([], start, end),
            total: isSameAttribute ? state.total : undefined,
            query: newQuery,
            isLoading: true,
        };
    }

    return {
        ...state,
        items: markLoadingElements(state.items, start, end),
    };
}

function markLoadingElements(elements: IAttributeElements, start: number, end: number) {
    const newElements = clone(elements);
    range(start, end).forEach((index) => {
        if (newElements[index] === undefined) {
            newElements[index] = null;
        }
    });
    return newElements;
}

function attributeElementsUpdated(
    state: IAttributeElementsState,
    action: IAttributeElementsUpdatedAction,
): IAttributeElementsState {
    const { attributeDisplayFormRef, searchPhrase, start, total, items } = action.payload;

    const currentQuery = state.query;
    const newQuery = { attributeDisplayFormRef, searchPhrase };

    if (isEqual(currentQuery, newQuery)) {
        const newItems = clone(state.items);
        range(start, start + items.length).forEach((idx) => {
            newItems[idx] = items[idx - start];
        });
        newItems.splice(total);

        return {
            ...state,
            items: newItems,
            total: state.total || total,
            isLoading: false,
            filteredTotal: total,
        };
    }

    return state;
}

export const attributeElementsReducer = (
    state = ATTRIBUTE_ELEMENTS_INITIAL_STATE,
    action: AttributeElementsActions,
): IAttributeElementsState => {
    // the application resets (store/app_context/application_reset_events.ts)
    if (isInsightContentResetEvent(action)) {
        return ATTRIBUTE_ELEMENTS_INITIAL_STATE;
    }

    switch (action.type) {
        case AttributeElementsActionTypeKeys.ATTRIBUTE_ELEMENTS_UPDATE:
            return attributeElementsUpdate(state, action);

        case AttributeElementsActionTypeKeys.ATTRIBUTE_ELEMENTS_UPDATED:
            return attributeElementsUpdated(state, action);

        default:
            return state;
    }
};
