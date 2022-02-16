// (C) 2022 GoodData Corporation

import { useCancelablePromise } from "@gooddata/sdk-ui";
import { needsLoading } from "../../utils/AttributeFilterUtils";
import { IElementQueryResultWithEmptyItems } from "../../AttributeDropdown/types";
import { prepareElementsQuery } from "../AttributeFilterButtonUtils";
import { IAnalyticalBackend, IAttributeElement, IElementsQueryResult } from "@gooddata/sdk-backend-spi";
import { IAttributeFilter, ObjRef } from "@gooddata/sdk-model";

export const useLoadMissingData = (
    validOptions: IElementQueryResultWithEmptyItems,
    offset: number,
    limit: number,
    needsReloadAfterSearch: boolean,
    searchString: string,
    backend: IAnalyticalBackend,
    workspace: string,
    filterObjRef: ObjRef,
    parentFilters: IAttributeFilter[],
    parentFilterOverAttribute: ObjRef | ((parentFilter: IAttributeFilter, index: number) => ObjRef),
    isElementsByRef: boolean,
    selectedFilterOptions: IAttributeElement[],
    appliedFilterOptions: IAttributeElement[],
    resolveAttributeElements: (
        elements: IElementsQueryResult,
        parentFilters: IAttributeFilter[],
        isElementsByRef: boolean,
    ) => void,
) => {
    const promise =
        needsLoading(validOptions, offset, limit) || needsReloadAfterSearch
            ? async () => {
                  const preparedElementQuery = prepareElementsQuery(
                      backend,
                      workspace,
                      filterObjRef,
                      parentFilters,
                      parentFilterOverAttribute,
                      offset,
                      limit,
                      searchString,
                  );
                  return preparedElementQuery.query();
              }
            : null;

    return useCancelablePromise(
        {
            promise,
            onSuccess: (newElements) => {
                resolveAttributeElements(newElements, parentFilters, isElementsByRef);
            },
        },
        [
            selectedFilterOptions,
            appliedFilterOptions,
            validOptions,
            offset,
            limit,
            searchString,
            needsReloadAfterSearch,
            parentFilters,
        ],
    );
};
