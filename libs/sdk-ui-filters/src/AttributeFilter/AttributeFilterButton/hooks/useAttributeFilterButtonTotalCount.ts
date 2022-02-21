// (C) 2022 GoodData Corporation

import { useCancelablePromise } from "@gooddata/sdk-ui";
import { getElementTotalCount, getObjRef, getValidElementsFilters } from "../../utils/AttributeFilterUtils";
import stringify from "json-stable-stringify";
import { AttributeFilterButtonContextProps, AttributeFilterButtonHookOwnProps } from "./types";
import { IAttributeFilterButtonState } from "./useAttributeFilterButtonState";

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

    return useCancelablePromise<number>(
        {
            promise: async () => {
                return getElementTotalCount(
                    context.workspace,
                    context.backend,
                    getObjRef(context.filter, context.identifier),
                    state.searchString,
                    getValidElementsFilters(ownProps.parentFilters, ownProps.parentFilterOverAttribute),
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
