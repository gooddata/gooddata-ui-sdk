// (C) 2022 GoodData Corporation

import { useCancelablePromise } from "@gooddata/sdk-ui";
import { getElementTotalCount, getObjRef, getValidElementsFilters } from "../../utils/AttributeFilterUtils";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { IAttributeFilter, ObjRef } from "@gooddata/sdk-model";
import stringify from "json-stable-stringify";

export const useOriginalTotalElementsCount = (
    backend: IAnalyticalBackend,
    workspace: string,
    identifier: string,
    currentFilter: IAttributeFilter,
    parentFilters: IAttributeFilter[],
    parentFilterOverAttribute: ObjRef | ((parentFilter: IAttributeFilter, index: number) => ObjRef),
) => {
    return useCancelablePromise<number>(
        {
            promise: async () => {
                return getElementTotalCount(
                    workspace,
                    backend,
                    getObjRef(currentFilter, identifier),
                    "", // we need to get all available elements count in every case possible
                    getValidElementsFilters(parentFilters, parentFilterOverAttribute),
                );
            },
        },
        [backend, workspace, identifier, stringify(parentFilters), currentFilter],
    );
};
