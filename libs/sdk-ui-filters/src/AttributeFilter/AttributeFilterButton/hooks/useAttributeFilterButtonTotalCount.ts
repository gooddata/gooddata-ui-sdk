// (C) 2022 GoodData Corporation
import { useCancelablePromise } from "@gooddata/sdk-ui";
import {
    getElementTotalCount,
    getObjRef,
    getValidElementsFilters,
    isParentFilteringEnabled,
    isParentFiltersElementsByRef,
} from "../../utils/AttributeFilterUtils";
import stringify from "json-stable-stringify";
import { AttributeFilterButtonContextProps, AttributeFilterButtonHookOwnProps } from "./types";
import { IAttributeFilterButtonState } from "./useAttributeFilterButtonState";
import { IElementsQueryAttributeFilter } from "@gooddata/sdk-backend-spi";

interface IUseAttributeFilterButtonTotalCountProps {
    context: Omit<AttributeFilterButtonContextProps, "filterObjRef">;
    state: Pick<IAttributeFilterButtonState, "searchString">;
    ownProps: Omit<AttributeFilterButtonHookOwnProps, "isElementsByRef">;
}

/**
 * Gets the number of the elements available for the attribute, depending on the inserted search
 * query.
 */
export const useAttributeFilterButtonTotalCount = (props: IUseAttributeFilterButtonTotalCountProps) => {
    const { context, state, ownProps } = props;

    const validParentFilters: IElementsQueryAttributeFilter[] = [];
    if (isParentFilteringEnabled(context.backend)) {
        if (ownProps.parentFilters && !isParentFiltersElementsByRef(ownProps.parentFilters)) {
            // eslint-disable-next-line no-console
            console.error("Parent filters must be defined by uris to enable parent-child filtering feature");
        } else {
            validParentFilters.push(
                ...getValidElementsFilters(ownProps.parentFilters, ownProps.parentFilterOverAttribute),
            );
        }
    }

    return useCancelablePromise<number>(
        {
            promise: async () => {
                return getElementTotalCount(
                    context.workspace,
                    context.backend,
                    getObjRef(context.filter, context.identifier),
                    state.searchString,
                    validParentFilters,
                );
            },
        },
        [
            context.backend,
            context.workspace,
            context.identifier,
            stringify(ownProps.parentFilters),
            state.searchString,
            context.filter,
        ],
    );
};
