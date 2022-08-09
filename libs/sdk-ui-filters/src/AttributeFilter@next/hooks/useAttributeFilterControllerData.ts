// (C) 2022 GoodData Corporation
import { IMultiSelectAttributeFilterHandler } from "../../AttributeFilterHandler";
import { IUseAttributeFilterControllerProps } from "./types";
import { useAttributeFilterHandlerState } from "./useAttributeFilterHandlerState";
import { useResolveAttributeFilterSubtitle } from "./useResolveAttributeFilterSubtitle";
import { isLimitingAttributeFiltersEmpty, isLoadingOrPending } from "../utils";

/**
 * @internal
 */
export function useAttributeFilterControllerData(
    attributeFilterHandler: IMultiSelectAttributeFilterHandler,
    ownProps: IUseAttributeFilterControllerProps,
) {
    const { title: titleInput } = ownProps;

    const handlerState = useAttributeFilterHandlerState(attributeFilterHandler);

    const initStatus = handlerState.initialization.status;
    const initError = handlerState.initialization.error;
    const isInitializing = isLoadingOrPending(initStatus);

    const attribute = handlerState.attribute.data;

    const initialElementsPageStatus = handlerState.elements.initialPageLoad.status;
    const initialElementsPageError = handlerState.elements.initialPageLoad.error;
    const isLoadingInitialElementsPage = isLoadingOrPending(initialElementsPageStatus);

    const nextElementsPageStatus = handlerState.elements.nextPageLoad.status;
    const nextElementsPageError = handlerState.elements.nextPageLoad.error;

    const isLoadingNextElementsPage = isLoadingOrPending(nextElementsPageStatus);

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

    // TODO: isApplyDisabled coming from props
    const isApplyDisabled =
        !isWorkingSelectionChanged || (!isWorkingSelectionInverted && isWorkingSelectionEmpty);

    const isParentFiltersEmpty = isLimitingAttributeFiltersEmpty(limitingAttributeFilters);
    const isFiltering = !isInitializing && !isParentFiltersEmpty && isLoadingInitialElementsPage;

    const title = titleInput ?? attribute?.title ?? "";
    const subtitle = useResolveAttributeFilterSubtitle(
        isCommittedSelectionInverted,
        committedSelectionElements,
    );

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

        // TODO:
        hasNoMatchingData: false,
        hasNoData: false,
        parentFilterTitles: [] as string[],
        showItemsFilteredMessage: false,
    };
}
