// (C) 2022-2023 GoodData Corporation
import { useCallback, useEffect, useState } from "react";
import isEqual from "lodash/isEqual.js";
import debounce from "lodash/debounce.js";
import difference from "lodash/difference.js";
import {
    DashboardAttributeFilterSelectionMode,
    filterAttributeElements,
    IAttributeElement,
    IAttributeFilter,
    isAttributeElementsByRef,
    isAttributeElementsByValue,
    isNegativeAttributeFilter,
} from "@gooddata/sdk-model";
import { useBackendStrict, useWorkspaceStrict, GoodDataSdkError, UnexpectedSdkError } from "@gooddata/sdk-ui";

import { IMultiSelectAttributeFilterHandler } from "../../AttributeFilterHandler/index.js";
import { IAttributeFilterCoreProps, OnApplyCallbackType } from "../types.js";
import { useResolveFilterInput } from "./useResolveFilterInput.js";
import { useResolveParentFiltersInput } from "./useResolveParentFiltersInput.js";
import { useAttributeFilterHandler } from "./useAttributeFilterHandler.js";
import { useAttributeFilterControllerData } from "./useAttributeFilterControllerData.js";
import {
    IRRELEVANT_SELECTION,
    PARENT_FILTERS_CORRELATION,
    RESET_CORRELATION,
    SEARCH_CORRELATION,
    SHOW_FILTERED_ELEMENTS_CORRELATION,
} from "./constants.js";
import { IElementsQueryAttributeFilter } from "@gooddata/sdk-backend-spi";
import { AttributeFilterController } from "./types.js";
import { isValidSingleSelectionFilter } from "../utils.js";
import isEmpty from "lodash/isEmpty.js";
import { invariant } from "ts-invariant";

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
        selectFirst = false,
    } = props;

    const backend = useBackendStrict(backendInput, "AttributeFilter");
    const workspace = useWorkspaceStrict(workspaceInput, "AttributeFilter");
    const supportsSettingConnectingAttributes = backend.capabilities.supportsSettingConnectingAttributes;
    const supportsKeepingDependentFiltersSelection =
        backend.capabilities.supportsKeepingDependentFiltersSelection;
    const supportsCircularDependencyInFilters = backend.capabilities.supportsCircularDependencyInFilters;
    const supportsShowingFilteredElements = backend.capabilities.supportsShowingFilteredElements;

    const { shouldReloadElements, setShouldReloadElements } = useShouldReloadElements(
        supportsKeepingDependentFiltersSelection,
        supportsCircularDependencyInFilters,
    );
    const { shouldIncludeLimitingFilters, setShouldIncludeLimitingFilters } = useShouldIncludeLimitingFilters(
        supportsShowingFilteredElements,
    );

    const { filter, setConnectedPlaceholderValue } = useResolveFilterInput(filterInput, connectToPlaceholder);

    const limitingAttributeFilters = useResolveParentFiltersInput(
        parentFilters,
        parentFilterOverAttribute,
        supportsSettingConnectingAttributes,
    );

    const handler = useAttributeFilterHandler({
        backend,
        filter,
        workspace,
        hiddenElements,
        staticElements,
    });
    const attributeFilterControllerData = useAttributeFilterControllerData(
        handler,
        supportsShowingFilteredElements,
        shouldIncludeLimitingFilters,
    );

    const forcedInitErrorProp = isValidSingleSelectionFilter(selectionMode, filter, limitingAttributeFilters)
        ? {}
        : { initError: new UnexpectedSdkError() };

    useOnError(handler, { onError });
    useInitOrReload(
        handler,
        {
            filter,
            limitingAttributeFilters,
            limit: elementsOptions?.limit,
            onApply,
            setConnectedPlaceholderValue,
            resetOnParentFilterChange,
            selectionMode,
            setShouldReloadElements,
        },
        supportsKeepingDependentFiltersSelection,
        supportsCircularDependencyInFilters,
    );
    const callbacks = useCallbacks(
        handler,
        {
            onApply,
            setConnectedPlaceholderValue,
            selectionMode,
            shouldReloadElements,
            setShouldReloadElements,
            shouldIncludeLimitingFilters,
            setShouldIncludeLimitingFilters,
            limitingAttributeFilters,
        },
        supportsShowingFilteredElements,
        supportsKeepingDependentFiltersSelection,
    );

    useSingleSelectModeHandler(handler, {
        selectFirst,
        onApply: callbacks.onApply,
        selectionMode,
    });

    return {
        ...attributeFilterControllerData,
        ...callbacks,
        ...forcedInitErrorProp,
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
        setShouldReloadElements: (value: boolean) => void;
    },
    supportsKeepingDependentFiltersSelection: boolean,
    supportsCircularDependencyInFilters: boolean,
) {
    const {
        filter,
        limitingAttributeFilters,
        limit,
        resetOnParentFilterChange,
        setConnectedPlaceholderValue,
        onApply,
        selectionMode,
        setShouldReloadElements,
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
        const filterChanged = !isEqual(filter, handler.getFilter());

        const props: UpdateFilterProps = {
            filter,
            limitingAttributeFilters,
            limitingAttributesChanged,
            filterChanged,
            setConnectedPlaceholderValue,
            onApply,
            selectionMode,
            setShouldReloadElements,
        };

        const change = resetOnParentFilterChange
            ? updateAutomaticResettingFilter(handler, props, supportsCircularDependencyInFilters)
            : updateNonResettingFilter(handler, props, supportsKeepingDependentFiltersSelection);
        refreshByType(handler, change, supportsKeepingDependentFiltersSelection);
    }, [
        filter,
        limitingAttributeFilters,
        resetOnParentFilterChange,
        handler,
        onApply,
        setConnectedPlaceholderValue,
        selectionMode,
        supportsKeepingDependentFiltersSelection,
        supportsCircularDependencyInFilters,
        setShouldReloadElements,
    ]);
}

type UpdateFilterProps = {
    filter: IAttributeFilter;
    limitingAttributeFilters?: IElementsQueryAttributeFilter[];
    limitingAttributesChanged: boolean;
    filterChanged: boolean;
    setConnectedPlaceholderValue: (filter: IAttributeFilter) => void;
    onApply: OnApplyCallbackType;
    selectionMode: DashboardAttributeFilterSelectionMode;
    setShouldReloadElements: (value: boolean) => void;
};

type UpdateFilterType = "init-parent" | "init-self" | undefined;

function updateNonResettingFilter(
    handler: IMultiSelectAttributeFilterHandler,
    {
        filter,
        limitingAttributeFilters,
        limitingAttributesChanged,
        filterChanged,
        setConnectedPlaceholderValue,
        setShouldReloadElements,
    }: UpdateFilterProps,
    supportsKeepingDependentFiltersSelection: boolean,
): UpdateFilterType {
    if (limitingAttributesChanged || filterChanged) {
        const elements = filterAttributeElements(filter);
        const keys = isAttributeElementsByValue(elements) ? elements.values : elements.uris;
        const isInverted = isNegativeAttributeFilter(filter);

        const hasNumberOfLimitingAttributesChanged =
            handler.getLimitingAttributeFilters().length !== limitingAttributeFilters.length;
        const shouldReinitilizeAllElements =
            supportsKeepingDependentFiltersSelection && hasNumberOfLimitingAttributesChanged;

        const irrelevantKeysObj = shouldReinitilizeAllElements ? { irrelevantKeys: [] } : {};
        handler.changeSelection({ keys, isInverted, ...irrelevantKeysObj });
        handler.setLimitingAttributeFilters(limitingAttributeFilters);
        handler.commitSelection();

        const nextFilter = handler.getFilter();
        setConnectedPlaceholderValue(nextFilter);

        if (shouldReinitilizeAllElements) {
            return "init-self";
        }

        if (limitingAttributesChanged) {
            setShouldReloadElements(true);
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
        filterChanged,
        setConnectedPlaceholderValue,
        onApply,
        selectionMode,
    }: UpdateFilterProps,
    supportsCircularDependencyInFilters: boolean,
): UpdateFilterType {
    const canAutomaticallyReset =
        limitingAttributeFilters.length === 0 || !supportsCircularDependencyInFilters;
    invariant(
        canAutomaticallyReset,
        "It is not possible to automatically reset dependent filters with current backend. Please set attribute filter to not reset on parent filter change (resetOnParentFilterChange prop).",
    );

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

    if (filterChanged) {
        const elements = filterAttributeElements(filter);
        const keys = isAttributeElementsByValue(elements) ? elements.values : elements.uris;
        const isInverted = isNegativeAttributeFilter(filter);

        handler.changeSelection({ keys, isInverted });
        handler.commitSelection();

        return "init-self";
    }

    return undefined;
}

function refreshByType(
    handler: IMultiSelectAttributeFilterHandler,
    change: UpdateFilterType,
    supportsKeepingDependentFiltersSelection: boolean,
) {
    if (change === "init-parent") {
        if (supportsKeepingDependentFiltersSelection) {
            return;
        }

        if (handler.getInitStatus() !== "success") {
            handler.init(PARENT_FILTERS_CORRELATION);
        } else {
            handler.initTotalCount(PARENT_FILTERS_CORRELATION);
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
        shouldReloadElements: boolean;
        setShouldReloadElements: (value: boolean) => void;
        shouldIncludeLimitingFilters: boolean;
        setShouldIncludeLimitingFilters: (value: boolean) => void;
        limitingAttributeFilters: IElementsQueryAttributeFilter[];
    },
    supportsShowingFilteredElements: boolean,
    supportsKeepingDependentFiltersSelection: boolean,
) {
    const {
        onApply: onApplyInput,
        setConnectedPlaceholderValue,
        selectionMode,
        shouldReloadElements,
        setShouldReloadElements,
        shouldIncludeLimitingFilters,
        setShouldIncludeLimitingFilters,
        limitingAttributeFilters,
    } = props;
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

        /**
         * Set shouldReloadELements to true when reseting as we want to reload elements in the future.
         */
        if (supportsShowingFilteredElements && !shouldIncludeLimitingFilters) {
            setShouldIncludeLimitingFilters(true);
            setShouldReloadElements(true);
            handler.setLimitingAttributeFilters(limitingAttributeFilters);
        }
    }, [
        handler,
        limitingAttributeFilters,
        setShouldIncludeLimitingFilters,
        setShouldReloadElements,
        shouldIncludeLimitingFilters,
        supportsShowingFilteredElements,
    ]);

    const onApply = useCallback(() => {
        handler.commitSelection();
        const nextFilter = handler.getFilter();
        const isInverted = handler.getCommittedSelection()?.isInverted;

        setConnectedPlaceholderValue(nextFilter);
        onApplyInput?.(nextFilter, isInverted, selectionMode);
    }, [onApplyInput, setConnectedPlaceholderValue, handler, selectionMode]);

    const onOpen = useCallback(() => {
        if (shouldReloadElements) {
            handler.loadInitialElementsPage(RESET_CORRELATION);
            !handler.isWorkingSelectionEmpty() && handler.loadIrrelevantElements(IRRELEVANT_SELECTION);
            setShouldReloadElements(false);
        }
    }, [handler, shouldReloadElements, setShouldReloadElements]);

    const onShowFilteredElements = useCallback(() => {
        if (supportsShowingFilteredElements) {
            setShouldIncludeLimitingFilters(false);
            handler.changeSelection({ ...handler.getWorkingSelection(), irrelevantKeys: [] });
            handler.setLimitingAttributeFilters([]);
            handler.loadInitialElementsPage(SHOW_FILTERED_ELEMENTS_CORRELATION);
        }
    }, [handler, setShouldIncludeLimitingFilters, supportsShowingFilteredElements]);

    const onClearIrrelevantSelection = useCallback(() => {
        if (supportsKeepingDependentFiltersSelection && supportsShowingFilteredElements) {
            const workingSelection = handler.getWorkingSelection();
            const sanitizedWorkingSelectionKeys = difference(
                workingSelection.keys,
                workingSelection.irrelevantKeys,
            );

            handler.changeSelection({
                ...workingSelection,
                keys: sanitizedWorkingSelectionKeys,
                irrelevantKeys: [],
            });
        }
    }, [handler, supportsKeepingDependentFiltersSelection, supportsShowingFilteredElements]);

    return {
        onApply,
        onLoadNextElementsPage,
        onSearch,
        onSelect,
        onReset,
        onOpen,
        onShowFilteredElements,
        onClearIrrelevantSelection,
    };
}

//

const useSingleSelectModeHandler = (
    handler: IMultiSelectAttributeFilterHandler,
    props: {
        selectFirst: boolean;
        selectionMode: DashboardAttributeFilterSelectionMode;
        onApply: () => void;
    },
) => {
    const { selectFirst, selectionMode, onApply } = props;
    const committedSelectionKeys = handler.getCommittedSelection().keys;
    const initialElementsPageStatus = handler.getInitialElementsPageStatus();
    const elements = handler.getAllElements();
    const filter = handler.getFilter();

    useEffect(() => {
        if (
            selectFirst &&
            selectionMode === "single" &&
            isEmpty(committedSelectionKeys) &&
            initialElementsPageStatus === "success" &&
            !isEmpty(elements)
        ) {
            const isElementsByRef = isAttributeElementsByRef(filterAttributeElements(filter));
            const keys = [isElementsByRef ? elements[0].uri : elements[0].title];

            handler.changeSelection({ keys, isInverted: false });
            handler.commitSelection();
            onApply();
        }
    }, [
        selectFirst,
        selectionMode,
        committedSelectionKeys,
        initialElementsPageStatus,
        elements,
        filter,
        handler,
        onApply,
    ]);
};

/**
 * This flag handles elements reload when shouldElementsReload flag is true.
 * In case the backend does not support keeping dependent filter selection or
 * does not support circular dependency in filter, we do not care about the flag
 * as elements are reloaded on every limiting filter change.
 */
const useShouldReloadElements = (
    supportsKeepingDependentFiltersSelection: boolean,
    supportsCircularDependencyInFilters: boolean,
) => {
    const [shouldReloadElements, setShouldReloadElements] = useState(false);

    const handleSetShouldReloadElements = useCallback(
        (value: boolean) => {
            if (!supportsKeepingDependentFiltersSelection || !supportsCircularDependencyInFilters) {
                return;
            }

            setShouldReloadElements(value);
        },
        [supportsCircularDependencyInFilters, supportsKeepingDependentFiltersSelection],
    );

    return { shouldReloadElements, setShouldReloadElements: handleSetShouldReloadElements };
};

const useShouldIncludeLimitingFilters = (supportsShowingFilteredElements: boolean) => {
    const [shouldIncludeLimitingFilters, setShouldIncludeLimitingFilters] = useState(true);

    const handleSetShouldIncludeLimitingFilters = useCallback(
        (value: boolean) => {
            if (!supportsShowingFilteredElements) {
                return;
            }

            setShouldIncludeLimitingFilters(value);
        },
        [supportsShowingFilteredElements],
    );

    return {
        shouldIncludeLimitingFilters,
        setShouldIncludeLimitingFilters: handleSetShouldIncludeLimitingFilters,
    };
};
