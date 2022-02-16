// (C) 2022 GoodData Corporation

import { useCancelablePromise } from "@gooddata/sdk-ui";
import { getElementTotalCount, getObjRef, getValidElementsFilters } from "../../utils/AttributeFilterUtils";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { IAttributeFilter, ObjRef } from "@gooddata/sdk-model";
import stringify from "json-stable-stringify";

export const useAttributeFilterButtonTotalCount = (
    backend: IAnalyticalBackend,
    workspace: string,
    currentFilter: IAttributeFilter,
    identifier: string,
    searchString: string,
    resolvedParentFilters: IAttributeFilter[],
    parentFilterOverAttribute: ObjRef | ((parentFilter: IAttributeFilter, index: number) => ObjRef),
) => {
    return useCancelablePromise<number>(
        {
            promise: async () => {
                return getElementTotalCount(
                    workspace,
                    backend,
                    getObjRef(currentFilter, identifier),
                    searchString,
                    getValidElementsFilters(resolvedParentFilters, parentFilterOverAttribute),
                );
            },
        },
        [backend, workspace, identifier, stringify(resolvedParentFilters), searchString, currentFilter],
    );
};
