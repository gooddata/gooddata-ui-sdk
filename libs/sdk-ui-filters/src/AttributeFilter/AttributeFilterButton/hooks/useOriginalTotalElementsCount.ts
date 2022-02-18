// (C) 2022 GoodData Corporation

import { useCancelablePromise } from "@gooddata/sdk-ui";
import { getElementTotalCount, getObjRef, getValidElementsFilters } from "../../utils/AttributeFilterUtils";
import stringify from "json-stable-stringify";
import { AttributeFilterButtonContextProps, AttributeFilterButtonHookOwnProps } from "./types";

interface IUseOriginalTotalElementCountProps {
    context: Omit<AttributeFilterButtonContextProps, "filterObjRef">;
    ownProps: Omit<AttributeFilterButtonHookOwnProps, "isElementsByRef">;
}

/**
 * Gets the number of all elements available for the attribute.
 */
export const useOriginalTotalElementsCount = (props: IUseOriginalTotalElementCountProps) => {
    const { context, ownProps } = props;
    return useCancelablePromise<number>(
        {
            promise: async () => {
                return getElementTotalCount(
                    context.workspace,
                    context.backend,
                    getObjRef(context.filter, context.identifier),
                    "", // we need to get all available elements count in every case possible
                    getValidElementsFilters(ownProps.parentFilters, ownProps.parentFilterOverAttribute),
                );
            },
        },
        [
            context.backend,
            context.workspace,
            context.identifier,
            stringify(ownProps.parentFilters),
            context.filter,
        ],
    );
};
