// (C) 2022 GoodData Corporation

import { useCancelablePromise } from "@gooddata/sdk-ui";
import { needsLoading } from "../../utils/AttributeFilterUtils";
import { prepareElementsQuery } from "../AttributeFilterButtonUtils";
import { IElementsQueryResult } from "@gooddata/sdk-backend-spi";
import { IAttributeFilter } from "@gooddata/sdk-model";
import { AttributeFilterButtonContextProps, AttributeFilterButtonHookOwnProps } from "./types";
import { IAttributeFilterButtonState } from "./useAttributeFilterButtonState";

interface IUseLoadMissingDataProps {
    context: Pick<AttributeFilterButtonContextProps, "backend" | "workspace" | "filterObjRef">;
    state: Pick<
        IAttributeFilterButtonState,
        | "validOptions"
        | "needsReloadAfterSearch"
        | "searchString"
        | "selectedFilterOptions"
        | "appliedFilterOptions"
        | "offset"
        | "limit"
    >;
    callback: (
        elements: IElementsQueryResult,
        parentFilters: IAttributeFilter[],
        isElementsByRef: boolean,
    ) => void;
    ownProps: AttributeFilterButtonHookOwnProps;
}

export const useLoadMissingData = (props: IUseLoadMissingDataProps) => {
    const { context, state, ownProps, callback } = props;

    const promise =
        needsLoading(state.validOptions, state.offset, state.limit) || state.needsReloadAfterSearch
            ? async () => {
                  const preparedElementQuery = prepareElementsQuery(
                      context.backend,
                      context.workspace,
                      context.filterObjRef,
                      ownProps.parentFilters,
                      ownProps.parentFilterOverAttribute,
                      state.offset,
                      state.limit,
                      state.searchString,
                  );
                  return preparedElementQuery.query();
              }
            : null;

    return useCancelablePromise(
        {
            promise,
            onSuccess: (newElements) => {
                callback(newElements, ownProps.parentFilters, ownProps.isElementsByRef);
            },
        },
        [
            state.selectedFilterOptions,
            state.appliedFilterOptions,
            state.validOptions,
            state.offset,
            state.limit,
            state.searchString,
            state.needsReloadAfterSearch,
            ownProps.parentFilters,
        ],
    );
};
