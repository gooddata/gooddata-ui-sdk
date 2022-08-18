// (C) 2022 GoodData Corporation
import { useCallback, useEffect } from "react";
import isEqual from "lodash/isEqual";
import debounce from "lodash/debounce";
import { IAttributeElement, IAttributeFilter } from "@gooddata/sdk-model";
import { useBackendStrict, useWorkspaceStrict, GoodDataSdkError } from "@gooddata/sdk-ui";

import { IMultiSelectAttributeFilterHandler } from "../../AttributeFilterHandler";
import { IAttributeFilterCoreProps, OnApplyCallbackType } from "../types";
import { useResolveFilterInput } from "./useResolveFilterInput";
import { useResolveParentFiltersInput } from "./useResolveParentFiltersInput";
import { useAttributeFilterHandler } from "./useAttributeFilterHandler";
import { useAttributeFilterControllerData } from "./useAttributeFilterControllerData";
import { PARENT_FILTERS_CORRELATION, RESET_CORRELATION, SEARCH_CORRELATION } from "./constants";
import { IElementsQueryAttributeFilter } from "@gooddata/sdk-backend-spi";

/**
 * Use this hook if you want to implement your custom attribute filter.
 *
 * @alpha
 */
export const useAttributeFilterController = (props: IAttributeFilterCoreProps) => {
    const {
        backend: backendInput,
        workspace: workspaceInput,

        filter: filterInput,
        identifier,
        connectToPlaceholder,
        parentFilters,
        parentFilterOverAttribute,
        onApply,
        onError,

        hiddenElements,
        staticElements,

        fullscreenOnMobile,
    } = props;

    const backend = useBackendStrict(backendInput, "AttributeFilter");
    const workspace = useWorkspaceStrict(workspaceInput, "AttributeFilter");

    const { filter, setConnectedPlaceholderValue } = useResolveFilterInput(
        filterInput,
        connectToPlaceholder,
        identifier,
    );

    const limitingAttributeFilters = useResolveParentFiltersInput(parentFilters, parentFilterOverAttribute);

    const handler = useAttributeFilterHandler({
        backend,
        filter,
        workspace,
        hiddenElements,
        staticElements,
    });
    const attributeFilterControllerData = useAttributeFilterControllerData(handler, props);

    useOnError(handler, { onError });
    useInitOrReload(handler, { filter, limitingAttributeFilters });
    const callbacks = useCallbacks(handler, { onApply, setConnectedPlaceholderValue });

    return {
        fullscreenOnMobile,
        ...attributeFilterControllerData,
        ...callbacks,
    };
};

//

function useOnError(
    handler: IMultiSelectAttributeFilterHandler,
    props: { onError?: (error: GoodDataSdkError) => void },
) {
    const { onError } = props;

    useEffect(() => {
        function handleError(payload: { error: GoodDataSdkError }) {
            onError?.(payload.error);
        }

        const callbackUnsubscribeFunctions = [
            handler.onInitError(handleError),
            handler.onLoadAttributeError(handleError),
            handler.onLoadInitialElementsPageError(handleError),
            handler.onLoadNextElementsPageError(handleError),
            handler.onLoadCustomElementsError(handleError),
        ];

        return () => {
            callbackUnsubscribeFunctions.forEach((unsubscribe) => {
                unsubscribe();
            });
        };
    }, [handler, onError]);
}

//

function useInitOrReload(
    handler: IMultiSelectAttributeFilterHandler,
    props: {
        filter: IAttributeFilter;
        limitingAttributeFilters?: IElementsQueryAttributeFilter[];
    },
) {
    const { filter, limitingAttributeFilters } = props;
    useEffect(() => {
        if (limitingAttributeFilters.length > 0) {
            handler.setLimitingAttributeFilters(limitingAttributeFilters);
        }
        handler.init();

        // Change of the parent filters is resolved in the useEffect bellow,
        // it does not need full reinit.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [handler]);

    useEffect(() => {
        if (!isEqual(filter, handler.getFilter())) {
            handler.init();
        } else if (!isEqual(limitingAttributeFilters, handler.getLimitingAttributeFilters())) {
            handler.changeSelection({ keys: [], isInverted: true });
            handler.setLimitingAttributeFilters(limitingAttributeFilters);
            handler.loadInitialElementsPage(PARENT_FILTERS_CORRELATION);
        }
    }, [filter, limitingAttributeFilters, handler]);
}

//

function useCallbacks(
    handler: IMultiSelectAttributeFilterHandler,
    props: {
        setConnectedPlaceholderValue: (filter: IAttributeFilter) => void;
        onApply: OnApplyCallbackType;
    },
) {
    const { onApply: onApplyInput, setConnectedPlaceholderValue } = props;
    const onSelect = useCallback(
        (selectedItems: IAttributeElement[], isInverted: boolean) => {
            const keys = selectedItems.map((item) => item.uri);
            handler.changeSelection({ keys, isInverted });
        },
        [handler],
    );

    // Rule is not working with debounce
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const onSearch = useCallback(
        debounce((search: string) => {
            if (handler.getSearch() !== search) {
                handler.setSearch(search);
            }

            handler.loadInitialElementsPage(SEARCH_CORRELATION);
        }, 200),
        [handler],
    );

    const onLoadNextElementsPage = useCallback(() => {
        handler.loadNextElementsPage();
    }, [handler]);

    const onReset = useCallback(() => {
        handler.revertSelection();

        if (handler.getSearch().length > 0) {
            handler.setSearch("");
            handler.loadInitialElementsPage(RESET_CORRELATION);
        }
    }, [handler]);

    const onApply = useCallback(() => {
        handler.commitSelection();
        const nextFilter = handler.getFilter();
        const isInverted = handler.getCommittedSelection()?.isInverted;

        setConnectedPlaceholderValue(nextFilter);
        onApplyInput?.(nextFilter, isInverted);
    }, [onApplyInput, setConnectedPlaceholderValue, handler]);

    return {
        onApply,
        onLoadNextElementsPage,
        onSearch,
        onSelect,
        onReset,
    };
}
