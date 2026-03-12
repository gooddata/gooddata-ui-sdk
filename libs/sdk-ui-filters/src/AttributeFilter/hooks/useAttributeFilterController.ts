// (C) 2022-2026 GoodData Corporation

import { useCallback, useEffect, useMemo, useState } from "react";

import noop from "lodash-es/noop.js";
import { invariant } from "ts-invariant";

import {
    type IAttributeFilter,
    type ObjRef,
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
        availableFilterModes = ["elements"],
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

    const resolvedDisplayFormRef = (resolvedFilter && filterObjRef(resolvedFilter)) ?? displayAsLabel;
    invariant(
        resolvedDisplayFormRef,
        "AttributeFilter: filter's displayForm must be defined. Provide a filter with displayForm or displayAsLabel prop.",
    );

    const originalIsTextFilter =
        resolvedFilter &&
        (isArbitraryAttributeFilter(resolvedFilter) || isMatchAttributeFilter(resolvedFilter));
    // Memoized to keep a stable reference so useInitOrReload does not re-run (and reset the
    // committed selection) on every re-render triggered by handler.commitSelection().
    const elementsModeFilter = useMemo(
        (): IAttributeFilter =>
            (!resolvedFilter || originalIsTextFilter
                ? createEmptyFilterForMode("elements", resolvedDisplayFormRef)
                : resolvedFilter) as IAttributeFilter,
        [resolvedFilter, originalIsTextFilter, resolvedDisplayFormRef],
    );

    const elementsModeDisplayAsLabel =
        displayAsLabel ?? (originalIsTextFilter ? resolvedFilter && filterObjRef(resolvedFilter) : undefined);

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

    // Elements filter controller runs first to provide handler/attribute data for text mode
    const elementsFilterController = useElementsFilterController({
        backend,
        workspace,
        filter: elementsModeFilter,
        displayAsLabel: elementsModeDisplayAsLabel,
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

    // Text mode controller uses attribute data from elements controller (handler).
    const textFilterController = useTextFilterController({
        isTextMode,
        backend,
        workspace,
        filterInput: resolvedFilter!,
        displayAsLabel: elementsModeDisplayAsLabel,
        onChange,
        withoutApply: withoutApply ?? false,
        selectionMode,
        availableFilterModes,
        filterModeChanged,
    });

    const textResetForModeSwitch = useCallback(
        (newFilter: IAttributeFilter) => {
            textFilterController.resetForModeSwitch?.(newFilter);
        },
        [textFilterController],
    );
    const elementsResetForModeSwitch = useCallback(
        (newFilter: IAttributeFilter, newDisplayAsLabel?: ObjRef) => {
            elementsFilterController.resetForModeSwitch?.(newFilter, newDisplayAsLabel);
        },
        [elementsFilterController],
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

            const displayFormForNewFilter =
                newMode === "text"
                    ? (elementsFilterController.currentDisplayAsDisplayFormRef ??
                      elementsFilterController.currentDisplayFormRef)
                    : elementsFilterController.currentDisplayFormRef;

            const displayAsDisplayFormForNewFilter =
                newMode === "text" ? undefined : textFilterController.currentDisplayFormRef;

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
            elementsFilterController.currentDisplayAsDisplayFormRef,
            elementsFilterController.currentDisplayFormRef,
            textFilterController.currentDisplayFormRef,
            resolvedDisplayFormRef,
        ],
    );

    const onApplyTextFilter = useCallback(
        (applyRegardlessWithoutApplySetting: boolean = false, _applyToWorkingOnly: boolean = false) => {
            if (withoutApply && !applyRegardlessWithoutApplySetting) {
                return;
            }
            const valuesOrLiteral = isArbitraryOperator(textFilterController.textFilterOperator)
                ? (textFilterController.textFilterValues ?? [])
                : (textFilterController.textFilterLiteral ?? "").trim();
            const caseSensitive = textFilterController.textFilterCaseSensitive ?? false;
            const displayFormRef =
                textFilterController.currentDisplayFormRef ??
                (resolvedFilter && filterObjRef(resolvedFilter)) ??
                resolvedDisplayFormRef;
            const nextFilter = createFilterFromOperator(
                textFilterController.textFilterOperator,
                valuesOrLiteral,
                displayFormRef,
                localId,
                caseSensitive,
            );
            textFilterController.onCommitTextFilter?.();
            onApply?.(nextFilter, false, selectionMode, [], displayFormRef, false, {
                isSelectionInvalid: textFilterController.isApplyDisabled,
                applyToWorkingOnly: _applyToWorkingOnly,
            });
        },
        [
            localId,
            onApply,
            resolvedFilter,
            resolvedDisplayFormRef,
            selectionMode,
            textFilterController,
            withoutApply,
        ],
    );

    // Wrap text filter's setDisplayForm so it also propagates the new display form
    // to the elements controller's displayAsLabel, keeping autocomplete (onSearch) in sync.
    const { setDisplayForm: setTextDisplayForm } = textFilterController;
    const { setDisplayForm: setElementsDisplayForm } = elementsFilterController;
    const setDisplayFormForTextMode = useCallback(
        (newDisplayFormRef: ObjRef) => {
            setTextDisplayForm?.(newDisplayFormRef);
            setElementsDisplayForm?.(newDisplayFormRef);
        },
        [setTextDisplayForm, setElementsDisplayForm],
    );

    if (isTextMode) {
        return {
            attribute: elementsFilterController.attribute,
            displayForms: elementsFilterController.displayForms,
            isInitializing: elementsFilterController.isInitializing,
            initError: elementsFilterController.initError,
            currentDisplayFormRef: textFilterController.currentDisplayFormRef,
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
            textFilterCommittedFilter: textFilterController.textFilterCommittedFilter,
            onTextFilterOperatorChange: textFilterController.onTextFilterOperatorChange,
            onTextFilterValuesChange: textFilterController.onTextFilterValuesChange,
            onTextFilterValuesBlur: textFilterController.onTextFilterValuesBlur,
            onTextFilterLiteralChange: textFilterController.onTextFilterLiteralChange,
            onTextFilterLiteralBlur: textFilterController.onTextFilterLiteralBlur,
            onToggleTextFilterCaseSensitive: textFilterController.onToggleTextFilterCaseSensitive,
            onApply: onApplyTextFilter,
            onReset: textFilterController.onReset ?? noop,
            filterDetailRequestHandler,
            setDisplayForm: setDisplayFormForTextMode,
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
        currentFilterMode: filterMode,
        availableInternalFilterModes,
        availableTextFilterModes,
        onFilterModeChange:
            availableInternalFilterModes.length > 1 ? onFilterModeChangeForControllers : undefined,
    };
};
