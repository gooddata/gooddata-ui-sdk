// (C) 2022-2025 GoodData Corporation

import { useEffect, useState } from "react";

import { isEmpty } from "lodash-es";

import { filterObjRef } from "@gooddata/sdk-model";

import { MAX_SELECTION_SIZE, PARENT_FILTERS_CORRELATION } from "./constants.js";
import { AttributeFilterControllerData } from "./types.js";
import { useAttributeFilterHandlerState } from "./useAttributeFilterHandlerState.js";
import {
    IMultiSelectAttributeFilterHandler,
    isLimitingAttributeFiltersEmpty,
} from "../../AttributeFilterHandler/index.js";

/**
 * @internal
 */
export function useAttributeFilterControllerData(
    handler: IMultiSelectAttributeFilterHandler,
    supportsShowingFilteredElements: boolean,
    shouldIncludeLimitingFilters: boolean,
): AttributeFilterControllerData {
    const handlerState = useAttributeFilterHandlerState(handler);

    const initStatus = handlerState.initialization.status;
    const initError = handlerState.initialization.error;
    const isInitializing = initStatus === "loading" || initStatus === "pending";

    const attribute = handlerState.attribute.data;

    const initialElementsPageStatus = handlerState.elements.initialPageLoad.status;
    const initialElementsPageError = handlerState.elements.initialPageLoad.error;
    const isLoadingInitialElementsPage = initialElementsPageStatus === "loading";

    const nextElementsPageStatus = handlerState.elements.nextPageLoad.status;
    const nextElementsPageError = handlerState.elements.nextPageLoad.error;

    const isLoadingNextElementsPage = nextElementsPageStatus === "loading";

    const elements = handlerState.elements.data;
    const totalElementsCount = handlerState.elements.totalCount;
    const totalElementsCountWithCurrentSettings = handlerState.elements.totalCountWithCurrentSettings;

    const isWorkingSelectionChanged = handlerState.selection.working.isChanged;
    const isWorkingSelectionEmpty = handlerState.selection.working.isEmpty;
    const isWorkingSelectionInverted = handlerState.selection.working.isInverted;
    const workingSelectionElements = handlerState.selection.working.elements;

    const isCommittedSelectionInverted = handlerState.selection.committed.isInverted;
    const committedSelectionElements = handlerState.selection.committed.elements;

    const searchString = handlerState.elements.options?.search ?? "";
    const limit = handlerState.elements.options?.limit ?? 0;
    const limitingAttributeFilters = handlerState.elements.options?.limitingAttributeFilters ?? [];
    const limitingDateFilters = handlerState.elements.options?.limitingDateFilters ?? [];
    const limitingValidationItems = handlerState.elements.options?.limitingValidationItems ?? [];

    const hasNextElementsPage = (elements?.length ?? 0) < (totalElementsCountWithCurrentSettings ?? 0);
    const nextElementsPageSize = hasNextElementsPage
        ? Math.min(limit, (totalElementsCountWithCurrentSettings ?? 0) - (elements?.length ?? 0))
        : 0;

    const isSelectionInvalid =
        (workingSelectionElements?.length ?? 0) > MAX_SELECTION_SIZE ||
        (!isWorkingSelectionInverted && isWorkingSelectionEmpty);

    const isApplyDisabled = isSelectionInvalid || !isWorkingSelectionChanged;

    const isParentFiltersEmpty = isLimitingAttributeFiltersEmpty(limitingAttributeFilters);

    const isFilteredByParentFilters =
        shouldIncludeLimitingFilters && initialElementsPageStatus === "success" && !isParentFiltersEmpty;

    const isFilteredByDependentDateFilters =
        shouldIncludeLimitingFilters &&
        initialElementsPageStatus === "success" &&
        !isEmpty(limitingDateFilters);

    const isFilteredByLimitingValidationItems =
        shouldIncludeLimitingFilters &&
        initialElementsPageStatus === "success" &&
        !isEmpty(limitingValidationItems);

    const isFiltering = useIsFiltering(handler);

    const parentFilterAttributes = handler.getLimitingAttributeFiltersAttributes();
    const displayForms = attribute?.displayForms ?? [];
    const currentDisplayFormRef = filterObjRef(handlerState.attributeFilter);
    const currentDisplayAsDisplayFormRef = handlerState.attributeFilterToDisplay
        ? filterObjRef(handlerState.attributeFilterToDisplay)
        : undefined;

    const offset = handlerState.elements.options?.offset ?? 0;

    const irrelevantSelection = supportsShowingFilteredElements
        ? handlerState.selection.working.irrelevantElements
        : [];

    return {
        attribute,

        offset,
        limit,

        isFiltering,

        isInitializing,
        initError,

        isLoadingInitialElementsPage,
        initialElementsPageError,

        isLoadingNextElementsPage,
        nextElementsPageError,
        nextElementsPageSize,

        elements: elements ?? [],
        totalElementsCount: totalElementsCount,
        totalElementsCountWithCurrentSettings: totalElementsCountWithCurrentSettings,

        isSelectionInvalid: isSelectionInvalid ?? false,
        isApplyDisabled,
        isWorkingSelectionChanged,

        isWorkingSelectionInverted: isWorkingSelectionInverted ?? false,
        workingSelectionElements: workingSelectionElements ?? [],

        isCommittedSelectionInverted: isCommittedSelectionInverted ?? false,
        committedSelectionElements: committedSelectionElements ?? [],

        searchString,

        isFilteredByParentFilters,
        parentFilterAttributes,

        isFilteredByDependentDateFilters,

        displayForms,
        currentDisplayFormRef,
        currentDisplayAsDisplayFormRef,

        enableShowingFilteredElements: supportsShowingFilteredElements,

        irrelevantSelection,

        limitingValidationItems,
        isFilteredByLimitingValidationItems,
    };
}

function useIsFiltering(handler: IMultiSelectAttributeFilterHandler) {
    const [isFiltering, setIsFiltering] = useState(false);

    useEffect(() => {
        const callbackUnsubscribeFunctions = [
            handler.onLoadInitialElementsPageStart(handleFilteringStart),
            handler.onLoadInitialElementsPageSuccess(handleFilteringEnd),
            handler.onLoadInitialElementsPageError(handleFilteringEnd),
            handler.onLoadInitialElementsPageCancel(handleFilteringEnd),
            handler.onInitStart(handleFilteringStart),
            handler.onInitSuccess(handleFilteringEnd),
            handler.onInitError(handleFilteringEnd),
            handler.onInitCancel(handleFilteringEnd),
        ];

        function handleFilteringStart(payload: { correlation: string }) {
            if (payload.correlation === PARENT_FILTERS_CORRELATION) {
                setIsFiltering(true);
            }
        }

        function handleFilteringEnd(payload: { correlation: string }) {
            if (payload.correlation === PARENT_FILTERS_CORRELATION) {
                setIsFiltering(false);
            }
        }

        return () => {
            callbackUnsubscribeFunctions.forEach((unsubscribe) => {
                unsubscribe();
            });
        };
    }, [handler]);

    return isFiltering;
}
