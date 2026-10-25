// (C) 2019-2026 GoodData Corporation

import { createAction } from "@reduxjs/toolkit";

import {
    type CatalogItem,
    type ICatalogAttributeHierarchy,
    type ICatalogDateAttributeHierarchy,
    type ICatalogGroup,
    type IParameterMetadataObject,
} from "@gooddata/sdk-model";

import { type IOrganizedCatalogTooltipDetails } from "../../typings/catalog.js";

export type CatalogAction =
    | ISetCatalogItemsAction
    | ISetCatalogGroupsAction
    | ISetCatalogLoadingFlagAction
    | ISetCatalogItemsAvailabilityAction
    | ISetCatalogAvailabilityErrorFlagAction
    | ISetCatalogFirstLoadedFlagAction
    | ISetItemTooltipDetailsAction
    | ISetUpdatedItemsCountAction
    | IResetTooltipDetailsAction
    | ISetIsWorkspaceEmptyAction
    | IToggleUnavailableItemsVisibilityAction
    | ISetDateHierarchies
    | ISetAttributeHierarchies
    | ISetCatalogAttributeHierarchiesHasChanged
    | ISetCatalogParameters;

export enum CatalogActionTypeKeys {
    STORE_SET_CATALOG_ITEMS = "STORE/SET_CATALOG_ITEMS",
    STORE_SET_CATALOG_GROUPS = "STORE/SET_CATALOG_GROUPS",
    STORE_SET_CATALOG_ITEMS_AVAILABILITY = "STORE/SET_CATALOG_ITEMS_AVAILABILITY",
    STORE_SET_CATALOG_FIRST_LOADED = "STORE/SET_CATALOG_FIRST_LOADED",
    STORE_SET_LOADING_ITEMS = "STORE/SET_LOADING_ITEMS",
    STORE_SET_LOADING_GROUPS = "STORE/SET_LOADING_GROUPS",
    STORE_SET_LOADING_AVAILABILITY = "STORE/SET_LOADING_AVAILABILITY",
    STORE_SET_AVAILABILITY_ERROR = "STORE/SET_AVAILABILITY_ERROR",
    STORE_SET_TOOLTIP_DETAILS = "STORE/SET_TOOLTIP_DETAILS",
    STORE_SET_UPDATED_ITEMS_COUNT = "STORE_SET_UPDATED_ITEMS_COUNT",
    STORE_RESET_TOOLTIP_DETAILS = "STORE_RESET_TOOLTIP_DETAILS",
    STORE_SET_IS_WORKSPACE_EMPTY = "STORE/SET_IS_WORKSPACE_EMPTY",
    STORE_TOGGLE_UNAVAILABLE_ITEMS_VISIBILITY = "STORE/TOGGLE_UNAVAILABLE_ITEMS_VISIBILITY",
    STORE_SET_DATE_HIERARCHIES = "STORE/SET_DATE_HIERARCHIES",
    STORE_SET_ATTRIBUTE_HIERARCHIES = "STORE/SET_ATTRIBUTE_HIERARCHIES",
    STORE_SET_ATTRIBUTE_HIERARCHIES_CHANGED = "STORE/SET_ATTRIBUTE_HIERARCHIES_CHANGED",
    STORE_SET_CATALOG_PARAMETERS = "STORE/SET_CATALOG_PARAMETERS",
}

export const setCatalogItems = createAction(
    CatalogActionTypeKeys.STORE_SET_CATALOG_ITEMS,
    (items: ReadonlyArray<CatalogItem>) => ({ payload: { items } }),
);

export type ISetCatalogItemsAction = ReturnType<typeof setCatalogItems>;

export const setCatalogGroups = createAction(
    CatalogActionTypeKeys.STORE_SET_CATALOG_GROUPS,
    (groups: ReadonlyArray<ICatalogGroup>) => ({ payload: { groups } }),
);

export type ISetCatalogGroupsAction = ReturnType<typeof setCatalogGroups>;

export const setCatalogItemsAvailability = createAction(
    CatalogActionTypeKeys.STORE_SET_CATALOG_ITEMS_AVAILABILITY,
    (itemUris: ReadonlyArray<string>) => ({ payload: { items: itemUris } }),
);

export type ISetCatalogItemsAvailabilityAction = ReturnType<typeof setCatalogItemsAvailability>;

export const setLoadingItems = createAction(
    CatalogActionTypeKeys.STORE_SET_LOADING_ITEMS,
    (isLoading: boolean) => ({ payload: { isLoading } }),
);

export const setLoadingGroups = createAction(
    CatalogActionTypeKeys.STORE_SET_LOADING_GROUPS,
    (isLoading: boolean) => ({ payload: { isLoading } }),
);

export const setLoadingAvailability = createAction(
    CatalogActionTypeKeys.STORE_SET_LOADING_AVAILABILITY,
    (isLoading: boolean) => ({ payload: { isLoading } }),
);

/**
 * The three loading flags share one payload shape and one reducer case group, so the domain type
 * stays a union — one creator per type string is what `createAction` requires, and what makes each
 * `.match` unambiguous.
 */
export type ISetCatalogLoadingFlagAction =
    | ReturnType<typeof setLoadingItems>
    | ReturnType<typeof setLoadingGroups>
    | ReturnType<typeof setLoadingAvailability>;

export const setAttributeHierarchiesChanged = createAction(
    CatalogActionTypeKeys.STORE_SET_ATTRIBUTE_HIERARCHIES_CHANGED,
    (hasChanged: boolean) => ({ payload: { attributeHierarchiesChanged: hasChanged } }),
);

export type ISetCatalogAttributeHierarchiesHasChanged = ReturnType<typeof setAttributeHierarchiesChanged>;

export const setAvailabilityError = createAction(
    CatalogActionTypeKeys.STORE_SET_AVAILABILITY_ERROR,
    (error: unknown) => ({ payload: { error } }),
);

export type ISetCatalogAvailabilityErrorFlagAction = ReturnType<typeof setAvailabilityError>;

export const setCatalogFirstLoaded = createAction(
    CatalogActionTypeKeys.STORE_SET_CATALOG_FIRST_LOADED,
    (firstLoaded: boolean) => ({ payload: { firstLoaded } }),
);

export type ISetCatalogFirstLoadedFlagAction = ReturnType<typeof setCatalogFirstLoaded>;

export const setItemTooltipDetails = createAction(
    CatalogActionTypeKeys.STORE_SET_TOOLTIP_DETAILS,
    (itemId: string, details: IOrganizedCatalogTooltipDetails) => ({ payload: { itemId, details } }),
);

export type ISetItemTooltipDetailsAction = ReturnType<typeof setItemTooltipDetails>;

export const setUpdatedItemsCount = createAction(
    CatalogActionTypeKeys.STORE_SET_UPDATED_ITEMS_COUNT,
    (count: number) => ({ payload: { count } }),
);

export type ISetUpdatedItemsCountAction = ReturnType<typeof setUpdatedItemsCount>;

export const resetTooltipDetails = createAction(CatalogActionTypeKeys.STORE_RESET_TOOLTIP_DETAILS);

export type IResetTooltipDetailsAction = ReturnType<typeof resetTooltipDetails>;

export const setIsWorkspaceEmpty = createAction(
    CatalogActionTypeKeys.STORE_SET_IS_WORKSPACE_EMPTY,
    (isEmpty: boolean) => ({ payload: { isEmpty } }),
);

export type ISetIsWorkspaceEmptyAction = ReturnType<typeof setIsWorkspaceEmpty>;

export const toggleUnavailableItemsVisibility = createAction(
    CatalogActionTypeKeys.STORE_TOGGLE_UNAVAILABLE_ITEMS_VISIBILITY,
    (showUnavailableItems: boolean) => ({ payload: { showUnavailableItems } }),
);

export type IToggleUnavailableItemsVisibilityAction = ReturnType<typeof toggleUnavailableItemsVisibility>;

export const setDateHierarchies = createAction(
    CatalogActionTypeKeys.STORE_SET_DATE_HIERARCHIES,
    (dateHierarchies: ICatalogDateAttributeHierarchy[]) => ({ payload: { dateHierarchies } }),
);

export type ISetDateHierarchies = ReturnType<typeof setDateHierarchies>;

export const setAttributeHierarchies = createAction(
    CatalogActionTypeKeys.STORE_SET_ATTRIBUTE_HIERARCHIES,
    (attributeHierarchies: ICatalogAttributeHierarchy[]) => ({ payload: { attributeHierarchies } }),
);

export type ISetAttributeHierarchies = ReturnType<typeof setAttributeHierarchies>;

export const setCatalogParameters = createAction(
    CatalogActionTypeKeys.STORE_SET_CATALOG_PARAMETERS,
    (parameters: ReadonlyArray<IParameterMetadataObject>) => ({ payload: { parameters } }),
);

export type ISetCatalogParameters = ReturnType<typeof setCatalogParameters>;
