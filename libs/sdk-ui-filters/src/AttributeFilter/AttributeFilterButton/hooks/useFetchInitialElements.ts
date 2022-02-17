// (C) 2022 GoodData Corporation

import { useCancelablePromise } from "@gooddata/sdk-ui";
import isEmpty from "lodash/isEmpty";
import { IElementsQueryResult } from "@gooddata/sdk-backend-spi";
import stringify from "json-stable-stringify";
import { prepareElementsTitleQuery } from "../AttributeFilterButtonUtils";
import { getObjRef } from "../../utils/AttributeFilterUtils";
import { AttributeFilterButtonContextProps } from "./types";
import { IAttributeFilterButtonState } from "./useAttributeFilterButtonState";

interface IUseFetchInitialElementsProps {
    context: Omit<AttributeFilterButtonContextProps, "filterObjRef">;
    state: Pick<IAttributeFilterButtonState, "selectedFilterOptions" | "appliedFilterOptions">;
    callback: (elements: IElementsQueryResult) => void;
}

export const useFetchInitialElements = (props: IUseFetchInitialElementsProps) => {
    const { context, state, callback } = props;

    const filterObjRef = getObjRef(context.filter, context.identifier);

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
                callback(initialElements);
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
