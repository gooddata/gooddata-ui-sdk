// (C) 2022 GoodData Corporation

import { useCancelablePromise } from "@gooddata/sdk-ui";
import { getElementTotalCount, getObjRef, getValidElementsFilters } from "../../utils/AttributeFilterUtils";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { IAttributeFilter, ObjRef } from "@gooddata/sdk-model";

interface IUseAttributeFilterButtonTotalCountProps {
    backend: IAnalyticalBackend,
    workspace: string,
    currentFilter: IAttributeFilter,
    identifier: string,
    searchString: string,
    resolvedParentFilters: IAttributeFilter[],
    parentFilterOverAttribute: ObjRef | ((parentFilter: IAttributeFilter, index: number) => ObjRef)
}

export const useAttributeFilterButtonTotalCount = (
    props: IUseAttributeFilterButtonTotalCountProps,
    deps: any[]) => {
    return useCancelablePromise<number>(
        {
            promise: async () => {
                return getElementTotalCount(
                    props.workspace,
                    props.backend,
                    getObjRef(props.currentFilter, props.identifier),
                    props.searchString,
                    getValidElementsFilters(props.resolvedParentFilters, props.parentFilterOverAttribute),
                );
            },
        },
        deps,
    );
}
