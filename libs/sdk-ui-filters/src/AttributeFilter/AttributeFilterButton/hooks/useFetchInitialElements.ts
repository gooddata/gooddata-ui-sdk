// (C) 2022 GoodData Corporation

import { useCancelablePromise } from "@gooddata/sdk-ui";
import isEmpty from "lodash/isEmpty";
import { IAnalyticalBackend, IAttributeElement, IElementsQueryResult } from "@gooddata/sdk-backend-spi";
import { IAttributeFilter, ObjRef } from "@gooddata/sdk-model";
import { stringify } from "../../../../../api-client-bear/src/utils/queryString";
import { prepareElementsTitleQuery } from "../AttributeFilterButtonUtils";

export const useFetchInitialElements = (
    backend: IAnalyticalBackend,
    workspace: string,
    identifier: string,
    currentFilter: IAttributeFilter,
    filterObjRef: ObjRef,
    selectedFilterOptions: IAttributeElement[],
    appliedFilterOptions: IAttributeElement[],
    mapInitialSelectionElements: (elements: IElementsQueryResult) => void,
) => {
    return useCancelablePromise(
        {
            promise: isEmpty(selectedFilterOptions)
                ? null
                : async () =>
                      prepareElementsTitleQuery(
                          appliedFilterOptions,
                          backend,
                          workspace,
                          currentFilter,
                          identifier,
                      ).query(),
            onSuccess: (initialElements) => {
                mapInitialSelectionElements(initialElements);
            },
        },
        [backend, workspace, identifier, stringify(filterObjRef), appliedFilterOptions],
    );
};
