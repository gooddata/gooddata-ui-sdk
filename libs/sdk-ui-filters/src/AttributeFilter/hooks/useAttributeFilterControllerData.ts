// (C) 2022 GoodData Corporation
import { useState, useEffect } from "react";
import { IMultiSelectAttributeFilterHandler } from "../../AttributeFilterHandler/index.js";
import { isLimitingAttributeFiltersEmpty } from "../utils.js";
import { useAttributeFilterHandlerState } from "./useAttributeFilterHandlerState.js";
import { MAX_SELECTION_SIZE, PARENT_FILTERS_CORRELATION } from "./constants.js";
import { filterObjRef } from "@gooddata/sdk-model";
import { AttributeFilterControllerData } from "./types.js";

/**
 * @internal
 */
export function useAttributeFilterControllerData(
    handler: IMultiSelectAttributeFilterHandler,
): AttributeFilterControllerData {
    const handlerState = useAttributeFilterHandlerState(handler);

    const initStatus = handlerState.initialization.status;
    const initError = handlerState.initialization.error;
    const isInitializing = initStatus === "loading";

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

    const searchString = handlerState.elements.options.search;
    const limit = handlerState.elements.options.limit;
    const limitingAttributeFilters = handlerState.elements.options.limitingAttributeFilters;

    const hasNextElementsPage = elements.length < totalElementsCountWithCurrentSettings;
    const nextElementsPageSize = hasNextElementsPage
        ? Math.min(limit, totalElementsCountWithCurrentSettings - elements.length)
        : 0;

    const isApplyDisabled =
        workingSelectionElements.length > MAX_SELECTION_SIZE ||
        !isWorkingSelectionChanged ||
        (!isWorkingSelectionInverted && isWorkingSelectionEmpty);

    const isParentFiltersEmpty = isLimitingAttributeFiltersEmpty(limitingAttributeFilters);

    const isFilteredByParentFilters = initialElementsPageStatus === "success" && !isParentFiltersEmpty;

    const isFiltering = useIsFiltering(handler);

    const parentFilterAttributes = handler.getLimitingAttributeFiltersAttributes();
    const displayForms = attribute?.displayForms ?? [];
    const currentDisplayFormRef = filterObjRef(handlerState.attributeFilter);

    const offset = handlerState.elements.options.offset;

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

        elements,
        totalElementsCount,
        totalElementsCountWithCurrentSettings,

        isApplyDisabled,

        isWorkingSelectionInverted,
        workingSelectionElements,

        isCommittedSelectionInverted,
        committedSelectionElements,

        searchString,

        isFilteredByParentFilters,

        parentFilterAttributes,

        displayForms,
        currentDisplayFormRef,
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
