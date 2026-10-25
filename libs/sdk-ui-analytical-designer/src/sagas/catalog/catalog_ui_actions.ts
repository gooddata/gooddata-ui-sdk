// (C) 2019-2026 GoodData Corporation

import { createAction } from "@reduxjs/toolkit";

import { type IPostMessageContextPayload } from "@gooddata/sdk-embedding";
import { type ICatalogAttributeHierarchy } from "@gooddata/sdk-model";

import { PostEventActionTypeKeys } from "../../postMessageApi/actions/action_types.js";
import { createPostMessageContextFromId } from "../../postMessageApi/actions/post_message_action_helper.js";
import { type IOrganizedCatalogItem } from "../../typings/catalog.js";

export enum CatalogUiActionTypeKeys {
    UI_ITEM_TOOLTIP_DETAILS_REQUEST = "UI/ITEM_TOOLTIP_DETAILS_REQUEST",
    UI_REFRESH_REQUESTED = "UI/REFRESH_REQUESTED",
    UI_TOGGLE_UNAVAILABLE_ITEMS_VISIBILITY = "UI/TOGGLE_UNAVAILABLE_ITEMS_VISIBILITY",
    UI_DELETE_CATALOG_ATTRIBUTE_HIERARCHY = "UI/DELETE_CATALOG_ATTRIBUTE_HIERARCHY",
    UI_UPDATE_CATALOG_ATTRIBUTE_HIERARCHY = "UI/UPDATE_CATALOG_ATTRIBUTE_HIERARCHY",
}

export const requestCatalogItemTooltipDetails = createAction(
    CatalogUiActionTypeKeys.UI_ITEM_TOOLTIP_DETAILS_REQUEST,
    (item: IOrganizedCatalogItem) => ({ payload: { item } }),
);

export type ICatalogItemTooltipDetailsRequestAction = ReturnType<typeof requestCatalogItemTooltipDetails>;

export const requestCatalogRefresh = createAction(
    CatalogUiActionTypeKeys.UI_REFRESH_REQUESTED,
    (preventRefreshAvailability?: boolean) => ({ payload: { preventRefreshAvailability } }),
);

export type ICatalogRefreshRequestedAction = ReturnType<typeof requestCatalogRefresh>;

export const toggleUnavailableItemsVisibility = createAction(
    CatalogUiActionTypeKeys.UI_TOGGLE_UNAVAILABLE_ITEMS_VISIBILITY,
    (showUnavailableItems?: boolean) => ({ payload: { showUnavailableItems } }),
);

export type ICatalogToggleUnavailableItemsVisibilityAction = ReturnType<
    typeof toggleUnavailableItemsVisibility
>;

interface IDeleteCatalogAttributeHierarchyActionPayload extends IPostMessageContextPayload {
    deletedAttributeHierarchyId: string;
}

export const deleteCatalogAttributeHierarchy = createAction(
    CatalogUiActionTypeKeys.UI_DELETE_CATALOG_ATTRIBUTE_HIERARCHY,
    (deletedAttributeHierarchyId: string): { payload: IDeleteCatalogAttributeHierarchyActionPayload } => ({
        payload: { deletedAttributeHierarchyId },
    }),
);

export type IDeleteCatalogAttributeHierarchyAction = ReturnType<typeof deleteCatalogAttributeHierarchy>;

interface IUpdateCatalogAttributeHierarchyActionPayload extends IPostMessageContextPayload {
    updatedAttributeHierarchy: ICatalogAttributeHierarchy;
}

export const updateCatalogAttributeHierarchy = createAction(
    CatalogUiActionTypeKeys.UI_UPDATE_CATALOG_ATTRIBUTE_HIERARCHY,
    (
        updatedAttributeHierarchy: ICatalogAttributeHierarchy,
        postMessageContextId?: string,
    ): { payload: IUpdateCatalogAttributeHierarchyActionPayload } => {
        const postMessageContext: IPostMessageContextPayload =
            createPostMessageContextFromId(postMessageContextId);

        return { payload: { updatedAttributeHierarchy, ...postMessageContext } };
    },
);

export type IUpdateCatalogAttributeHierarchyAction = ReturnType<typeof updateCatalogAttributeHierarchy>;

export const attributeHierarchyModified = createAction(
    PostEventActionTypeKeys.ATTRIBUTE_HIERARCHY_MODIFIED,
    (contextId?: string): { payload: IPostMessageContextPayload } => ({
        payload: { ...createPostMessageContextFromId(contextId) },
    }),
);

export const CatalogUiActions = {
    requestCatalogItemTooltipDetails,
    requestCatalogRefresh,
    toggleUnavailableItemsVisibility,
    deleteCatalogAttributeHierarchy,
    updateCatalogAttributeHierarchy,
    attributeHierarchyModified,
};
