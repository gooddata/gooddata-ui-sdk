// (C) 2019-2026 GoodData Corporation

import { isEqual } from "lodash-es";

import {
    type CatalogItem,
    type ICatalogAttributeHierarchy,
    type ICatalogDateAttributeHierarchy,
    type ICatalogGroup,
    type IParameterMetadataObject,
} from "@gooddata/sdk-model";

import { type CatalogAction, CatalogActionTypeKeys } from "./catalog_store_actions.js";
import { type ICatalogState } from "./catalog_types.js";

export const initialCatalogState: ICatalogState = {
    groups: [],
    items: [],
    availableItemsUris: null,
    updatedItemsCount: null,
    flags: {
        loadingGroups: false,
        loadingItems: false,
        loadingAvailability: false,
        availabilityError: null,
        firstLoaded: false,
        attributeHierarchiesChanged: false,
    },
    tooltipDetails: {},
    isWorkspaceEmpty: false,
    showUnavailableItems: false,
    dateHierarchies: [],
    attributeHierarchies: [],
    parameters: [],
};

// Read-only lenses encapsulating the state shape to be used
export const catalogStateGroups = (state: ICatalogState): readonly ICatalogGroup[] => state.groups;
export const catalogStateItems = (state: ICatalogState): readonly CatalogItem[] => state.items;
export const catalogStateAvailableItemsUris = (state: ICatalogState): readonly string[] =>
    state.availableItemsUris;
export const catalogStateFlags = (state: ICatalogState): ICatalogState["flags"] => state.flags;
export const catalogStateTooltipDetails = (state: ICatalogState): ICatalogState["tooltipDetails"] =>
    state.tooltipDetails;
export const catalogDateHierarchies = (state: ICatalogState): readonly ICatalogDateAttributeHierarchy[] =>
    state.dateHierarchies;
export const catalogAttributeHierarchies = (state: ICatalogState): readonly ICatalogAttributeHierarchy[] =>
    state.attributeHierarchies;
export const catalogStateParameters = (state: ICatalogState): readonly IParameterMetadataObject[] =>
    state.parameters;

const catalogFlagsReducer = (
    state: ICatalogState["flags"],
    action: CatalogAction,
): ICatalogState["flags"] => {
    switch (action.type) {
        case CatalogActionTypeKeys.STORE_SET_LOADING_GROUPS:
            return {
                ...state,
                loadingGroups: action.payload.isLoading,
            };
        case CatalogActionTypeKeys.STORE_SET_LOADING_ITEMS:
            return {
                ...state,
                loadingItems: action.payload.isLoading,
            };
        case CatalogActionTypeKeys.STORE_SET_ATTRIBUTE_HIERARCHIES_CHANGED:
            return {
                ...state,
                attributeHierarchiesChanged: action.payload.attributeHierarchiesChanged,
            };
        case CatalogActionTypeKeys.STORE_SET_LOADING_AVAILABILITY:
            return {
                ...state,
                loadingAvailability: action.payload.isLoading,
            };
        case CatalogActionTypeKeys.STORE_SET_AVAILABILITY_ERROR:
            return {
                ...state,
                availabilityError: action.payload.error,
            };
        case CatalogActionTypeKeys.STORE_SET_CATALOG_FIRST_LOADED:
            return {
                ...state,
                firstLoaded: action.payload.firstLoaded,
            };
        default:
            return state;
    }
};

export const catalogReducer = (state = initialCatalogState, action: CatalogAction): ICatalogState => {
    switch (action.type) {
        case CatalogActionTypeKeys.STORE_SET_CATALOG_ITEMS: {
            const { items } = action.payload;

            // prevent setting identical catalog items thus avoiding unnecessary expensive re-renders
            if (isEqual(items, catalogStateItems(state))) {
                return state;
            }

            return {
                ...state,
                items,
            };
        }
        case CatalogActionTypeKeys.STORE_SET_CATALOG_GROUPS: {
            const { groups } = action.payload;

            // prevent setting identical catalog groups thus avoiding unnecessary expensive re-renders
            if (isEqual(groups, catalogStateGroups(state))) {
                return state;
            }

            return {
                ...state,
                groups,
            };
        }
        case CatalogActionTypeKeys.STORE_SET_CATALOG_ITEMS_AVAILABILITY: {
            const { items: availableItemsUris } = action.payload;

            // prevent setting identical available uris thus avoiding unnecessary expensive re-renders
            if (isEqual(availableItemsUris, catalogStateAvailableItemsUris(state))) {
                return state;
            }

            return {
                ...state,
                availableItemsUris,
            };
        }
        case CatalogActionTypeKeys.STORE_SET_LOADING_ITEMS:
        case CatalogActionTypeKeys.STORE_SET_LOADING_GROUPS:
        case CatalogActionTypeKeys.STORE_SET_LOADING_AVAILABILITY:
        case CatalogActionTypeKeys.STORE_SET_AVAILABILITY_ERROR:
        case CatalogActionTypeKeys.STORE_SET_CATALOG_FIRST_LOADED:
        case CatalogActionTypeKeys.STORE_SET_ATTRIBUTE_HIERARCHIES_CHANGED:
            return {
                ...state,
                flags: catalogFlagsReducer(state.flags, action),
            };
        case CatalogActionTypeKeys.STORE_SET_TOOLTIP_DETAILS:
            return {
                ...state,
                tooltipDetails: {
                    ...state.tooltipDetails,
                    // Merge so that detail parts loaded independently (e.g. an attribute's dataset and
                    // its value samples) accumulate on the same item instead of overwriting each other.
                    [action.payload.itemId]: {
                        ...state.tooltipDetails[action.payload.itemId],
                        ...action.payload.details,
                    },
                },
            };
        case CatalogActionTypeKeys.STORE_SET_UPDATED_ITEMS_COUNT:
            return {
                ...state,
                updatedItemsCount: action.payload.count,
            };
        case CatalogActionTypeKeys.STORE_RESET_TOOLTIP_DETAILS:
            return {
                ...state,
                tooltipDetails: {},
            };
        case CatalogActionTypeKeys.STORE_SET_IS_WORKSPACE_EMPTY:
            return {
                ...state,
                isWorkspaceEmpty: action.payload.isEmpty,
            };
        case CatalogActionTypeKeys.STORE_TOGGLE_UNAVAILABLE_ITEMS_VISIBILITY:
            return {
                ...state,
                showUnavailableItems: action.payload.showUnavailableItems,
            };
        case CatalogActionTypeKeys.STORE_SET_DATE_HIERARCHIES: {
            return {
                ...state,
                dateHierarchies: action.payload.dateHierarchies,
            };
        }
        case CatalogActionTypeKeys.STORE_SET_ATTRIBUTE_HIERARCHIES: {
            return {
                ...state,
                attributeHierarchies: action.payload.attributeHierarchies,
            };
        }
        case CatalogActionTypeKeys.STORE_SET_CATALOG_PARAMETERS: {
            return {
                ...state,
                parameters: action.payload.parameters,
            };
        }
        default:
            return state;
    }
};
