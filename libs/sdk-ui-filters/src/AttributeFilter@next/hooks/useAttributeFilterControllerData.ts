// (C) 2022 GoodData Corporation
import { useState, useEffect } from "react";
import { IMultiSelectAttributeFilterHandler } from "../../AttributeFilterHandler";
import { isLimitingAttributeFiltersEmpty } from "../utils";
import { IAttributeFilterCoreProps } from "../types";
import { useAttributeFilterHandlerState } from "./useAttributeFilterHandlerState";
import { useResolveAttributeFilterSubtitle } from "./useResolveAttributeFilterSubtitle";
import { PARENT_FILTERS_CORRELATION } from "./constants";

/**
 * @internal
 */
export function useAttributeFilterControllerData(
    handler: IMultiSelectAttributeFilterHandler,
    ownProps: IAttributeFilterCoreProps,
) {
    const { title: titleInput } = ownProps;

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
        !isWorkingSelectionChanged || (!isWorkingSelectionInverted && isWorkingSelectionEmpty);

    const isParentFiltersEmpty = isLimitingAttributeFiltersEmpty(limitingAttributeFilters);

    const title = titleInput ?? attribute?.title ?? "";
    const subtitle = useResolveAttributeFilterSubtitle(
        isCommittedSelectionInverted,
        committedSelectionElements,
    );

    const isFilteredByParentFilters = initialElementsPageStatus === "success" && !isParentFiltersEmpty;

    const isFiltering = useIsFiltering(handler);

    const parentFilterAttributes = handler.getLimitingAttributeFiltersAttributes();

    return {
        title,
        subtitle,

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
