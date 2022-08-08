// (C) 2022 GoodData Corporation
import { useCallback, useEffect } from "react";
import isEqual from "lodash/isEqual";
import debounce from "lodash/debounce";
import { IAttributeElement } from "@gooddata/sdk-model";
import { useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";

import { useResolveFilterInput } from "./useResolveFilterInput";
import { useResolveParentFiltersInput } from "./useResolveParentFiltersInput";
import { useAttributeFilterHandler } from "./useAttributeFilterHandler";
import { IUseAttributeFilterControllerProps } from "./types";
import { useAttributeFilterControllerData } from "./useAttributeFilterControllerData";

/**
 * Use this hook if you want to implement your custom attribute filter.
 *
 * @alpha
 */
export const useAttributeFilterController = (props: IUseAttributeFilterControllerProps) => {
    const {
        backend: backendInput,
        workspace: workspaceInput,

        filter: filterInput,
        identifier,
        connectToPlaceholder,
        parentFilters,
        parentFilterOverAttribute,
        onApply: onApplyInput,

        hiddenElements,
        staticElements,
    } = props;

    const backend = useBackendStrict(backendInput, "AttributeFilter");
    const workspace = useWorkspaceStrict(workspaceInput, "AttributeFilter");

    const { filter, setConnectedPlaceholderValue } = useResolveFilterInput(
        filterInput,
        connectToPlaceholder,
        identifier,
    );

    const { limitingAttributeFilters: limitingAttributeFiltersInput } = useResolveParentFiltersInput(
        parentFilters,
        parentFilterOverAttribute,
    );

    const attributeFilterHandler = useAttributeFilterHandler({
        backend,
        filter,
        workspace,
        hiddenElements,
        staticElements,
    });

    useEffect(() => {
        attributeFilterHandler.setLimitingAttributeFilters(limitingAttributeFiltersInput);
        attributeFilterHandler.init();
        // Change of the parent filters is resolved in the useEffect bellow,
        // it does not need full reinit.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [attributeFilterHandler]);

    useEffect(() => {
        if (!isEqual(filter, attributeFilterHandler.getFilter())) {
            attributeFilterHandler.init();
        } else if (
            !isEqual(limitingAttributeFiltersInput, attributeFilterHandler.getLimitingAttributeFilters())
        ) {
            attributeFilterHandler.setLimitingAttributeFilters(limitingAttributeFiltersInput);
            attributeFilterHandler.loadInitialElementsPage();
        }
    }, [filter, limitingAttributeFiltersInput, attributeFilterHandler]);

    const onSelect = useCallback(
        (selectedItems: IAttributeElement[], isInverted: boolean) => {
            const keys = selectedItems.map((item) => item.uri);
            attributeFilterHandler.changeSelection({ keys, isInverted });
        },
        [attributeFilterHandler],
    );

    const attributeFilterControllerData = useAttributeFilterControllerData(attributeFilterHandler, props);
    const { searchString } = attributeFilterControllerData;

    // Rule is not working with debounce
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const onSearch = useCallback(
        debounce((search: string) => {
            if (searchString !== search) {
                attributeFilterHandler.setSearch(search);
            }

            attributeFilterHandler.loadInitialElementsPage();
        }, 200),
        [attributeFilterHandler, searchString],
    );

    const onLoadNextElementsPage = useCallback(() => {
        attributeFilterHandler.loadNextElementsPage();
    }, [attributeFilterHandler]);

    const onReset = useCallback(() => {
        attributeFilterHandler.revertSelection();

        if (searchString.length > 0) {
            attributeFilterHandler.setSearch("");
            attributeFilterHandler.loadInitialElementsPage();
        }
    }, [attributeFilterHandler, searchString]);

    const onApply = useCallback(() => {
        attributeFilterHandler.commitSelection();
        const nextFilter = attributeFilterHandler.getFilter();
        const isInverted = attributeFilterHandler.getCommittedSelection()?.isInverted;

        setConnectedPlaceholderValue(nextFilter);
        onApplyInput?.(nextFilter, isInverted);
    }, [onApplyInput, setConnectedPlaceholderValue, attributeFilterHandler]);

    return {
        ...attributeFilterControllerData,

        onLoadNextElementsPage,
        onSelect,
        onSearch,
        onReset,
        onApply,
    };
};
