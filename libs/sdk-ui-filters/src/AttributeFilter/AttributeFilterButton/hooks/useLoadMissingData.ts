// (C) 2022 GoodData Corporation

import { useCancelablePromise } from "@gooddata/sdk-ui";
import {
    getValidElementsFilters,
    isParentFilteringEnabled,
    isParentFiltersElementsByRef,
    needsLoading,
} from "../../utils/AttributeFilterUtils";
import { IAnalyticalBackend, IElementsQueryResult } from "@gooddata/sdk-backend-spi";
import { IAttributeFilter, ObjRef } from "@gooddata/sdk-model";
import { AttributeFilterButtonContextProps, AttributeFilterButtonHookOwnProps } from "./types";
import { IAttributeFilterButtonState } from "./useAttributeFilterButtonState";
import isEmpty from "lodash/isEmpty";

interface IUseLoadMissingDataProps {
    context: Pick<AttributeFilterButtonContextProps, "backend" | "workspace" | "filterObjRef">;
    state: Pick<
        IAttributeFilterButtonState,
        | "validOptions"
        | "needsReloadAfterSearch"
        | "searchString"
        | "selectedFilterOptions"
        | "appliedFilterOptions"
        | "offset"
        | "limit"
    >;
    onLoadMissingDataSuccess: (
        elements: IElementsQueryResult,
        parentFilters: IAttributeFilter[],
        isElementsByRef: boolean,
    ) => void;
    ownProps: AttributeFilterButtonHookOwnProps;
}

const prepareElementsQuery = (
    backend: IAnalyticalBackend,
    workspace: string,
    filterObjRef: ObjRef,
    parentFilters: IAttributeFilter[],
    parentFilterOverAttribute: ObjRef | ((parentFilter: IAttributeFilter, index: number) => ObjRef),
    offset: number,
    limit: number,
    searchQuery: string,
) => {
    const preparedElementQuery = backend
        .workspace(workspace)
        .attributes()
        .elements()
        .forDisplayForm(filterObjRef)
        .withOptions({
            ...(!isEmpty(searchQuery) ? { filter: searchQuery } : {}),
        })
        .withOffset(offset)
        .withLimit(limit);

    if (isParentFilteringEnabled(backend)) {
        if (parentFilters && !isParentFiltersElementsByRef(parentFilters)) {
            // eslint-disable-next-line no-console
            console.error("Parent filters must be defined by uris to enable parent-child filtering feature");
        } else {
            preparedElementQuery.withAttributeFilters(
                getValidElementsFilters(parentFilters, parentFilterOverAttribute),
            );
        }
    }

    return preparedElementQuery;
};

/**
 * Fetches missing attribute elements on scrolling.
 */
export const useLoadMissingData = (props: IUseLoadMissingDataProps) => {
    const { context, state, ownProps, onLoadMissingDataSuccess } = props;

    const promise =
        needsLoading(state.validOptions, state.offset, state.limit) || state.needsReloadAfterSearch
            ? async () => {
                  const preparedElementQuery = prepareElementsQuery(
                      context.backend,
                      context.workspace,
                      context.filterObjRef,
                      ownProps.parentFilters,
                      ownProps.parentFilterOverAttribute,
                      state.offset,
                      state.limit,
                      state.searchString,
                  );
                  return preparedElementQuery.query();
              }
            : null;

    return useCancelablePromise(
        {
            promise,
            onSuccess: (newElements) => {
                onLoadMissingDataSuccess(newElements, ownProps.parentFilters, ownProps.isElementsByRef);
            },
        },
        [
            state.selectedFilterOptions,
            state.appliedFilterOptions,
            state.validOptions,
            state.offset,
            state.limit,
            state.searchString,
            state.needsReloadAfterSearch,
            ownProps.parentFilters,
        ],
    );
};
