// (C) 2022 GoodData Corporation

import { IAttributeElement, IElementsQueryResult } from "@gooddata/sdk-backend-spi";
import { IElementQueryResultWithEmptyItems } from "../../AttributeDropdown/types";
import { useEffect, useState } from "react";
import { ATTRIBUTE_FILTER_BUTTON_LIMIT } from "../constants";
import { IAttributeFilter, isAttributeElementsByRef } from "@gooddata/sdk-model";
import { getInitialIsInverted, getInitialSelectedOptions } from "../AttributeFilterButtonUtils";
import isEqual from "lodash/isEqual";

interface IAttributeFilterButtonState {
    selectedFilterOptions: IAttributeElement[];
    appliedFilterOptions: IAttributeElement[];
    isInverted: boolean;
    appliedIsInverted: boolean;
    firstLoad: boolean;
    searchString: string;
    offset: number;
    limit: number;
    isDropdownOpen: boolean;
    validOptions: IElementQueryResultWithEmptyItems;
    uriToAttributeElementMap: Map<string, IAttributeElement>;
    isFiltering: boolean;
    /**
     * This flag simulates previous value for `searchString` value. If the search string changes, it will force
     * elements reloading.
     *
     * Implementation of this flag covers some edge case scenarios which resulted into fetching incorrect
     * elements for current searched value.
     */
    needsReloadAfterSearch: boolean;
}

export const useAttributeFilterButtonState = (currentFilter: IAttributeFilter) => {
    /**
     * AttributeFilterButton state initialization
     */
    const [state, setState] = useState<IAttributeFilterButtonState>(() => {
        const initialSelection = getInitialSelectedOptions(currentFilter);
        const initialIsInverted = getInitialIsInverted(currentFilter);

        return {
            selectedFilterOptions: initialSelection,
            appliedFilterOptions: initialSelection,
            isInverted: initialIsInverted,
            appliedIsInverted: initialIsInverted,
            firstLoad: true,
            searchString: "",
            offset: 0,
            limit: ATTRIBUTE_FILTER_BUTTON_LIMIT,
            isDropdownOpen: false,
            validOptions: null,
            uriToAttributeElementMap: new Map<string, IAttributeElement>(),
            isFiltering: false,
            needsReloadAfterSearch: false,
        };
    });

    const onCurrentFilterChange = (currentFilter: IAttributeFilter) => {
        setState((prevValue) => {
            const initialSelection = getInitialSelectedOptions(currentFilter);
            const initialIsInverted = getInitialIsInverted(currentFilter);

            // todo check if there is need to handle values here
            const selectedOptionsUris = prevValue.selectedFilterOptions.map((opt) => opt.uri);
            const appliedOptionsUris = prevValue.appliedFilterOptions.map((opt) => opt.uri);
            const initialSelectionUris = initialSelection.map((opt) => opt.uri);

            let resultState = prevValue;

            if (!isEqual(selectedOptionsUris, initialSelectionUris)) {
                resultState = {
                    ...resultState,
                    selectedFilterOptions: initialSelection,
                };
            }

            if (!isEqual(appliedOptionsUris, initialSelectionUris)) {
                resultState = {
                    ...resultState,
                    appliedFilterOptions: initialSelection,
                };
            }

            if (prevValue.isInverted !== initialIsInverted) {
                resultState = {
                    ...resultState,
                    isInverted: initialIsInverted,
                    appliedIsInverted: initialIsInverted,
                };
            }
            // if no change returning prevValue effectively skips the setState
            return resultState;
        });
    };

    const clearUriToElementMap = () => {
        setState((prevState) => {
            return {
                ...prevState,
                uriToAttributeElementMap: new Map<string, IAttributeElement>(),
            };
        });
    };

    const resetSelection = () => {
        setState((prevState) => {
            return {
                ...prevState,
                selectedFilterOptions: [],
                appliedFilterOptions: [],
                isInverted: true,
                appliedIsInverted: true,
                validOptions: null,
                isFiltering: true,
            };
        });
    };

    const mapInitialSelectionElements = (initialElements: IElementsQueryResult) => {
        setState((prevState) => {
            const uriToAttributeElementMap = new Map(prevState.uriToAttributeElementMap);
            initialElements.items?.forEach((item) => {
                const key = isAttributeElementsByRef(initialElements) ? item.uri : item.title;
                uriToAttributeElementMap.set(key, item);
            });

            return {
                ...prevState,
                uriToAttributeElementMap,
            };
        });
    };

    /**
     * Effects
     */
    useEffect(() => {
        setState((prevState) => {
            return {
                ...prevState,
                validOptions: null,
                offset: 0,
                limit: ATTRIBUTE_FILTER_BUTTON_LIMIT,
                needsReloadAfterSearch: true,
            };
        });
    }, [state.searchString]);

    return {
        state,
        setState,
        onCurrentFilterChange,
        clearUriToElementMap,
        resetSelection,
        mapInitialSelectionElements,
    };
};
