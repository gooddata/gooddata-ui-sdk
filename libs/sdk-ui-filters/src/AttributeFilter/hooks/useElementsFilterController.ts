// (C) 2022-2026 GoodData Corporation

// oxlint-disable @typescript-eslint/require-array-sort-compare

import { type MutableRefObject, useCallback, useEffect, useRef, useState } from "react";

import { debounce, difference, differenceBy, isEmpty, isEqual } from "lodash-es";
import { invariant } from "ts-invariant";

import { type IAnalyticalBackend, type IElementsQueryAttributeFilter } from "@gooddata/sdk-backend-spi";
import {
    type DashboardAttributeFilterSelectionMode,
    type IAbsoluteDateFilter,
    type IAttributeDisplayFormMetadataObject,
    type IAttributeElement,
    type IAttributeElements,
    type IAttributeFilter,
    type IAttributeMetadataObject,
    type IRelativeDateFilter,
    type ObjRef,
    areObjRefsEqual,
    filterAttributeElements,
    filterObjRef,
    isArbitraryAttributeFilter,
    isAttributeElementsByRef,
    isAttributeElementsByValue,
    isAttributeFilterWithSelection,
    isMatchAttributeFilter,
    isNegativeAttributeFilter,
    isPositiveAttributeFilter,
    objRefToString,
} from "@gooddata/sdk-model";
import { type GoodDataSdkError, UnexpectedSdkError } from "@gooddata/sdk-ui";

import {
    DISPLAY_FORM_CHANGED_CORRELATION,
    IRRELEVANT_SELECTION,
    MAX_SELECTION_SIZE,
    PARENT_FILTERS_CORRELATION,
    RESET_CORRELATION,
    SEARCH_CORRELATION,
    SHOW_FILTERED_ELEMENTS_CORRELATION,
} from "./constants.js";
import {
    type CommonFilterControllerCallbacks,
    type ElementsFilterController,
    type ElementsFilterControllerCallbacks,
} from "./types.js";
import { useAttributeFilterControllerData } from "./useAttributeFilterControllerData.js";
import { useAttributeFilterHandler } from "./useAttributeFilterHandler.js";
import { useAttributeFilterHandlerState } from "./useAttributeFilterHandlerState.js";
import { type IMultiSelectAttributeFilterHandler } from "../../AttributeFilterHandler/types/attributeFilterHandler.js";
import { type OnApplyCallbackType, type OnChangeCallbackType } from "../types.js";
import { isValidSingleSelectionFilter } from "../utils.js";

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

const areFiltersEqual = (filterA: IAttributeFilter, filterB: IAttributeFilter) => {
    if (!filterA || !filterB) {
        return false;
    }

    const typeEqual = isPositiveAttributeFilter(filterA) === isPositiveAttributeFilter(filterB);
    const dfsEqual = areObjRefsEqual(filterObjRef(filterA), filterObjRef(filterB));

    if (isArbitraryAttributeFilter(filterA) && isArbitraryAttributeFilter(filterB)) {
        return (
            dfsEqual &&
            filterA.arbitraryAttributeFilter.values === filterB.arbitraryAttributeFilter.values &&
            (filterA.arbitraryAttributeFilter.negativeSelection ?? false) ===
                (filterB.arbitraryAttributeFilter.negativeSelection ?? false)
        );
    }
    if (isMatchAttributeFilter(filterA) && isMatchAttributeFilter(filterB)) {
        return (
            dfsEqual &&
            filterA.matchAttributeFilter.literal === filterB.matchAttributeFilter.literal &&
            filterA.matchAttributeFilter.operator === filterB.matchAttributeFilter.operator
        );
    }
    if (
        (isPositiveAttributeFilter(filterA) && isPositiveAttributeFilter(filterB)) ||
        (isNegativeAttributeFilter(filterA) && isNegativeAttributeFilter(filterB))
    ) {
        const elementsA = filterAttributeElements(filterA);
        const elementsB = filterAttributeElements(filterB);
        const elementsEqual = areElementsEqual(elementsA, elementsB);

        return typeEqual && dfsEqual && elementsEqual;
    }
    return false;
};

type UpdateFilterProps = {
    filter: IAttributeFilter;
    displayAsLabel?: ObjRef;
    limitingAttributeFilters?: IElementsQueryAttributeFilter[];
    limitingAttributesChanged: boolean;
    limitingDateFilters?: (IRelativeDateFilter | IAbsoluteDateFilter)[];
    limitingDateFiltersChanged: boolean;
    filterChanged: boolean;
    setConnectedPlaceholderValue: (filter: IAttributeFilter) => void;
    onApply: OnApplyCallbackType;
    onChange: OnChangeCallbackType;
    selectionMode: DashboardAttributeFilterSelectionMode;
    setShouldReloadElements: (value: boolean) => void;
    limitingValidationItems: ObjRef[];
    limitingValidationItemsChanged: boolean;
    withoutApply: boolean;
    isSelectionInvalid: boolean;
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
        withoutApply,
    }: UpdateFilterProps,
    supportsKeepingDependentFiltersSelection: boolean,
): UpdateFilterType {
    if (
        limitingAttributesChanged ||
        filterChanged ||
        limitingValidationItemsChanged ||
        limitingDateFiltersChanged
    ) {
        const elements = filterAttributeElements(filter);
        if (!elements) {
            return undefined;
        }
        const keys = isAttributeElementsByValue(elements) ? elements.values : elements.uris;
        const isInverted = isNegativeAttributeFilter(filter);
        const irrelevantKeys = handler.getCommittedSelection().irrelevantKeys;

        const leftoverIrrelevantKeys = difference(irrelevantKeys, keys);

        const hasLimitingDateFiltersChanged =
            handler.getLimitingDateFilters()?.length !== limitingDateFilters?.length ||
            differenceBy(handler.getLimitingDateFilters(), limitingDateFilters, (dateFilter) =>
                objRefToString(filterObjRef(dateFilter)),
            ).length > 0;
        const hasNumberOfLimitingAttributesChanged =
            handler.getLimitingAttributeFilters()?.length !== limitingAttributeFilters?.length;
        const shouldReinitilizeAllElements =
            supportsKeepingDependentFiltersSelection &&
            (hasNumberOfLimitingAttributesChanged ||
                hasLimitingDateFiltersChanged ||
                !isEmpty(leftoverIrrelevantKeys));

        const irrelevantKeysObj = shouldReinitilizeAllElements ? { irrelevantKeys: [] } : {};
        if (filterChanged || !supportsKeepingDependentFiltersSelection || shouldReinitilizeAllElements) {
            const displayFormRef = filterObjRef(filter);
            handler.setDisplayForm(displayFormRef);
            handler.setDisplayAsLabel(displayAsLabel);

            if (withoutApply) {
                handler.setSearch("");
            }
            handler.changeSelection({ keys, isInverted, ...irrelevantKeysObj });
            handler.commitSelection();
        }
        handler.setLimitingAttributeFilters(limitingAttributeFilters ?? []);
        handler.setLimitingValidationItems(limitingValidationItems);
        handler.setLimitingDateFilters(limitingDateFilters ?? []);

        const nextFilter = handler.getFilter();
        setConnectedPlaceholderValue(nextFilter);

        if (shouldReinitilizeAllElements) {
            return "init-self";
        }

        if (limitingAttributesChanged || limitingDateFiltersChanged || limitingValidationItemsChanged) {
            setShouldReloadElements(true);
            return "init-parent";
        }

        if (withoutApply) {
            const needsInitialization = isEmpty(handler.getAllElements()) && filterChanged;

            if (!needsInitialization) {
                return undefined;
            }
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
        onChange,
        selectionMode,
        displayAsLabel,
        isSelectionInvalid,
    }: UpdateFilterProps,
    supportsCircularDependencyInFilters: boolean,
): UpdateFilterType {
    const canAutomaticallyReset =
        limitingAttributeFilters?.length === 0 || !supportsCircularDependencyInFilters;
    invariant(
        canAutomaticallyReset,
        "It is not possible to automatically reset dependent filters with current backend. Please set attribute filter to not reset on parent filter change (resetOnParentFilterChange prop).",
    );

    if (limitingAttributesChanged) {
        handler.changeSelection({
            keys: [],
            isInverted: selectionMode !== "single",
        });
        handler.setLimitingAttributeFilters(limitingAttributeFilters ?? []);
        handler.commitSelection();

        const nextFilter = handler.getFilter();
        const isInverted = handler.getCommittedSelection()?.isInverted;

        setConnectedPlaceholderValue(nextFilter);

        const displayAsLabel = handler.getDisplayAsLabel();
        onChange?.(nextFilter, isInverted, selectionMode, [], displayAsLabel, false, { isSelectionInvalid });
        onApply?.(nextFilter, isInverted, selectionMode, [], displayAsLabel, false, { isSelectionInvalid });

        return "init-parent";
    }

    if (filterChanged) {
        if (!isAttributeFilterWithSelection(filter)) {
            return undefined;
        }
        const displayFormRef = filterObjRef(filter);
        const elements = filterAttributeElements(filter)!;
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
    shouldReloadElements: MutableRefObject<boolean>,
    setShouldReloadElements: (value: boolean) => void,
) {
    if (change === "init-parent") {
        if (supportsKeepingDependentFiltersSelection) {
            if (shouldReloadElements.current) {
                if (handler.getInitStatus() === "success") {
                    handler.loadInitialElementsPage(PARENT_FILTERS_CORRELATION);
                    handler.loadIrrelevantElements(IRRELEVANT_SELECTION);
                } else {
                    handler.init(PARENT_FILTERS_CORRELATION);
                }
                setShouldReloadElements(false);
            }
            return;
        }

        if (handler.getInitStatus() === "success") {
            handler.initTotalCount(PARENT_FILTERS_CORRELATION);
            handler.loadInitialElementsPage(PARENT_FILTERS_CORRELATION);
        } else {
            handler.init(PARENT_FILTERS_CORRELATION);
        }
    }
    if (change === "init-self") {
        handler.init();
    }
}

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

    if (isNegativeAttributeFilter(nextFilter)) {
        return {
            negativeAttributeFilter: {
                ...nextFilter.negativeAttributeFilter,
                displayForm: primaryLabelRef,
            },
        };
    }

    // Arbitrary/match filters are not produced by the elements handler but guard for safety.
    return nextFilter;
}

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

function useOnInitLoadingChanged(
    handler: IMultiSelectAttributeFilterHandler,
    props: {
        onInitLoadingChanged?: (loading: boolean, attributeMetadata?: IAttributeMetadataObject) => void;
    },
) {
    const { onInitLoadingChanged } = props;

    useEffect(() => {
        const callbackUnsubscribeFunctions = [
            handler.onInitStart(() => {
                onInitLoadingChanged?.(true);
            }),
            handler.onInitCancel(() => {
                onInitLoadingChanged?.(false);
            }),
            handler.onInitSuccess(() => {
                onInitLoadingChanged?.(false, handler.getAttribute());
            }),
            handler.onInitError(() => {
                onInitLoadingChanged?.(false);
            }),
        ];

        return () => {
            callbackUnsubscribeFunctions.forEach((unsubscribe) => {
                unsubscribe();
            });
        };
    }, [handler, onInitLoadingChanged]);
}

function useInitOrReload(
    handler: IMultiSelectAttributeFilterHandler,
    props: {
        filter: IAttributeFilter;
        limitingAttributeFilters?: IElementsQueryAttributeFilter[];
        limitingDateFilters?: (IRelativeDateFilter | IAbsoluteDateFilter)[];
        limitingValidationItems?: ObjRef[];
        shouldIncludeLimitingFilters: boolean;
        limit?: number;
        setConnectedPlaceholderValue: (filter: IAttributeFilter) => void;
        onApply: OnApplyCallbackType;
        onChange: OnChangeCallbackType;
        resetOnParentFilterChange: boolean;
        selectionMode: DashboardAttributeFilterSelectionMode;
        shouldReloadElements: MutableRefObject<boolean>;
        setShouldReloadElements: (value: boolean) => void;
        displayAsLabel?: ObjRef;
        withoutApply: boolean;
        isSelectionInvalid: boolean;
        isTextMode: boolean;
        filterModeChanged?: boolean;
    },
    supportsKeepingDependentFiltersSelection: boolean,
    supportsCircularDependencyInFilters: boolean,
) {
    const {
        filter,
        limitingAttributeFilters,
        limitingDateFilters,
        limitingValidationItems = EMPTY_LIMITING_VALIDATION_ITEMS,
        shouldIncludeLimitingFilters,
        limit,
        resetOnParentFilterChange,
        setConnectedPlaceholderValue,
        onApply,
        onChange,
        selectionMode,
        shouldReloadElements,
        setShouldReloadElements,
        displayAsLabel,
        withoutApply,
        isSelectionInvalid,
        isTextMode,
        filterModeChanged,
    } = props;

    const prevIsTextModeRef = useRef(isTextMode);

    // Ref for isTextMode so the displayAsLabel sync effect can read it without
    // having it in its dependency array (avoids re-firing on mode switch).
    const isTextModeRef = useRef(isTextMode);
    isTextModeRef.current = isTextMode;

    useEffect(() => {
        if (shouldIncludeLimitingFilters && limitingAttributeFilters && limitingAttributeFilters.length > 0) {
            handler.setLimitingAttributeFilters(limitingAttributeFilters);
        }

        if (shouldIncludeLimitingFilters && limitingDateFilters && limitingDateFilters.length > 0) {
            handler.setLimitingDateFilters(limitingDateFilters);
        }

        if (shouldIncludeLimitingFilters && limitingValidationItems?.length > 0) {
            handler.setLimitingValidationItems(limitingValidationItems);
        }

        if (limit) {
            handler.setLimit(limit);
        }

        // Load elements on init. In text mode, elements are loaded lazily when the user types
        // (via onAutocompleteSearch), but we still need to init the handler for metadata.
        // Skip element loading in text mode to improve performance.
        handler.init(undefined, isTextMode);

        // Change of the parent filters is resolved in the useEffect below, it does not need full reinit.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [handler]);

    useEffect(() => {
        const limitingAttributesChanged =
            shouldIncludeLimitingFilters &&
            !isEqual(limitingAttributeFilters, handler.getLimitingAttributeFilters());

        const limitingDateFiltersChanged =
            shouldIncludeLimitingFilters && !isEqual(limitingDateFilters, handler.getLimitingDateFilters());

        const getFilterChanged = (filter: IAttributeFilter, handler: IMultiSelectAttributeFilterHandler) => {
            return (
                !areFiltersEqual(filter, handler.getFilter()) &&
                !areFiltersEqual(filter, handler.getFilterToDisplay())
            );
        };

        // When text→elements mode switch happens, resetForModeSwitch already committed "All" to the handler.
        // Suppress filterChanged so we don't override that reset with the stale filter prop (parent's
        // onChange may not have propagated yet, so filter can still hold the old list selection).
        const justSwitchedFromText = prevIsTextModeRef.current && !isTextMode;
        prevIsTextModeRef.current = isTextMode;

        const filterChanged =
            justSwitchedFromText || filterModeChanged ? false : getFilterChanged(filter, handler);

        const limitingValidationItemsChanged =
            shouldIncludeLimitingFilters &&
            !isEqual(limitingValidationItems, handler.getLimitingValidationItems());

        const updateProps: UpdateFilterProps = {
            filter: filter as IAttributeFilter,
            limitingAttributeFilters,
            limitingAttributesChanged,
            limitingDateFilters,
            limitingDateFiltersChanged,
            filterChanged,
            setConnectedPlaceholderValue,
            onApply,
            onChange,
            selectionMode,
            setShouldReloadElements,
            limitingValidationItems,
            limitingValidationItemsChanged,
            displayAsLabel,
            withoutApply,
            isSelectionInvalid,
        };

        let change = resetOnParentFilterChange
            ? updateAutomaticResettingFilter(handler, updateProps, supportsCircularDependencyInFilters)
            : updateNonResettingFilter(handler, updateProps, supportsKeepingDependentFiltersSelection);

        // Safety net: if elements were not loaded yet (e.g., backend init was interrupted),
        // trigger a full init when switching to elements mode so the list is populated.
        if (justSwitchedFromText) {
            change = "init-self";
        }

        refreshByType(
            handler,
            change,
            supportsKeepingDependentFiltersSelection,
            shouldReloadElements,
            setShouldReloadElements,
        );
    }, [
        filter,
        limitingAttributeFilters,
        limitingDateFilters,
        resetOnParentFilterChange,
        handler,
        onApply,
        onChange,
        setConnectedPlaceholderValue,
        selectionMode,
        supportsKeepingDependentFiltersSelection,
        supportsCircularDependencyInFilters,
        setShouldReloadElements,
        limitingValidationItems,
        displayAsLabel,
        shouldReloadElements,
        withoutApply,
        shouldIncludeLimitingFilters,
        isSelectionInvalid,
        isTextMode,
        filterModeChanged,
    ]);

    const isMountedRef = useRef(false);
    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        const originalFilter = handler.getOriginalFilter();
        const originalFilterRef = originalFilter ? filterObjRef(originalFilter) : undefined;
        const currentDisplayAsLabel = handler.getDisplayAsLabel();

        const isNotResettingToOrigin =
            currentDisplayAsLabel && !areObjRefsEqual(originalFilterRef, currentDisplayAsLabel);
        if (
            handler.getInitStatus() !== "loading" &&
            ((displayAsLabel && !currentDisplayAsLabel) ||
                (!displayAsLabel && isNotResettingToOrigin) ||
                (displayAsLabel &&
                    currentDisplayAsLabel &&
                    !areObjRefsEqual(displayAsLabel, currentDisplayAsLabel)))
        ) {
            const unsubscribe = handler.onLoadCustomElementsSuccess((params) => {
                if (params.correlation?.includes(DISPLAY_FORM_CHANGED_CORRELATION)) {
                    unsubscribe();
                    onChange?.(
                        handler.getFilter(),
                        handler.getCommittedSelection()?.isInverted ?? false,
                        selectionMode,
                        handler.getElementsByKey(handler.getWorkingSelection().keys),
                        displayAsLabel,
                        false,
                        { isSelectionInvalid },
                    );
                }
            });
            handler.setDisplayAsLabel(displayAsLabel);
            handler.init(DISPLAY_FORM_CHANGED_CORRELATION, isTextModeRef.current);
            return () => {
                if (!isMountedRef.current) {
                    unsubscribe();
                }
            };
        }
        return undefined;
    }, [handler, displayAsLabel, onChange, selectionMode, isSelectionInvalid]);
}

function useSingleSelectModeHandler(
    handler: IMultiSelectAttributeFilterHandler,
    props: {
        selectFirst: boolean;
        selectionMode: DashboardAttributeFilterSelectionMode;
        onApply: (applyRegardlessWithoutApplySetting?: boolean, applyToWorkingOnly?: boolean) => void;
        onSelect: (selectedItems: IAttributeElement[], isInverted: boolean) => void;
        withoutApply: boolean;
    },
) {
    const { selectFirst, selectionMode, onApply, onSelect, withoutApply } = props;
    const committedSelectionKeys = handler.getCommittedSelection().keys;
    const initialStatus = handler.getInitStatus();
    const elements = handler.getAllElements();
    const filter = handler.getFilter();

    useEffect(() => {
        if (
            selectFirst &&
            selectionMode === "single" &&
            (isEmpty(committedSelectionKeys) || committedSelectionKeys.length > 1) &&
            initialStatus === "success" &&
            !isEmpty(elements)
        ) {
            const keys = [elements[0].uri];

            handler.changeSelection({
                keys,
                isInverted: false,
                irrelevantKeys: [],
            });
            handler.commitSelection();
            onApply(true, false);
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
        onSelect,
        withoutApply,
    ]);
}

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

const useReportMigratedFilter = (
    handler: IMultiSelectAttributeFilterHandler,
    onFilterMigrated: (applyRegardlessWithoutApplySetting: boolean) => void,
    enableImmediateAttributeFilterDisplayAsLabelMigration: boolean,
) => {
    const initialLabel = useRef(handler.getDisplayAsLabel());
    const wasMigrationReported = useRef(false);
    const initStatus = handler.getInitStatus();

    const originalFilter = handler.getOriginalFilter();
    const originalFilterRef = originalFilter ? filterObjRef(originalFilter) : undefined;
    if (
        enableImmediateAttributeFilterDisplayAsLabelMigration &&
        !wasMigrationReported.current &&
        initStatus === "success" &&
        !areObjRefsEqual(initialLabel.current, handler.getDisplayAsLabel()) &&
        !areObjRefsEqual(originalFilterRef, filterObjRef(handler.getFilter()))
    ) {
        wasMigrationReported.current = true;
        onFilterMigrated(true);

        console.warn(
            "AttributeFilter: Filter label migration reported to filter's parent app. Original filter label:",
            filterObjRef(handler.getOriginalFilter()!),
            "new filter label:",
            filterObjRef(handler.getFilter()),
            "new filter displayAsLabel:",
            handler.getDisplayAsLabel(),
        );
    }
};

function useCallbacks(
    handler: IMultiSelectAttributeFilterHandler,
    props: {
        setConnectedPlaceholderValue: (filter: IAttributeFilter) => void;
        onApply: OnApplyCallbackType;
        onChange: OnChangeCallbackType;
        selectionMode: DashboardAttributeFilterSelectionMode;
        shouldReloadElements: MutableRefObject<boolean>;
        setShouldReloadElements: (value: boolean) => void;
        shouldIncludeLimitingFilters: boolean;
        setShouldIncludeLimitingFilters: (value: boolean) => void;
        limitingAttributeFilters: IElementsQueryAttributeFilter[];
        limitingDateFilters: (IRelativeDateFilter | IAbsoluteDateFilter)[];
        withoutApply: boolean;
        isSelectionInvalid: boolean;
        filter?: IAttributeFilter;
    },
    supportsShowingFilteredElements: boolean,
    supportsKeepingDependentFiltersSelection: boolean,
    enableImmediateAttributeFilterDisplayAsLabelMigration: boolean,
): CommonFilterControllerCallbacks & ElementsFilterControllerCallbacks {
    const {
        onApply: onApplyInputCallback,
        onChange: onChangeInputCallback,
        setConnectedPlaceholderValue,
        selectionMode,
        shouldReloadElements,
        setShouldReloadElements,
        shouldIncludeLimitingFilters,
        setShouldIncludeLimitingFilters,
        limitingAttributeFilters,
        limitingDateFilters,
        withoutApply,
        isSelectionInvalid,
        filter,
    } = props;

    const handlerState = useAttributeFilterHandlerState(handler);

    const onSelectionChange = useCallback(
        (
            onSelectionChangeInputCallback: OnApplyCallbackType | OnChangeCallbackType,
            isResultOfMigration: boolean,
            applyToWorkingOnly: boolean,
        ) => {
            const nextFilter = handler.getFilter();
            const isInverted = handler.getWorkingSelection()?.isInverted;
            const keys = handler.getWorkingSelection().keys;
            const isSelectionInvalid = (!isInverted && isEmpty(keys)) || keys.length > MAX_SELECTION_SIZE;

            const displayAsLabel = handler.getDisplayAsLabel();
            const { attribute } = handlerState;
            if (isPrimaryLabelUsed(nextFilter, attribute.data?.displayForms ?? [])) {
                onSelectionChangeInputCallback?.(
                    nextFilter,
                    isInverted,
                    selectionMode,
                    handler.getElementsByKey(keys),
                    displayAsLabel,
                    isResultOfMigration,
                    {
                        isSelectionInvalid,
                        applyToWorkingOnly,
                    },
                );
            } else {
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
                    handler.getElementsByKey(keys),
                    displayAsLabel,
                    true,
                    {
                        isSelectionInvalid,
                        applyToWorkingOnly,
                    },
                );
            }
        },
        [handler, handlerState, selectionMode],
    );

    const onSelect = useCallback(
        (selectedItems: IAttributeElement[], isInverted: boolean) => {
            const keys = selectedItems.map((item) => item.uri);
            const irrelevantKeysObj = selectionMode === "single" ? { irrelevantKeys: [] } : {};
            handler.changeSelection({ keys, isInverted, ...irrelevantKeysObj });

            if (withoutApply) {
                handler.commitSelection();
            }

            onSelectionChange(onChangeInputCallback, false, false);
        },
        [handler, selectionMode, onSelectionChange, onChangeInputCallback, withoutApply],
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
        } else if (isSelectionInvalid && withoutApply && isAttributeFilterWithSelection(filter)) {
            const workingElements = filterAttributeElements(filter)!;
            const workingKeys = isAttributeElementsByValue(workingElements)
                ? (workingElements.values ?? [])
                : (workingElements.uris ?? []);
            const isWorkingInverted = isNegativeAttributeFilter(filter);

            handler.changeSelection({
                keys: workingKeys,
                isInverted: isWorkingInverted,
            });
        }

        if (handler.getSearch().length > 0) {
            handler.setSearch("");
            handler.loadInitialElementsPage(RESET_CORRELATION);
        }

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
        isSelectionInvalid,
        filter,
    ]);

    const onApplyChanges = useCallback(
        (isResultOfMigration: boolean, applyToWorkingOnly: boolean) => {
            handler.commitSelection();
            setConnectedPlaceholderValue(handler.getFilter());
            onSelectionChange(onApplyInputCallback, isResultOfMigration, applyToWorkingOnly);
        },
        [handler, setConnectedPlaceholderValue, onSelectionChange, onApplyInputCallback],
    );

    const onApply = useCallback(
        (applyRegardlessWithoutApplySetting: boolean = false, applyToWorkingOnly: boolean = false) => {
            if (withoutApply && !applyRegardlessWithoutApplySetting) {
                return;
            }
            onApplyChanges(false, applyToWorkingOnly);
        },
        [withoutApply, onApplyChanges],
    );

    const onOpen = useCallback(() => {
        if (shouldReloadElements.current) {
            handler.loadInitialElementsPage(RESET_CORRELATION);
            if (!handler.isWorkingSelectionEmpty()) {
                handler.loadIrrelevantElements(IRRELEVANT_SELECTION);
            }
            setShouldReloadElements(false);
        }
    }, [handler, shouldReloadElements, setShouldReloadElements]);

    const onShowFilteredElements = useCallback(() => {
        if (supportsShowingFilteredElements) {
            setShouldIncludeLimitingFilters(false);
            handler.changeSelection({
                ...handler.getWorkingSelection(),
                irrelevantKeys: [],
            });
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
                workingSelection.irrelevantKeys ?? [],
            );

            handler.changeSelection({
                ...workingSelection,
                keys: sanitizedWorkingSelectionKeys,
                irrelevantKeys: [],
            });
        }
    }, [handler, supportsKeepingDependentFiltersSelection, supportsShowingFilteredElements]);

    const onFilterMigrated = useCallback(() => onApplyChanges(true, false), [onApplyChanges]);
    useReportMigratedFilter(handler, onFilterMigrated, enableImmediateAttributeFilterDisplayAsLabelMigration);

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

/**
 * Props for useElementsFilterController.
 * @internal
 */
export interface IElementsFilterControllerProps {
    backend: IAnalyticalBackend;
    workspace: string;
    filter: IAttributeFilter;
    displayAsLabel?: ObjRef;
    limitingAttributeFilters?: IElementsQueryAttributeFilter[] | null;
    limitingDateFilters?: (IRelativeDateFilter | IAbsoluteDateFilter)[] | null;
    limitingValidationItems?: ObjRef[];
    resetOnParentFilterChange?: boolean;
    onApply?: OnApplyCallbackType;
    onChange?: OnChangeCallbackType;
    onError?: (error: GoodDataSdkError) => void;
    onInitLoadingChanged?: (loading: boolean, attributeMetadata?: IAttributeMetadataObject) => void;
    hiddenElements?: string[];
    staticElements?: IAttributeElement[];
    elementsOptions?: { limit: number };
    selectionMode: DashboardAttributeFilterSelectionMode;
    selectFirst?: boolean;
    withoutApply?: boolean;
    enableImmediateAttributeFilterDisplayAsLabelMigration?: boolean;
    supportsKeepingDependentFiltersSelection: boolean;
    supportsCircularDependencyInFilters: boolean;
    supportsShowingFilteredElements: boolean;
    supportsSingleSelectDependentFilters: boolean;
    setConnectedPlaceholderValue: (filter: IAttributeFilter) => void;
    /** Used internally to determine if elements controller runs in text-mode context (empty filter). */
    currentFilterMode: "elements" | "text";
    /** When true, parent filter is text mode but we display elements - filters differ, Apply should be enabled. */
    filterModeChanged?: boolean;
}

/**
 * Elements filter mode controller.
 * Handles all elements-specific logic (loading, selection, callbacks).
 *
 * @internal
 */
export function useElementsFilterController(props: IElementsFilterControllerProps): ElementsFilterController {
    const {
        backend,
        workspace,
        filter,
        displayAsLabel,
        limitingAttributeFilters,
        limitingDateFilters,
        limitingValidationItems,
        resetOnParentFilterChange = true,
        onApply,
        onChange,
        onError,
        onInitLoadingChanged,
        hiddenElements,
        staticElements,
        elementsOptions,
        selectionMode,
        selectFirst = false,
        withoutApply = false,
        enableImmediateAttributeFilterDisplayAsLabelMigration = false,
        supportsKeepingDependentFiltersSelection,
        supportsCircularDependencyInFilters,
        supportsShowingFilteredElements,
        supportsSingleSelectDependentFilters,
        setConnectedPlaceholderValue,
        currentFilterMode,
        filterModeChanged = false,
    } = props;

    const isTextMode = currentFilterMode === "text";

    const shouldReloadElements = useRef<boolean>(false);
    const setShouldReloadElements = useCallback(
        (value: boolean) => {
            if (!supportsKeepingDependentFiltersSelection || !supportsCircularDependencyInFilters) {
                return;
            }
            shouldReloadElements.current = value;
        },
        [supportsCircularDependencyInFilters, supportsKeepingDependentFiltersSelection],
    );
    const { shouldIncludeLimitingFilters, setShouldIncludeLimitingFilters } = useShouldIncludeLimitingFilters(
        supportsShowingFilteredElements ?? false,
    );

    const handler = useAttributeFilterHandler({
        backend,
        filter,
        workspace,
        hiddenElements,
        staticElements,
        displayAsLabel,
        withoutApply,
    });

    const attributeFilterControllerData = useAttributeFilterControllerData(
        handler!,
        supportsShowingFilteredElements!,
        shouldIncludeLimitingFilters,
    );

    const isWorkingSelectionChanged =
        attributeFilterControllerData.isWorkingSelectionChanged || filterModeChanged;

    useOnError(handler!, { onError });
    useOnInitLoadingChanged(handler!, {
        onInitLoadingChanged,
    });
    useInitOrReload(
        handler!,
        {
            filter,
            limitingAttributeFilters: limitingAttributeFilters ?? undefined,
            limitingDateFilters: limitingDateFilters ?? undefined,
            limitingValidationItems,
            shouldIncludeLimitingFilters,
            limit: elementsOptions?.limit,
            onApply: onApply ?? (() => {}),
            onChange: onChange ?? (() => {}),
            setConnectedPlaceholderValue,
            resetOnParentFilterChange,
            selectionMode,
            shouldReloadElements,
            setShouldReloadElements,
            displayAsLabel,
            withoutApply,
            isSelectionInvalid: (withoutApply ?? false) && attributeFilterControllerData.isSelectionInvalid,
            isTextMode,
            filterModeChanged,
        },
        supportsKeepingDependentFiltersSelection ?? false,
        supportsCircularDependencyInFilters ?? false,
    );
    const setDisplayForm = useCallback(
        (displayFormRef: ObjRef) => {
            if (areObjRefsEqual(displayFormRef, handler!.getDisplayAsLabel())) {
                return;
            }
            // For elements mode: only set displayAsLabel (filter must use primary display form)
            handler!.setDisplayAsLabel(displayFormRef);
            handler!.init(DISPLAY_FORM_CHANGED_CORRELATION, isTextMode);
        },
        [handler, isTextMode],
    );

    const resetForModeSwitch = useCallback(
        (newFilter: IAttributeFilter, newDisplayAsLabel?: ObjRef) => {
            // we are always resetting to ALL filter
            if (!handler || !isNegativeAttributeFilter(newFilter)) {
                return;
            }
            const displayFormRef = filterObjRef(newFilter);
            handler.setDisplayForm(displayFormRef);
            if (newDisplayAsLabel) {
                handler.setDisplayAsLabel(newDisplayAsLabel);
            }
            handler.setSearch("");
            handler.changeSelection({ keys: [], isInverted: true });
            withoutApply && handler.commitSelection();
        },
        [handler, withoutApply],
    );

    const callbacks = useCallbacks(
        handler!,
        {
            onApply: onApply ?? (() => {}),
            onChange: onChange ?? (() => {}),
            setConnectedPlaceholderValue,
            selectionMode,
            shouldReloadElements,
            setShouldReloadElements,
            shouldIncludeLimitingFilters,
            setShouldIncludeLimitingFilters,
            limitingAttributeFilters: limitingAttributeFilters ?? [],
            limitingDateFilters: limitingDateFilters ?? [],
            withoutApply,
            isSelectionInvalid: attributeFilterControllerData.isSelectionInvalid,
            filter,
        },
        supportsShowingFilteredElements ?? false,
        supportsKeepingDependentFiltersSelection ?? false,
        enableImmediateAttributeFilterDisplayAsLabelMigration,
    );

    useSingleSelectModeHandler(handler!, {
        selectFirst,
        onApply: callbacks.onApply,
        onSelect: callbacks.onSelect,
        selectionMode,
        withoutApply,
    });

    const forcedInitErrorProp = isValidSingleSelectionFilter(
        selectionMode,
        filter,
        limitingAttributeFilters ?? [],
        supportsSingleSelectDependentFilters ?? false,
    )
        ? {}
        : { initError: new UnexpectedSdkError() };

    return {
        ...attributeFilterControllerData,
        isWorkingSelectionChanged,
        isApplyDisabled: attributeFilterControllerData.isSelectionInvalid || !isWorkingSelectionChanged,
        ...callbacks,
        ...forcedInitErrorProp,
        setDisplayForm,
        resetForModeSwitch,
    };
}
