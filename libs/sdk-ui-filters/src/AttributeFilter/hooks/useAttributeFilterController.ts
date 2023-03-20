// (C) 2022-2023 GoodData Corporation
import { useCallback, useEffect } from "react";
import isEqual from "lodash/isEqual";
import debounce from "lodash/debounce";
import {
    DashboardAttributeFilterSelectionMode,
    filterAttributeElements,
    IAttributeElement,
    IAttributeFilter,
    isAttributeElementsByRef,
    isAttributeElementsByValue,
    isNegativeAttributeFilter,
} from "@gooddata/sdk-model";
import { useBackendStrict, useWorkspaceStrict, GoodDataSdkError } from "@gooddata/sdk-ui";

import { IMultiSelectAttributeFilterHandler } from "../../AttributeFilterHandler";
import { IAttributeFilterCoreProps, OnApplyCallbackType } from "../types";
import { useResolveFilterInput } from "./useResolveFilterInput";
import { useResolveParentFiltersInput } from "./useResolveParentFiltersInput";
import { useAttributeFilterHandler } from "./useAttributeFilterHandler";
import { useAttributeFilterControllerData } from "./useAttributeFilterControllerData";
import { PARENT_FILTERS_CORRELATION, RESET_CORRELATION, SEARCH_CORRELATION } from "./constants";
import { IElementsQueryAttributeFilter } from "@gooddata/sdk-backend-spi";
import { AttributeFilterController } from "./types";

/**
 * Properties of {@link useAttributeFilterController}
 * @public
 */
export type IUseAttributeFilterControllerProps = Omit<
    IAttributeFilterCoreProps,
    "fullscreenOnMobile" | "locale" | "title"
> & {
    elementsOptions?: { limit: number };
    resetOnParentFilterChange?: boolean;
};

/**
 * UseAttributeFilterController hook is responsible for initialization of AttributeFilterHandler {@link IMultiSelectAttributeFilterHandler} Core API for Attribute Filter components
 *
 * @remarks
 * You can access AttributeFilter state and callbacks ({@link AttributeFilterController})
 *
 * This is the best option if you need to implement fully custom UI for the attribute filter. This option requires a bit more coding, but you have a full control over the UI.
 * It has identical convenient API as AttributeFilter component - same input props and same output props that are available in the internal context of the AttributeFilter component.
 * It works out of the box with other UI.SDK things - {@link @gooddata/sdk-ui#BackendProvider}, {@link @gooddata/sdk-ui#WorkspaceProvider} and visualization definition placeholders.
 *
 * @public
 */
export const useAttributeFilterController = (
    props: IUseAttributeFilterControllerProps,
): AttributeFilterController => {
    const {
        backend: backendInput,
        workspace: workspaceInput,

        filter: filterInput,
        identifier,
        connectToPlaceholder,
        parentFilters,
        parentFilterOverAttribute,
        resetOnParentFilterChange = true,
        onApply,
        onError,

        hiddenElements,
        staticElements,

        elementsOptions,

        selectionMode = "multi",
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
    const attributeFilterControllerData = useAttributeFilterControllerData(handler);

    useOnError(handler, { onError });
    useInitOrReload(handler, {
        filter,
        limitingAttributeFilters,
        limit: elementsOptions?.limit,
        onApply,
        setConnectedPlaceholderValue,
        resetOnParentFilterChange,
        selectionMode,
    });
    const callbacks = useCallbacks(handler, { onApply, setConnectedPlaceholderValue, selectionMode });

    return {
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
        limit?: number;
        setConnectedPlaceholderValue: (filter: IAttributeFilter) => void;
        onApply: OnApplyCallbackType;
        resetOnParentFilterChange: boolean;
        selectionMode: DashboardAttributeFilterSelectionMode;
    },
) {
    const {
        filter,
        limitingAttributeFilters,
        limit,
        resetOnParentFilterChange,
        setConnectedPlaceholderValue,
        onApply,
        selectionMode,
    } = props;
    useEffect(() => {
        if (limitingAttributeFilters.length > 0) {
            handler.setLimitingAttributeFilters(limitingAttributeFilters);
        }
        if (limit) {
            handler.setLimit(limit);
        }

        handler.init();

        // Change of the parent filters is resolved in the useEffect bellow,
        // it does not need full reinit.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [handler]);

    useEffect(() => {
        const limitingAttributesChanged = !isEqual(
            limitingAttributeFilters,
            handler.getLimitingAttributeFilters(),
        );
        const filtersChanged = !isEqual(filter, handler.getFilter());

        const props: UpdateFilterProps = {
            filter,
            limitingAttributeFilters,
            limitingAttributesChanged,
            filtersChanged,
            setConnectedPlaceholderValue,
            onApply,
            selectionMode,
        };

        const change = resetOnParentFilterChange
            ? updateAutomaticResettingFilter(handler, props)
            : updateNonResettingFilter(handler, props);
        refreshByType(handler, change);
    }, [
        filter,
        limitingAttributeFilters,
        resetOnParentFilterChange,
        handler,
        onApply,
        setConnectedPlaceholderValue,
        selectionMode,
    ]);
}

type UpdateFilterProps = {
    filter: IAttributeFilter;
    limitingAttributeFilters?: IElementsQueryAttributeFilter[];
    limitingAttributesChanged: boolean;
    filtersChanged: boolean;
    setConnectedPlaceholderValue: (filter: IAttributeFilter) => void;
    onApply: OnApplyCallbackType;
    selectionMode: DashboardAttributeFilterSelectionMode;
};

type UpdateFilterType = "init-parent" | "init-self" | undefined;

function updateNonResettingFilter(
    handler: IMultiSelectAttributeFilterHandler,
    {
        filter,
        limitingAttributeFilters,
        limitingAttributesChanged,
        filtersChanged,
        setConnectedPlaceholderValue,
    }: UpdateFilterProps,
): UpdateFilterType {
    if (limitingAttributesChanged || filtersChanged) {
        const elements = filterAttributeElements(filter);
        const keys = isAttributeElementsByValue(elements) ? elements.values : elements.uris;
        const isInverted = isNegativeAttributeFilter(filter);

        handler.changeSelection({ keys, isInverted });
        handler.setLimitingAttributeFilters(limitingAttributeFilters);
        handler.commitSelection();

        const nextFilter = handler.getFilter();
        setConnectedPlaceholderValue(nextFilter);

        if (limitingAttributesChanged) {
            return "init-parent";
        }
        return "init-self";
    }

    return undefined;
}

function updateAutomaticResettingFilter(
    handler: IMultiSelectAttributeFilterHandler,
    {
        filter,
        limitingAttributeFilters,
        limitingAttributesChanged,
        filtersChanged,
        setConnectedPlaceholderValue,
        onApply,
        selectionMode,
    }: UpdateFilterProps,
): UpdateFilterType {
    if (limitingAttributesChanged) {
        handler.changeSelection({ keys: [], isInverted: selectionMode !== "single" });
        handler.setLimitingAttributeFilters(limitingAttributeFilters);
        // the next lines are to apply selection to the state of the parent component to make the
        // new attribute filter state persistent
        handler.commitSelection();

        //if filters are controlled from outside, do not call this kind of update because is already updated by controlled app
        const nextFilter = handler.getFilter();
        const isInverted = handler.getCommittedSelection()?.isInverted;

        setConnectedPlaceholderValue(nextFilter);
        onApply?.(nextFilter, isInverted);

        return "init-parent";
    }

    if (filtersChanged) {
        const elements = filterAttributeElements(filter);
        const keys = isAttributeElementsByValue(elements) ? elements.values : elements.uris;
        const isInverted = isNegativeAttributeFilter(filter);

        handler.changeSelection({ keys, isInverted });
        handler.commitSelection();

        return "init-self";
    }

    return undefined;
}

function refreshByType(handler: IMultiSelectAttributeFilterHandler, change: UpdateFilterType) {
    if (change === "init-parent") {
        if (handler.getInitStatus() !== "success") {
            handler.init(PARENT_FILTERS_CORRELATION);
        } else {
            handler.loadInitialElementsPage(PARENT_FILTERS_CORRELATION);
        }
    }
    if (change === "init-self") {
        handler.init();
    }
}

//

function useCallbacks(
    handler: IMultiSelectAttributeFilterHandler,
    props: {
        setConnectedPlaceholderValue: (filter: IAttributeFilter) => void;
        onApply: OnApplyCallbackType;
        selectionMode: DashboardAttributeFilterSelectionMode;
    },
) {
    const { onApply: onApplyInput, setConnectedPlaceholderValue, selectionMode } = props;
    const onSelect = useCallback(
        (selectedItems: IAttributeElement[], isInverted: boolean) => {
            const attributeFilter = handler.getFilter();
            const isElementsByRef = isAttributeElementsByRef(filterAttributeElements(attributeFilter));

            const keys = selectedItems.map((item) => (isElementsByRef ? item.uri : item.title));
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
                handler.loadInitialElementsPage(SEARCH_CORRELATION);
            }
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
        onApplyInput?.(nextFilter, isInverted, selectionMode);
    }, [onApplyInput, setConnectedPlaceholderValue, handler, selectionMode]);

    return {
        onApply,
        onLoadNextElementsPage,
        onSearch,
        onSelect,
        onReset,
    };
}
