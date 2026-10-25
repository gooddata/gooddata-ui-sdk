// (C) 2007-2026 GoodData Corporation

import { createAction } from "@reduxjs/toolkit";

import { type ObjRef } from "@gooddata/sdk-model";

import { type IAttributeElements } from "./attribute_elements_types.js";

export enum AttributeElementsActionTypeKeys {
    ATTRIBUTE_ELEMENTS_UPDATE = "STORE/ATTRIBUTE_ELEMENTS_UPDATE",
    ATTRIBUTE_ELEMENTS_UPDATED = "STORE/ATTRIBUTE_ELEMENTS_UPDATED",
}

export type AttributeElementsActions = IAttributeElementsUpdateAction | IAttributeElementsUpdatedAction;

export const attributeElementsUpdate = createAction(
    AttributeElementsActionTypeKeys.ATTRIBUTE_ELEMENTS_UPDATE,
    (attributeDisplayFormRef: ObjRef, searchPhrase: string, start: number, end: number) => ({
        payload: { attributeDisplayFormRef, searchPhrase, start, end },
    }),
);

export type IAttributeElementsUpdateAction = ReturnType<typeof attributeElementsUpdate>;

export const attributeElementsUpdated = createAction(
    AttributeElementsActionTypeKeys.ATTRIBUTE_ELEMENTS_UPDATED,
    (
        attributeDisplayFormRef: ObjRef,
        searchPhrase: string,
        start: number,
        end: number,
        items: IAttributeElements,
        total: number,
    ) => ({
        payload: { attributeDisplayFormRef, searchPhrase, start, end, items, total },
    }),
);

export type IAttributeElementsUpdatedAction = ReturnType<typeof attributeElementsUpdated>;
