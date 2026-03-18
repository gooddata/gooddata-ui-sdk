// (C) 2022-2026 GoodData Corporation

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import noop from "lodash-es/noop.js";
import { invariant } from "ts-invariant";

import {
    type IAttributeFilter,
    type ObjRef,
    areObjRefsEqual,
    filterLocalIdentifier,
    filterObjRef,
    isArbitraryAttributeFilter,
    isMatchAttributeFilter,
    isNegativeFilter,
} from "@gooddata/sdk-model";
import { useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";

import { type AttributeFilterController } from "./types.js";
import { useElementsFilterController } from "./useElementsFilterController.js";
import { useFilterDetailRequestHandler } from "./useFilterDetailRequestHandler.js";
import { useResolveDependentDateFiltersInput } from "./useResolveDependentDateFiltersInput.js";
import { useResolveFilterInput } from "./useResolveFilterInput.js";
import { useResolveParentFiltersInput } from "./useResolveParentFiltersInput.js";
import { useTextFilterController } from "./useTextFilterController.js";
import { type ITextFilterState } from "./useTextFilterInnerController.js";
import { type AttributeFilterAvailableMode, type AttributeFilterMode } from "../filterModeTypes.js";
import {
    createEmptyFilterForAvailableMode,
    createEmptyFilterForMode,
    getAvailableTextModes,
    getFilterModeFromFilter,
    mapAvailableModesToInternal,
} from "../filterModeUtils.js";
import { createFilterFromOperator, isArbitraryOperator } from "../textFilterOperatorUtils.js";
import {
    type IAttributeFilterCoreProps,
    type OnApplyCallbackType,
    type OnChangeCallbackType,
} from "../types.js";

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

const NOOP_ON_APPLY: OnApplyCallbackType = () => {};
const NOOP_ON_CHANGE: OnChangeCallbackType = () => {};
const DEFAULT_AVAILABLE_FILTER_MODES: AttributeFilterAvailableMode[] = ["elements"];

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
        workingFilter,
        connectToPlaceholder,
        parentFilters,
        dependentDateFilters,
        parentFilterOverAttribute,
        validateElementsBy,
        resetOnParentFilterChange = true,
        onApply,
        onChange,
        onError,
        onInitLoadingChanged,
        hiddenElements,
        staticElements,

        elementsOptions,

        displayAsLabel,

        selectionMode = "multi",
        selectFirst = false,
        enableImmediateAttributeFilterDisplayAsLabelMigration = false,
        withoutApply = false,
        availableFilterModes = DEFAULT_AVAILABLE_FILTER_MODES,
    } = props;

    const backend = useBackendStrict(backendInput, "AttributeFilter");
    const workspace = useWorkspaceStrict(workspaceInput, "AttributeFilter");

    const supportsSettingConnectingAttributes = backend.capabilities.supportsSettingConnectingAttributes;
    const supportsKeepingDependentFiltersSelection =
        backend.capabilities.supportsKeepingDependentFiltersSelection;
    const supportsCircularDependencyInFilters = backend.capabilities.supportsCircularDependencyInFilters;
    const supportsShowingFilteredElements = backend.capabilities.supportsShowingFilteredElements;
    const supportsSingleSelectDependentFilters = backend.capabilities.supportsSingleSelectDependentFilters;

    const { filter: resolvedFilter, setConnectedPlaceholderValue } = useResolveFilterInput(
        filterInput ?? workingFilter,
        connectToPlaceholder,
    );

    const [filterMode, setFilterMode] = useState<AttributeFilterMode>(
        () => getFilterModeFromFilter(resolvedFilter) ?? "elements",
    );
    useEffect(() => {
        setFilterMode(getFilterModeFromFilter(resolvedFilter) ?? "elements");
    }, [resolvedFilter]);

    const isTextMode = filterMode === "text";

    const originalFilterMode = getFilterModeFromFilter(resolvedFilter);
    const filterModeChanged = originalFilterMode !== filterMode;

    // The display form from the filter definition itself. For elements filters this is
    // always the primary label. For text filters it is whatever label the text filter uses.
    const resolvedDisplayFormRef = (resolvedFilter && filterObjRef(resolvedFilter)) ?? displayAsLabel;
    invariant(
        resolvedDisplayFormRef,
        "AttributeFilter: filter's displayForm must be defined. Provide a filter with displayForm or displayAsLabel prop.",
    );

    const originalIsTextFilter =
        resolvedFilter &&
        (isArbitraryAttributeFilter(resolvedFilter) || isMatchAttributeFilter(resolvedFilter));

    // ─── Single source of truth for display form ───────────────────────
    // Tracks the user-selected display form (via header menu or displayAsLabel prop).
    // In elements mode: passed as displayAsLabel to handler (for showing element values in UI).
    // In text mode: used as displayForm in text filter construction.
    // Persists across mode switches — no shuffling needed.
    // When undefined, effectiveDisplayFormRef falls back to resolvedDisplayFormRef.
    const [userSelectedDisplayForm, setUserSelectedDisplayForm] = useState<ObjRef | undefined>(
        displayAsLabel,
    );

    // Sync from external prop changes (controlled mode).
    // Uses render-phase state update (React-supported pattern) instead of useEffect
    // to avoid a one-render lag. The lag caused stale displayAsLabel values to be passed
    // to the elements controller when both displayAsLabel and limitingAttributeFilters
    // changed in the same render (e.g., after auto-migration + parent filter add).
    const prevDisplayAsLabelRef = useRef<ObjRef | undefined>(displayAsLabel);
    if (!areObjRefsEqual(displayAsLabel, prevDisplayAsLabelRef.current)) {
        prevDisplayAsLabelRef.current = displayAsLabel;
        setUserSelectedDisplayForm(displayAsLabel);
    }

    // Effective display form: user's selection with fallback to primary.
    // - In text mode: becomes the text filter's displayForm
    // - In elements mode: becomes displayAsLabel for the handler
    // - In onApply/onChange: passed as the displayAsLabel parameter
    const effectiveDisplayFormRef = userSelectedDisplayForm ?? resolvedDisplayFormRef;

    // Memoized to keep a stable reference so useInitOrReload does not re-run (and reset the
    // committed selection) on every re-render triggered by handler.commitSelection().
    const elementsModeFilter = useMemo(
        (): IAttributeFilter =>
            (!resolvedFilter || originalIsTextFilter
                ? createEmptyFilterForMode("elements", resolvedDisplayFormRef)
                : resolvedFilter) as IAttributeFilter,
        [resolvedFilter, originalIsTextFilter, resolvedDisplayFormRef],
    );

    const effectiveOnApply = isTextMode ? NOOP_ON_APPLY : (onApply ?? NOOP_ON_APPLY);
    const effectiveOnChange = isTextMode
        ? connectToPlaceholder
            ? (((filter: IAttributeFilter) => setConnectedPlaceholderValue(filter)) as OnChangeCallbackType)
            : NOOP_ON_CHANGE
        : (onChange ?? NOOP_ON_CHANGE);
    const effectiveOnError = isTextMode ? undefined : onError;
    const effectiveOnInitLoadingChanged = isTextMode ? undefined : onInitLoadingChanged;

    const filterDetailRequestHandler = useFilterDetailRequestHandler(backend, workspace);

    const limitingAttributeFilters = useResolveParentFiltersInput(
        parentFilters,
        parentFilterOverAttribute,
        supportsSettingConnectingAttributes,
    );

    const limitingDateFilters = useResolveDependentDateFiltersInput(dependentDateFilters);

    const availableInternalFilterModes = mapAvailableModesToInternal(availableFilterModes);
    const availableTextFilterModes = getAvailableTextModes(availableFilterModes);

    const localId = resolvedFilter ? filterLocalIdentifier(resolvedFilter) : undefined;

    // When the original filter is a text filter, the elements controller gets a synthetic
    // elements filter whose displayForm is the text filter's label (non-primary).
    // Don't also pass it as displayAsLabel — the handler would see both as non-primary
    // and log an error. Let the handler discover the primary and migrate on its own.
    const elementsDisplayAsLabel = originalIsTextFilter ? undefined : userSelectedDisplayForm;

    // Elements filter controller runs first to provide handler/attribute data for text mode
    const elementsFilterController = useElementsFilterController({
        backend,
        workspace,
        filter: elementsModeFilter,
        displayAsLabel: elementsDisplayAsLabel,
        limitingAttributeFilters,
        limitingDateFilters,
        limitingValidationItems: validateElementsBy,
        resetOnParentFilterChange,
        onApply: effectiveOnApply,
        onChange: effectiveOnChange,
        onError: effectiveOnError,
        onInitLoadingChanged: effectiveOnInitLoadingChanged,
        hiddenElements,
        staticElements,
        elementsOptions,
        selectionMode,
        selectFirst,
        withoutApply,
        enableImmediateAttributeFilterDisplayAsLabelMigration,
        supportsKeepingDependentFiltersSelection: supportsKeepingDependentFiltersSelection ?? false,
        supportsCircularDependencyInFilters: supportsCircularDependencyInFilters ?? false,
        supportsShowingFilteredElements: supportsShowingFilteredElements ?? false,
        supportsSingleSelectDependentFilters: supportsSingleSelectDependentFilters ?? false,
        setConnectedPlaceholderValue,
        currentFilterMode: filterMode,
        filterModeChanged,
    });

    // ─── Text state change handler ─────────────────────────────────────
    // Root constructs filters from text controller's raw state + root's display form.
    const onTextStateChange = useCallback(
        (state: ITextFilterState) => {
            const valuesOrLiteral = isArbitraryOperator(state.operator) ? state.values : state.literal;
            const nextFilter = createFilterFromOperator(
                state.operator,
                valuesOrLiteral,
                effectiveDisplayFormRef,
                localId,
                state.caseSensitive,
            );
            const isInverted = isArbitraryAttributeFilter(nextFilter)
                ? (nextFilter.arbitraryAttributeFilter.negativeSelection ?? false)
                : false;

            // When withoutApply=false, do NOT update the placeholder on every working change.
            // That would flow back via resolvedFilter → textModeFilter → syncFromFilter (with
            // updateCommitted=true), auto-committing working state and disabling the Apply button.
            // The placeholder is updated on Apply click instead (see onApplyTextFilter).
            if (connectToPlaceholder && withoutApply) {
                setConnectedPlaceholderValue(nextFilter);
            }
            onChange?.(nextFilter, isInverted, selectionMode, [], effectiveDisplayFormRef, false, {});
        },
        [
            effectiveDisplayFormRef,
            localId,
            connectToPlaceholder,
            withoutApply,
            setConnectedPlaceholderValue,
            onChange,
            selectionMode,
        ],
    );

    // Stable text filter for the text controller.
    // When the source is a text filter, use it directly.
    // Otherwise, create an empty text filter only on mode switch — not on displayFormRef changes,
    // so that changing the display form in text mode does not reset operator/values.
    //
    // Cache is cleared when leaving text mode so that re-entering creates a fresh filter.
    // While in text mode, the cached filter is returned even if effectiveDisplayFormRef changes.
    // State (not ref) is used so we never mutate during render — React requires render-phase purity.
    const [cachedTextModeFilter, setCachedTextModeFilter] = useState<IAttributeFilter | null>(null);

    const textModeFilter = useMemo(() => {
        if (originalIsTextFilter && resolvedFilter) {
            return resolvedFilter;
        }
        if (!isTextMode) {
            return createEmptyFilterForMode("text", effectiveDisplayFormRef, localId);
        }
        if (cachedTextModeFilter) {
            return cachedTextModeFilter;
        }
        return createEmptyFilterForMode("text", effectiveDisplayFormRef, localId);
    }, [
        isTextMode,
        originalIsTextFilter,
        resolvedFilter,
        effectiveDisplayFormRef,
        localId,
        cachedTextModeFilter,
    ]);

    // Sync cache in effect — never mutate during render (React purity rules).
    useEffect(() => {
        if (!isTextMode) {
            setCachedTextModeFilter(null);
            return;
        }
        if (originalIsTextFilter && resolvedFilter) {
            return;
        }
        setCachedTextModeFilter(
            (prev) => prev ?? createEmptyFilterForMode("text", effectiveDisplayFormRef, localId),
        );
    }, [isTextMode, originalIsTextFilter, resolvedFilter, effectiveDisplayFormRef, localId]);

    const textFilterController = useTextFilterController({
        isTextMode,
        backend,
        workspace,
        filterInput: textModeFilter,
        onTextStateChange,
        availableFilterModes,
        filterModeChanged,
    });

    const { resetForModeSwitch: textResetForModeSwitchFn } = textFilterController;
    const textResetForModeSwitch = useCallback(
        (newFilter: IAttributeFilter) => {
            textResetForModeSwitchFn?.(newFilter);
        },
        [textResetForModeSwitchFn],
    );
    const { resetForModeSwitch: elementsResetForModeSwitchFn } = elementsFilterController;
    const elementsResetForModeSwitch = useCallback(
        (newFilter: IAttributeFilter, newDisplayAsLabel?: ObjRef) => {
            elementsResetForModeSwitchFn?.(newFilter, newDisplayAsLabel);
        },
        [elementsResetForModeSwitchFn],
    );

    const handleFilterModeChange = useCallback(
        (
            newFilter: IAttributeFilter | undefined,
            newDisplayAsLabel: ObjRef | undefined,
            previousMode: AttributeFilterMode,
            nextMode: AttributeFilterMode,
        ) => {
            if (newFilter) {
                if (connectToPlaceholder) {
                    setConnectedPlaceholderValue(newFilter);
                } else {
                    if (previousMode === nextMode) {
                        return;
                    }
                    setFilterMode(nextMode);

                    if (nextMode === "elements") {
                        elementsResetForModeSwitch(newFilter, newDisplayAsLabel);
                    } else {
                        textResetForModeSwitch(newFilter);
                    }
                }
                // onChange covers all filter changes including mode switch reset
                const isInverted = isNegativeFilter(newFilter);
                onChange?.(newFilter, isInverted, selectionMode, [], filterObjRef(newFilter), false, {});
            }
        },
        [
            connectToPlaceholder,
            onChange,
            selectionMode,
            setConnectedPlaceholderValue,
            elementsResetForModeSwitch,
            textResetForModeSwitch,
        ],
    );

    const { currentDisplayFormRef: elementsCurrentDisplayFormRef } = elementsFilterController;
    const onFilterModeChangeForControllers = useCallback(
        (newMode: AttributeFilterMode) => {
            if (!resolvedDisplayFormRef) {
                return;
            }
            let nextAvailableMode: AttributeFilterAvailableMode = "elements";

            if (newMode === filterMode) {
                return;
            }

            if (newMode === "text") {
                if (availableTextFilterModes.includes("arbitrary")) {
                    nextAvailableMode = "arbitrary";
                } else {
                    nextAvailableMode = "match";
                }
            }

            // Use root's userSelectedDisplayForm — no need to shuffle between controllers.
            const displayFormForNewFilter =
                newMode === "text"
                    ? (userSelectedDisplayForm ?? elementsCurrentDisplayFormRef)
                    : elementsCurrentDisplayFormRef;

            const displayAsDisplayFormForNewFilter = newMode === "text" ? undefined : userSelectedDisplayForm;

            const newFilter = createEmptyFilterForAvailableMode(
                nextAvailableMode,
                displayFormForNewFilter,
                localId,
            );
            handleFilterModeChange(newFilter, displayAsDisplayFormForNewFilter, filterMode, newMode);
        },
        [
            availableTextFilterModes,
            filterMode,
            handleFilterModeChange,
            localId,
            userSelectedDisplayForm,
            elementsCurrentDisplayFormRef,
            resolvedDisplayFormRef,
        ],
    );

    const {
        textFilterOperator,
        textFilterValues,
        textFilterLiteral,
        textFilterCaseSensitive,
        onCommitTextFilter,
        isApplyDisabled: isTextApplyDisabled,
    } = textFilterController;
    const onApplyTextFilter = useCallback(
        (applyRegardlessWithoutApplySetting: boolean = false, _applyToWorkingOnly: boolean = false) => {
            if (withoutApply && !applyRegardlessWithoutApplySetting) {
                return;
            }
            const valuesOrLiteral = isArbitraryOperator(textFilterOperator)
                ? (textFilterValues ?? [])
                : (textFilterLiteral ?? "").trim();
            const caseSensitive = textFilterCaseSensitive ?? false;
            const nextFilter = createFilterFromOperator(
                textFilterOperator,
                valuesOrLiteral,
                effectiveDisplayFormRef,
                localId,
                caseSensitive,
            );
            onCommitTextFilter?.();
            if (connectToPlaceholder) {
                setConnectedPlaceholderValue(nextFilter);
            }
            onApply?.(nextFilter, false, selectionMode, [], effectiveDisplayFormRef, false, {
                isSelectionInvalid: isTextApplyDisabled,
                applyToWorkingOnly: _applyToWorkingOnly,
            });
        },
        [
            localId,
            connectToPlaceholder,
            onApply,
            effectiveDisplayFormRef,
            selectionMode,
            setConnectedPlaceholderValue,
            textFilterOperator,
            textFilterValues,
            textFilterLiteral,
            textFilterCaseSensitive,
            onCommitTextFilter,
            isTextApplyDisabled,
            withoutApply,
        ],
    );

    // ─── Unified setDisplayForm ────────────────────────────────────────
    // Updates root state and propagates to elements handler + text controller.
    const { setDisplayForm: setElementsDisplayForm } = elementsFilterController;
    const { onResetForDisplayFormChange: onTextResetForDisplayFormChange } = textFilterController;
    const setDisplayForm = useCallback(
        (newDisplayFormRef: ObjRef) => {
            setUserSelectedDisplayForm(newDisplayFormRef);
            // Propagate to elements handler (for autocomplete sync and handler state)
            setElementsDisplayForm?.(newDisplayFormRef);
            // Reset text controller's values for display form change
            onTextResetForDisplayFormChange?.(newDisplayFormRef);
        },
        [setElementsDisplayForm, onTextResetForDisplayFormChange],
    );

    // Reconstruct committed filter from text controller's committed state + root's display form.
    // This is needed for the button subtitle in non-withoutApply mode.
    const textFilterCommittedFilter = useMemo(() => {
        const committed = textFilterController.committedState;
        if (!committed) {
            return undefined;
        }
        const valuesOrLiteral = isArbitraryOperator(committed.operator)
            ? committed.values
            : committed.literal;
        return createFilterFromOperator(
            committed.operator,
            valuesOrLiteral,
            effectiveDisplayFormRef,
            localId,
            committed.caseSensitive,
        );
    }, [textFilterController.committedState, effectiveDisplayFormRef, localId]);

    if (isTextMode) {
        return {
            attribute: elementsFilterController.attribute,
            displayForms: elementsFilterController.displayForms,
            isInitializing: elementsFilterController.isInitializing,
            initError: elementsFilterController.initError,
            currentDisplayFormRef: effectiveDisplayFormRef,
            isFiltering: false,
            isSelectionInvalid: textFilterController.isTextFilterInvalid,
            isApplyDisabled: textFilterController.isApplyDisabled,
            isWorkingSelectionChanged: textFilterController.isWorkingSelectionChanged,
            textFilterOperator: textFilterController.textFilterOperator,
            textFilterValues: textFilterController.textFilterValues,
            textFilterLiteral: textFilterController.textFilterLiteral,
            textFilterLiteralEmptyError: textFilterController.textFilterLiteralEmptyError,
            textFilterValuesEmptyError: textFilterController.textFilterValuesEmptyError,
            textFilterValuesLimitReachedWarning: textFilterController.textFilterValuesLimitReachedWarning,
            textFilterValuesLimitExceededError: textFilterController.textFilterValuesLimitExceededError,
            textFilterCaseSensitive: textFilterController.textFilterCaseSensitive,
            textFilterCommittedFilter,
            onTextFilterOperatorChange: textFilterController.onTextFilterOperatorChange,
            onTextFilterValuesChange: textFilterController.onTextFilterValuesChange,
            onTextFilterValuesBlur: textFilterController.onTextFilterValuesBlur,
            onTextFilterLiteralChange: textFilterController.onTextFilterLiteralChange,
            onTextFilterLiteralBlur: textFilterController.onTextFilterLiteralBlur,
            onToggleTextFilterCaseSensitive: textFilterController.onToggleTextFilterCaseSensitive,
            onApply: onApplyTextFilter,
            onReset: textFilterController.onReset ?? noop,
            filterDetailRequestHandler,
            setDisplayForm,
            resetForModeSwitch: textFilterController.resetForModeSwitch ?? noop,
            onFilterModeChange:
                availableInternalFilterModes.length > 1 ? onFilterModeChangeForControllers : undefined,
            currentFilterMode: filterMode,
            availableInternalFilterModes,
            availableTextFilterModes,
            offset: 0,
            limit: 0,
            isLoadingInitialElementsPage: elementsFilterController.isLoadingInitialElementsPage,
            isLoadingNextElementsPage: false,
            nextElementsPageSize: 0,
            // Expose loaded elements in text mode so autocomplete suggestions are available.
            elements: elementsFilterController.elements,
            totalElementsCount: undefined,
            totalElementsCountWithCurrentSettings: undefined,
            isWorkingSelectionInverted: false,
            workingSelectionElements: [],
            isCommittedSelectionInverted: false,
            committedSelectionElements: [],
            searchString: elementsFilterController.searchString,
            isFilteredByParentFilters: false,
            parentFilterAttributes: [],
            onLoadNextElementsPage: noop,
            // Expose onSearch in text mode for autocomplete lazy loading
            onSearch: elementsFilterController.onSearch,
            onSelect: noop,
            onOpen: noop,
            onShowFilteredElements: noop,
            onClearIrrelevantSelection: noop,
        };
    }

    return {
        ...elementsFilterController,
        filterDetailRequestHandler,
        // Override elements controller's setDisplayForm with root's unified version
        // so header menu changes in elements mode also update userSelectedDisplayForm.
        setDisplayForm,
        currentFilterMode: filterMode,
        availableInternalFilterModes,
        availableTextFilterModes,
        onFilterModeChange:
            availableInternalFilterModes.length > 1 ? onFilterModeChangeForControllers : undefined,
    };
};
