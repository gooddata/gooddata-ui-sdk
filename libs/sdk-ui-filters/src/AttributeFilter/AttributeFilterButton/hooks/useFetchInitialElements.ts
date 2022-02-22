// (C) 2022 GoodData Corporation
import { useMemo } from "react";
import { useCancelablePromise } from "@gooddata/sdk-ui";
import isEmpty from "lodash/isEmpty";
import { IAnalyticalBackend, IAttributeElement, IElementsQueryResult } from "@gooddata/sdk-backend-spi";
import stringify from "json-stable-stringify";
import { getObjRef } from "../../utils/AttributeFilterUtils";
import { AttributeFilterButtonContextProps } from "./types";
import { IAttributeFilterButtonState } from "./useAttributeFilterButtonState";
import { filterAttributeElements, IAttributeFilter, isAttributeElementsByRef } from "@gooddata/sdk-model";

interface IUseFetchInitialElementsProps {
    context: Omit<AttributeFilterButtonContextProps, "filterObjRef">;
    state: Pick<IAttributeFilterButtonState, "selectedFilterOptions" | "appliedFilterOptions">;
    isElementsByRef: boolean;
    callback: (elements: IElementsQueryResult, isElementsByRef: boolean) => void;
}

const prepareElementsTitleQuery = (
    appliedElements: IAttributeElement[],
    backend: IAnalyticalBackend,
    workspace: string,
    currentFilter: IAttributeFilter,
    identifier: string,
) => {
    const supportsElementUris = backend.capabilities.supportsElementUris;
    const isElementsByRef = isAttributeElementsByRef(filterAttributeElements(currentFilter));

    const options = {
        uris: appliedElements
            .map((element) => {
                return supportsElementUris && isElementsByRef ? element.uri : element.title;
            })
            .filter(Boolean),
    };

    return backend
        .workspace(workspace)
        .attributes()
        .elements()
        .forDisplayForm(getObjRef(currentFilter, identifier))
        .withOptions(options);
};

/**
 * Fetches data for the initial selection.
 */
export const useFetchInitialElements = (props: IUseFetchInitialElementsProps) => {
    const { context, state, callback, isElementsByRef } = props;

    const filterObjRef = useMemo(
        () => getObjRef(context.filter, context.identifier),
        [context.filter, context.identifier],
    );

    return useCancelablePromise(
        {
            promise: isEmpty(state.selectedFilterOptions)
                ? null
                : async () =>
                      prepareElementsTitleQuery(
                          state.appliedFilterOptions,
                          context.backend,
                          context.workspace,
                          context.filter,
                          context.identifier,
                      ).query(),
            onSuccess: (initialElements) => {
                callback(initialElements, isElementsByRef);
            },
        },
        [
            context.backend,
            context.workspace,
            context.identifier,
            stringify(filterObjRef),
            state.appliedFilterOptions,
        ],
    );
};
