// (C) 2022-2025 GoodData Corporation
import { useCallback, useEffect, useRef, useState } from "react";
import isEqual from "lodash/isEqual.js";
import debounce from "lodash/debounce.js";
import difference from "lodash/difference.js";
import differenceBy from "lodash/differenceBy.js";
import {
    areObjRefsEqual,
    DashboardAttributeFilterSelectionMode,
    filterAttributeElements,
    filterObjRef,
    IAbsoluteDateFilter,
    IAttributeDisplayFormMetadataObject,
    IAttributeElement,
    IAttributeElements,
    IAttributeFilter,
    IRelativeDateFilter,
    isAttributeElementsByRef,
    isAttributeElementsByValue,
    isNegativeAttributeFilter,
    isPositiveAttributeFilter,
    ObjRef,
    objRefToString,
} from "@gooddata/sdk-model";
import { useBackendStrict, useWorkspaceStrict, GoodDataSdkError, UnexpectedSdkError } from "@gooddata/sdk-ui";

import { IMultiSelectAttributeFilterHandler } from "../../AttributeFilterHandler/index.js";
import { IAttributeFilterCoreProps, OnApplyCallbackType, OnSelectCallbackType } from "../types.js";
import { useResolveFilterInput } from "./useResolveFilterInput.js";
import { useResolveParentFiltersInput } from "./useResolveParentFiltersInput.js";
import { useResolveDependentDateFiltersInput } from "./useResolveDependentDateFiltersInput.js";
import { useAttributeFilterHandler } from "./useAttributeFilterHandler.js";
import { useAttributeFilterControllerData } from "./useAttributeFilterControllerData.js";
import {
    DISPLAY_FORM_CHANGED_CORRELATION,
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
import { useAttributeFilterHandlerState } from "./useAttributeFilterHandlerState.js";

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
        dependentDateFilters,
        parentFilterOverAttribute,
        validateElementsBy,
        resetOnParentFilterChange = true,
        onApply,
        onSelect,
        onError,

        hiddenElements,
        staticElements,

        elementsOptions,

        displayAsLabel,

        selectionMode = "multi",
        selectFirst = false,
        enableDuplicatedLabelValuesInAttributeFilter = true,
        enableImmediateAttributeFilterDisplayAsLabelMigration = false,
        withoutApply = false,
    } = props;

    const backend = useBackendStrict(backendInput, "AttributeFilter");
    const workspace = useWorkspaceStrict(workspaceInput, "AttributeFilter");
    const supportsSettingConnectingAttributes = backend.capabilities.supportsSettingConnectingAttributes;
    const supportsKeepingDependentFiltersSelection =
        backend.capabilities.supportsKeepingDependentFiltersSelection;
    const supportsCircularDependencyInFilters = backend.capabilities.supportsCircularDependencyInFilters;
    const supportsShowingFilteredElements = backend.capabilities.supportsShowingFilteredElements;
    const supportsSingleSelectDependentFilters = backend.capabilities.supportsSingleSelectDependentFilters;

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

    const limitingDateFilters = useResolveDependentDateFiltersInput(dependentDateFilters);

    const handler = useAttributeFilterHandler({
        backend,
        filter,
        workspace,
        hiddenElements,
        staticElements,
        enableDuplicatedLabelValuesInAttributeFilter,
        displayAsLabel,
    });
    const attributeFilterControllerData = useAttributeFilterControllerData(
        handler,
        supportsShowingFilteredElements,
        shouldIncludeLimitingFilters,
    );

    const forcedInitErrorProp = isValidSingleSelectionFilter(
        selectionMode,
        filter,
        limitingAttributeFilters,
        supportsSingleSelectDependentFilters,
    )
        ? {}
        : { initError: new UnexpectedSdkError() };

    useOnError(handler, { onError });
    useInitOrReload(
        handler,
        {
            filter,
            limitingAttributeFilters,
            limitingDateFilters,
            limitingValidationItems: validateElementsBy,
            limit: elementsOptions?.limit,
            onApply,
            onSelect,
            setConnectedPlaceholderValue,
            resetOnParentFilterChange,
            selectionMode,
            setShouldReloadElements,
            displayAsLabel,
        },
        supportsKeepingDependentFiltersSelection,
        supportsCircularDependencyInFilters,
        enableDuplicatedLabelValuesInAttributeFilter,
    );
    const callbacks = useCallbacks(
        handler,
        {
            onApply,
            onSelect,
            setConnectedPlaceholderValue,
            selectionMode,
            shouldReloadElements,
            setShouldReloadElements,
            shouldIncludeLimitingFilters,
            setShouldIncludeLimitingFilters,
            limitingAttributeFilters,
            limitingDateFilters,
            withoutApply,
        },
        supportsShowingFilteredElements,
        supportsKeepingDependentFiltersSelection,
        enableDuplicatedLabelValuesInAttributeFilter,
        enableImmediateAttributeFilterDisplayAsLabelMigration,
    );

    useSingleSelectModeHandler(handler, {
        selectFirst,
        onApply: callbacks.onApply,
        selectionMode,
        enableDuplicatedLabelValuesInAttributeFilter,
        withoutApply,
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

const EMPTY_LIMITING_VALIDATION_ITEMS: ObjRef[] = [];

const areElementsEqual = (elementsA: IAttributeElements, elementsB: IAttributeElements) => {
    return (
        (isAttributeElementsByRef(elementsA) &&
            isAttributeElementsByRef(elementsB) &&
            isEqual([...elementsA.uris].sort(), [...elementsB.uris].sort())) ||
        (isAttributeElementsByValue(elementsA) &&
            isAttributeElementsByValue(elementsB) &&
            isEqual([...elementsA.values].sort(), [...elementsB.values].sort()))
    );
};

// omit local identifier and sort elements because they order may change depending on current displayAsLabel order
const areFiltersEqual = (filterA: IAttributeFilter, filterB: IAttributeFilter) => {
    if (!filterA || !filterB) {
        return false;
    }
    const typeEqual = isPositiveAttributeFilter(filterA) === isPositiveAttributeFilter(filterB);
    const dfsEqual = areObjRefsEqual(filterObjRef(filterA), filterObjRef(filterB));
    const elementsA = filterAttributeElements(filterA);
    const elementsB = filterAttributeElements(filterB);
    const elementsEqual = areElementsEqual(elementsA, elementsB);

    return typeEqual && dfsEqual && elementsEqual;
};

function useInitOrReload(
    handler: IMultiSelectAttributeFilterHandler,
    props: {
        filter: IAttributeFilter;
        limitingAttributeFilters?: IElementsQueryAttributeFilter[];
        limitingDateFilters?: (IRelativeDateFilter | IAbsoluteDateFilter)[];
        limitingValidationItems?: ObjRef[];
        limit?: number;
        setConnectedPlaceholderValue: (filter: IAttributeFilter) => void;
        onApply: OnApplyCallbackType;
        onSelect: OnSelectCallbackType;
        resetOnParentFilterChange: boolean;
        selectionMode: DashboardAttributeFilterSelectionMode;
        setShouldReloadElements: (value: boolean) => void;
        displayAsLabel: ObjRef;
    },
    supportsKeepingDependentFiltersSelection: boolean,
    supportsCircularDependencyInFilters: boolean,
    enableDuplicatedLabelValuesInAttributeFilter: boolean,
) {
    const {
        filter,
        limitingAttributeFilters,
        limitingDateFilters,
        limitingValidationItems = EMPTY_LIMITING_VALIDATION_ITEMS,
        limit,
        resetOnParentFilterChange,
        setConnectedPlaceholderValue,
        onApply,
        onSelect,
        selectionMode,
        setShouldReloadElements,
        displayAsLabel,
    } = props;

    useEffect(() => {
        if (limitingAttributeFilters.length > 0) {
            handler.setLimitingAttributeFilters(limitingAttributeFilters);
        }

        if (limitingDateFilters.length > 0) {
            handler.setLimitingDateFilters(limitingDateFilters);
        }

        if (limitingValidationItems?.length > 0) {
            handler.setLimitingValidationItems(limitingValidationItems);
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

        const limitingDateFiltersChanged = !isEqual(limitingDateFilters, handler.getLimitingDateFilters());

        const getFilterChanged = (
            filter: IAttributeFilter,
            handler: IMultiSelectAttributeFilterHandler,
            enableDuplicatedLabelValuesInAttributeFilter: boolean,
        ) => {
            if (enableDuplicatedLabelValuesInAttributeFilter) {
                return (
                    !areFiltersEqual(filter, handler.getFilter()) &&
                    !areFiltersEqual(filter, handler.getFilterToDisplay())
                );
            }
            return !areFiltersEqual(filter, handler.getFilter());
        };

        const filterChanged = getFilterChanged(filter, handler, enableDuplicatedLabelValuesInAttributeFilter);

        const limitingValidationItemsChanged = !isEqual(
            limitingValidationItems,
            handler.getLimitingValidationItems(),
        );

        const props: UpdateFilterProps = {
            filter,
            limitingAttributeFilters,
            limitingAttributesChanged,
            limitingDateFilters,
            limitingDateFiltersChanged,
            filterChanged,
            setConnectedPlaceholderValue,
            onApply,
            onSelect,
            selectionMode,
            setShouldReloadElements,
            limitingValidationItems,
            limitingValidationItemsChanged,
            displayAsLabel,
        };

        const change = resetOnParentFilterChange
            ? updateAutomaticResettingFilter(handler, props, supportsCircularDependencyInFilters)
            : updateNonResettingFilter(
                  handler,
                  props,
                  supportsKeepingDependentFiltersSelection,
                  enableDuplicatedLabelValuesInAttributeFilter,
              );
        refreshByType(handler, change, supportsKeepingDependentFiltersSelection);
    }, [
        filter,
        limitingAttributeFilters,
        limitingDateFilters,
        resetOnParentFilterChange,
        handler,
        onApply,
        onSelect,
        setConnectedPlaceholderValue,
        selectionMode,
        supportsKeepingDependentFiltersSelection,
        supportsCircularDependencyInFilters,
        setShouldReloadElements,
        limitingValidationItems,
        displayAsLabel,
        enableDuplicatedLabelValuesInAttributeFilter,
    ]);

    const isMountedRef = useRef(false);
    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        const originalFilterRef = filterObjRef(handler.getOriginalFilter());
        const currentDisplayAsLabel = handler.getDisplayAsLabel();

        const isNotResettingToOrigin =
            currentDisplayAsLabel && !areObjRefsEqual(originalFilterRef, currentDisplayAsLabel);
        if (
            enableDuplicatedLabelValuesInAttributeFilter &&
            handler.getInitStatus() !== "loading" && // previous effect already initializing
            ((displayAsLabel && !currentDisplayAsLabel) ||
                (!displayAsLabel && isNotResettingToOrigin) ||
                (displayAsLabel &&
                    currentDisplayAsLabel &&
                    !areObjRefsEqual(displayAsLabel, currentDisplayAsLabel)))
        ) {
            const unsubscribe = handler.onLoadCustomElementsSuccess((params) => {
                // check correlation to prevent events mismatch
                if (params.correlation.includes(DISPLAY_FORM_CHANGED_CORRELATION)) {
                    unsubscribe();
                    onApply?.(
                        handler.getFilter(),
                        handler.getCommittedSelection()?.isInverted,
                        selectionMode,
                        handler.getElementsByKey(handler.getWorkingSelection().keys),
                        displayAsLabel,
                    );
                }
            });
            handler.setDisplayAsLabel(displayAsLabel);
            // TODO INE: optimize and load only selection elements + first page, not attribute itself
            handler.init(DISPLAY_FORM_CHANGED_CORRELATION);
            return () => {
                if (!isMountedRef.current) {
                    unsubscribe();
                }
            };
        }
        return undefined;
    }, [handler, displayAsLabel, enableDuplicatedLabelValuesInAttributeFilter, onApply, selectionMode]);
}

type UpdateFilterProps = {
    filter: IAttributeFilter;
    displayAsLabel: ObjRef;
    limitingAttributeFilters?: IElementsQueryAttributeFilter[];
    limitingAttributesChanged: boolean;
    limitingDateFilters?: (IRelativeDateFilter | IAbsoluteDateFilter)[];
    limitingDateFiltersChanged: boolean;
    filterChanged: boolean;
    setConnectedPlaceholderValue: (filter: IAttributeFilter) => void;
    onApply: OnApplyCallbackType;
    onSelect: OnSelectCallbackType;
    selectionMode: DashboardAttributeFilterSelectionMode;
    setShouldReloadElements: (value: boolean) => void;
    limitingValidationItems: ObjRef[];
    limitingValidationItemsChanged: boolean;
};

type UpdateFilterType = "init-parent" | "init-self" | undefined;

function updateNonResettingFilter(
    handler: IMultiSelectAttributeFilterHandler,
    {
        filter,
        limitingAttributeFilters,
        limitingAttributesChanged,
        limitingDateFilters,
        limitingDateFiltersChanged,
        filterChanged,
        setConnectedPlaceholderValue,
        setShouldReloadElements,
        limitingValidationItemsChanged,
        limitingValidationItems,
        displayAsLabel,
    }: UpdateFilterProps,
    supportsKeepingDependentFiltersSelection: boolean,
    enableDuplicatedLabelValuesInAttributeFilter: boolean,
): UpdateFilterType {
    if (
        limitingAttributesChanged ||
        filterChanged ||
        limitingValidationItemsChanged ||
        limitingDateFiltersChanged
    ) {
        const elements = filterAttributeElements(filter);
        const keys = isAttributeElementsByValue(elements) ? elements.values : elements.uris;
        const isInverted = isNegativeAttributeFilter(filter);
        const irrelevantKeys = handler.getCommittedSelection().irrelevantKeys;

        // Sometimes leftover irrelevant keys may be shown as the app does not know about irrelevant keys.
        // In this case, we want to reset the irrelevant keys.
        const leftoverIrrelevantKeys = difference(irrelevantKeys, keys);

        const hasLimitingDateFiltersChanged =
            handler.getLimitingDateFilters().length !== limitingDateFilters.length ||
            differenceBy(handler.getLimitingDateFilters(), limitingDateFilters, (dateFilter) =>
                objRefToString(filterObjRef(dateFilter)),
            ).length > 0;
        const hasNumberOfLimitingAttributesChanged =
            handler.getLimitingAttributeFilters().length !== limitingAttributeFilters.length;
        const shouldReinitilizeAllElements =
            supportsKeepingDependentFiltersSelection &&
            (hasNumberOfLimitingAttributesChanged ||
                hasLimitingDateFiltersChanged ||
                !isEmpty(leftoverIrrelevantKeys));

        const irrelevantKeysObj = shouldReinitilizeAllElements ? { irrelevantKeys: [] } : {};
        if (filterChanged || !supportsKeepingDependentFiltersSelection || shouldReinitilizeAllElements) {
            if (enableDuplicatedLabelValuesInAttributeFilter) {
                const displayFormRef = filterObjRef(filter);
                handler.setDisplayForm(displayFormRef);
                handler.setDisplayAsLabel(displayAsLabel);
            }
            handler.changeSelection({ keys, isInverted, ...irrelevantKeysObj });
            handler.commitSelection();
        }
        handler.setLimitingAttributeFilters(limitingAttributeFilters);
        handler.setLimitingValidationItems(limitingValidationItems);
        handler.setLimitingDateFilters(limitingDateFilters);

        const nextFilter = handler.getFilter();
        setConnectedPlaceholderValue(nextFilter);

        if (shouldReinitilizeAllElements) {
            return "init-self";
        }

        if (limitingAttributesChanged || limitingDateFiltersChanged) {
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
        onSelect,
        selectionMode,
        displayAsLabel,
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

        const displayAsLabel = handler.getDisplayAsLabel();
        onSelect?.(nextFilter, isInverted, selectionMode, [], displayAsLabel);
        onApply?.(nextFilter, isInverted, selectionMode, [], displayAsLabel);

        return "init-parent";
    }

    if (filterChanged) {
        // reset handler completely to match input filter
        // label could change as a part of migration to the primary label
        const displayFormRef = filterObjRef(filter);
        const elements = filterAttributeElements(filter);
        const keys = isAttributeElementsByValue(elements) ? elements.values : elements.uris;
        const isInverted = isNegativeAttributeFilter(filter);

        handler.setDisplayForm(displayFormRef);
        handler.setDisplayAsLabel(displayAsLabel);
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
        onSelect: OnSelectCallbackType;
        selectionMode: DashboardAttributeFilterSelectionMode;
        shouldReloadElements: boolean;
        setShouldReloadElements: (value: boolean) => void;
        shouldIncludeLimitingFilters: boolean;
        setShouldIncludeLimitingFilters: (value: boolean) => void;
        limitingAttributeFilters: IElementsQueryAttributeFilter[];
        limitingDateFilters: (IRelativeDateFilter | IAbsoluteDateFilter)[];
        withoutApply: boolean;
    },
    supportsShowingFilteredElements: boolean,
    supportsKeepingDependentFiltersSelection: boolean,
    enableDuplicatedLabelValuesInAttributeFilter: boolean,
    enableImmediateAttributeFilterDisplayAsLabelMigration: boolean,
) {
    const {
        onApply: onApplyInputCallback,
        onSelect: onSelectInputCallback,
        setConnectedPlaceholderValue,
        selectionMode,
        shouldReloadElements,
        setShouldReloadElements,
        shouldIncludeLimitingFilters,
        setShouldIncludeLimitingFilters,
        limitingAttributeFilters,
        limitingDateFilters,
        withoutApply,
    } = props;

    const handlerState = useAttributeFilterHandlerState(handler);

    const onSelectionChange = useCallback(
        (onSelectionChangeInputCallback: OnApplyCallbackType | OnSelectCallbackType) => {
            const nextFilter = handler.getFilter();
            const isInverted = handler.getCommittedSelection()?.isInverted;

            if (enableDuplicatedLabelValuesInAttributeFilter) {
                const displayAsLabel = handler.getDisplayAsLabel();
                const { attribute } = handlerState;
                if (!isPrimaryLabelUsed(nextFilter, attribute.data?.displayForms)) {
                    const primaryDisplayForm = attribute.data?.displayForms.find((df) => df.isPrimary);
                    if (!primaryDisplayForm) {
                        throw new Error("No primary display form found.");
                    }
                    const primaryLabelRef = primaryDisplayForm.ref;
                    const filterUsingPrimaryLabel = replaceFilterDisplayForm(nextFilter, primaryLabelRef);
                    onSelectionChangeInputCallback?.(
                        filterUsingPrimaryLabel,
                        isInverted,
                        selectionMode,
                        handler.getElementsByKey(handler.getWorkingSelection().keys),
                        displayAsLabel,
                    );
                } else {
                    onSelectionChangeInputCallback?.(
                        nextFilter,
                        isInverted,
                        selectionMode,
                        handler.getElementsByKey(handler.getWorkingSelection().keys),
                        displayAsLabel,
                    );
                }
            } else {
                onSelectionChangeInputCallback?.(nextFilter, isInverted, selectionMode);
            }
        },
        [handler, enableDuplicatedLabelValuesInAttributeFilter, handlerState, selectionMode],
    );

    const onSelect = useCallback(
        (selectedItems: IAttributeElement[], isInverted: boolean) => {
            const attributeFilter = handler.getFilter();
            const isElementsByRef = isAttributeElementsByRef(filterAttributeElements(attributeFilter));

            const keys = selectedItems.map((item) =>
                isElementsByRef || enableDuplicatedLabelValuesInAttributeFilter ? item.uri : item.title,
            );
            const irrelevantKeysObj = selectionMode === "single" ? { irrelevantKeys: [] } : {};
            handler.changeSelection({ keys, isInverted, ...irrelevantKeysObj });

            onSelectionChange(onSelectInputCallback);
        },
        [
            handler,
            selectionMode,
            onSelectionChange,
            onSelectInputCallback,
            enableDuplicatedLabelValuesInAttributeFilter,
        ],
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
        if (!withoutApply) {
            handler.revertSelection();
        }

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
            handler.setLimitingDateFilters(limitingDateFilters);
        }
    }, [
        handler,
        limitingAttributeFilters,
        limitingDateFilters,
        setShouldIncludeLimitingFilters,
        setShouldReloadElements,
        shouldIncludeLimitingFilters,
        supportsShowingFilteredElements,
        withoutApply,
    ]);

    const onApply = useCallback(
        (applyRegardlessWithoutApplySetting: boolean = false) => {
            if (withoutApply && !applyRegardlessWithoutApplySetting) {
                return;
            }
            handler.commitSelection();
            setConnectedPlaceholderValue(handler.getFilter());
            onSelectionChange(onApplyInputCallback);
        },
        [handler, setConnectedPlaceholderValue, onSelectionChange, onApplyInputCallback, withoutApply],
    );

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
            handler.setLimitingValidationItems([]);
            handler.setLimitingDateFilters([]);
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

    useReportMigratedFilter(handler, onApply, enableImmediateAttributeFilterDisplayAsLabelMigration);

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
        enableDuplicatedLabelValuesInAttributeFilter: boolean;
        withoutApply: boolean;
    },
) => {
    const {
        selectFirst,
        selectionMode,
        onApply,
        enableDuplicatedLabelValuesInAttributeFilter,
        withoutApply,
    } = props;
    const committedSelectionKeys = handler.getCommittedSelection().keys;
    const initialStatus = handler.getInitStatus();
    const elements = handler.getAllElements();
    const filter = handler.getFilter();

    useEffect(() => {
        if (
            selectFirst &&
            selectionMode === "single" &&
            isEmpty(committedSelectionKeys) &&
            initialStatus === "success" &&
            !isEmpty(elements) &&
            !withoutApply
        ) {
            const isElementsByRef = isAttributeElementsByRef(filterAttributeElements(filter));
            const keys = [
                isElementsByRef || enableDuplicatedLabelValuesInAttributeFilter
                    ? elements[0].uri
                    : elements[0].title,
            ];

            handler.changeSelection({ keys, isInverted: false, irrelevantKeys: [] });
            handler.commitSelection();
            onApply();
        }
    }, [
        selectFirst,
        selectionMode,
        committedSelectionKeys,
        initialStatus,
        elements,
        filter,
        handler,
        onApply,
        enableDuplicatedLabelValuesInAttributeFilter,
        withoutApply,
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
function isPrimaryLabelUsed(
    filter: IAttributeFilter,
    displayForms: IAttributeDisplayFormMetadataObject[],
): boolean {
    const primaryDisplayForm = displayForms.find((df) => df.isPrimary);
    if (!primaryDisplayForm) {
        throw new Error("No primary display form found.");
    }

    const filterDisplayForm = filterObjRef(filter);
    if (!filterDisplayForm) {
        return false;
    }

    return areObjRefsEqual(filterDisplayForm, primaryDisplayForm.ref);
}
function replaceFilterDisplayForm(nextFilter: IAttributeFilter, primaryLabelRef: ObjRef): IAttributeFilter {
    if (isPositiveAttributeFilter(nextFilter)) {
        return {
            positiveAttributeFilter: {
                ...nextFilter.positiveAttributeFilter,
                displayForm: primaryLabelRef,
            },
        };
    }

    return {
        negativeAttributeFilter: {
            ...nextFilter.negativeAttributeFilter,
            displayForm: primaryLabelRef,
        },
    };
}

// The hook detects if:
// - filter uses non-primary label
// - filter was created before "support duplicated label values" feature was introduced
// - filter was migrated to use displayAsLabel by "loadAttributeSaga"
// If all of the above applies, the provided callback (onApply of the filter) is called to propagate the
// new filter state (filter label, displayAsLabel, and updated selection) is reported to the application
// that uses the filter.
const useReportMigratedFilter = (
    handler: IMultiSelectAttributeFilterHandler,
    onFilterMigrated: (applyRegardlessWithoutApplySetting: boolean) => void,
    enableImmediateAttributeFilterDisplayAsLabelMigration: boolean,
) => {
    const initialLabel = useRef(handler.getDisplayAsLabel());
    const wasMigrationReported = useRef(false);
    const initStatus = handler.getInitStatus();

    if (
        enableImmediateAttributeFilterDisplayAsLabelMigration &&
        !wasMigrationReported.current &&
        initStatus === "success" &&
        !areObjRefsEqual(initialLabel.current, handler.getDisplayAsLabel()) &&
        !areObjRefsEqual(filterObjRef(handler.getOriginalFilter()), filterObjRef(handler.getFilter()))
    ) {
        wasMigrationReported.current = true;
        onFilterMigrated(true);

        console.warn(
            "AttributeFilter: Filter label migration reported to filter's parent app. Original filter label:",
            filterObjRef(handler.getOriginalFilter()),
            "new filter label:",
            filterObjRef(handler.getFilter()),
            "new filter displayAsLabel:",
            handler.getDisplayAsLabel(),
        );
    }
};
