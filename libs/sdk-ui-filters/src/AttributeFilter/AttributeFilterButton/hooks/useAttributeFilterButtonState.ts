// (C) 2022 GoodData Corporation

import { IAnalyticalBackend, IAttributeElement, IElementsQueryResult } from "@gooddata/sdk-backend-spi";
import { IElementQueryResultWithEmptyItems, isNonEmptyListItem } from "../../AttributeDropdown/types";
import { useCallback, useEffect, useState } from "react";
import { ATTRIBUTE_FILTER_BUTTON_LIMIT } from "../constants";
import { IAttributeFilter } from "@gooddata/sdk-model";
import {
    checkFilterSetupForBackend,
    getInitialIsInverted,
    getInitialSelectedOptions,
} from "../AttributeFilterButtonUtils";
import isEqual from "lodash/isEqual";
import { mergeElementQueryResults } from "../../AttributeDropdown/mergeElementQueryResults";
import { updateSelectedOptionsWithDataByMap } from "../../utils/AttributeFilterUtils";
import compact from "lodash/compact";
import debounce from "lodash/debounce";

export interface IAttributeFilterButtonState {
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

/**
 * Provides a {@link IAttributeFilterButtonState} and a set of functions to handle the state
 * of {@link AttributeFilterButton} component.
 *
 * @param currentFilter - the filter object to initialize the component's state.
 */
export const useAttributeFilterButtonState = (
    currentFilter: IAttributeFilter,
    backend: IAnalyticalBackend,
) => {
    /**
     * AttributeFilterButton state initialization
     */
    const [state, setState] = useState<IAttributeFilterButtonState>(() => {
        checkFilterSetupForBackend(currentFilter, backend);

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

    const mapInitialSelectionElements = (initialElements: IElementsQueryResult, isElementsByRef: boolean) => {
        setState((prevState) => {
            const uriToAttributeElementMap = new Map(prevState.uriToAttributeElementMap);
            initialElements.items?.forEach((item) => {
                const key = isElementsByRef ? item.uri : item.title;
                uriToAttributeElementMap.set(key, item);
            });

            return {
                ...prevState,
                uriToAttributeElementMap,
            };
        });
    };

    const resolveAttributeElements = (
        elements: IElementsQueryResult,
        parentFilters: IAttributeFilter[],
        isElementsByRef: boolean,
    ) => {
        setState((prevState) => {
            const mergedValidElements = mergeElementQueryResults(prevState.validOptions, elements);
            const newUriToAttributeElementMap = new Map(prevState.uriToAttributeElementMap);

            const { items } = mergedValidElements;

            items.filter(isNonEmptyListItem).forEach((item) => {
                const key = isElementsByRef ? item.uri : item.title;
                newUriToAttributeElementMap.set(key, item);
            });

            // make sure that selected items have both title and uri, otherwise selection in InvertableList won't work
            // TODO we could maybe use the InvertableList's getItemKey and just use title or uri for example
            const updatedSelectedItems = updateSelectedOptionsWithDataByMap(
                prevState.selectedFilterOptions,
                newUriToAttributeElementMap,
                isElementsByRef,
            );
            const updatedAppliedItems = updateSelectedOptionsWithDataByMap(
                prevState.appliedFilterOptions,
                newUriToAttributeElementMap,
                isElementsByRef,
            );

            const validOptions = parentFilters?.length ? elements : mergedValidElements;

            return {
                ...prevState,
                selectedFilterOptions: compact(updatedSelectedItems),
                appliedFilterOptions: compact(updatedAppliedItems),
                validOptions: validOptions,
                firstLoad: false,
                uriToAttributeElementMap: newUriToAttributeElementMap,
                needsReloadAfterSearch: false,
            };
        });
    };

    const onSearch = useCallback(
        debounce((query: string) => {
            setState((s) => ({
                ...s,
                searchString: query,
            }));
        }, 500),
        [],
    );

    const onElementSelect = (selectedFilterOptions: IAttributeElement[], isInverted: boolean) => {
        setState((s) => ({
            ...s,
            selectedFilterOptions: selectedFilterOptions,
            isInverted: isInverted,
        }));
    };

    const backupIsInverted = () => {
        setState((state) => ({
            ...state,
            appliedIsInverted: state.isInverted,
        }));
    };

    const removeFilteringStatus = () => {
        setState((prevState) => {
            return {
                ...prevState,
                isFiltering: false,
            };
        });
    };

    const onRangeChange = (_searchString: string, from: number, to: number) => {
        // only react to range changes after initial load to properly handle offset shifts on search
        if (state.validOptions) {
            setState((s) => ({
                ...s,
                offset: from,
                limit: to - from,
            }));
        }
    };

    const onDropdownClosed = () => {
        setState((s) => {
            return {
                ...s,
                selectedFilterOptions: s.appliedFilterOptions,
                isInverted: s.appliedIsInverted,
                searchString: "",
                isDropdownOpen: false,
            };
        });
    };

    const onDropdownOpen = () => {
        setState((s) => ({
            ...s,
            isDropdownOpen: true,
        }));
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
        onCurrentFilterChange,
        clearUriToElementMap,
        resetSelection,
        mapInitialSelectionElements,
        resolveAttributeElements,
        onSearch,
        onElementSelect,
        backupIsInverted,
        removeFilteringStatus,
        onRangeChange,
        onDropdownClosed,
        onDropdownOpen,
    };
};
