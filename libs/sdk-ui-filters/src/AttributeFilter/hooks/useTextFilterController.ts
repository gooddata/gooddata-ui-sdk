// (C) 2022-2026 GoodData Corporation

import { useCallback, useEffect, useMemo, useState } from "react";

import { invariant } from "ts-invariant";

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import {
    type DashboardAttributeFilterSelectionMode,
    type IAttributeFilter,
    type IAttributeMetadataObject,
    type ObjRef,
    areObjRefsEqual,
    filterLocalIdentifier,
    filterObjRef,
    isArbitraryAttributeFilter,
    isMatchAttributeFilter,
} from "@gooddata/sdk-model";
import { type GoodDataSdkError } from "@gooddata/sdk-ui";

import { type TextFilterController } from "./types.js";
import { useTextFilterInnerController } from "./useTextFilterInnerController.js";
import { type AsyncOperationStatus } from "../../AttributeFilterHandler/types/common.js";
import { type AttributeFilterAvailableMode } from "../filterModeTypes.js";
import { createEmptyFilterForMode, getAvailableTextModes } from "../filterModeUtils.js";
import {
    type TextFilterOperator,
    createFilterFromOperator,
    isAllOperator,
    isArbitraryOperator,
} from "../textFilterOperatorUtils.js";
import { type OnChangeCallbackType } from "../types.js";

/**
 * @internal
 */
export interface ITextFilterControllerProps {
    isTextMode: boolean;
    backend: IAnalyticalBackend;
    workspace: string;
    filterInput: IAttributeFilter;
    /** Optional secondary display form used for showing element values in the UI.
     *  When switching from elements mode to text mode, the text filter definition
     *  should use this label instead of the primary label from filterInput. */
    displayAsLabel?: ObjRef;
    onChange?: OnChangeCallbackType;
    withoutApply: boolean;
    selectionMode: DashboardAttributeFilterSelectionMode;
    availableFilterModes?: AttributeFilterAvailableMode[];
    filterModeChanged?: boolean;
    /** Attribute metadata from orchestrator (handler) */
    attribute?: IAttributeMetadataObject;
    attributeMetadataStatus?: AsyncOperationStatus;
    attributeMetadataError?: GoodDataSdkError;
}

/**
 * Text-mode controller is intentionally always initialized from the parent hook
 * so that hook ordering remains stable even when the filter mode switches.
 *
 * @internal
 */
export function useTextFilterController(props: ITextFilterControllerProps): TextFilterController {
    const {
        isTextMode,
        backend,
        workspace,
        filterInput,
        displayAsLabel,
        onChange,
        withoutApply,
        selectionMode,
        availableFilterModes,
        attributeMetadataStatus,
        attributeMetadataError,
        filterModeChanged = false,
    } = props;

    const displayFormRef = filterObjRef(filterInput);
    const localId = filterLocalIdentifier(filterInput);

    // Track effective display form so UI updates immediately when setDisplayForm is called
    const [effectiveDisplayFormRef, setEffectiveDisplayFormRef] = useState<ObjRef>(displayFormRef);
    useEffect(() => {
        setEffectiveDisplayFormRef(displayFormRef);
    }, [displayFormRef]);

    const availableTextFilterModes = useMemo(
        () => getAvailableTextModes(availableFilterModes),
        [availableFilterModes],
    );
    const isSourceTextFilter =
        filterInput && (isArbitraryAttributeFilter(filterInput) || isMatchAttributeFilter(filterInput));
    // When in elements mode, always pass empty so the effect doesn't overwrite the reset from
    // textResetForModeSwitch with the stale filter prop (parent's onChange may not have propagated yet).
    // Use displayAsLabel (when available) so that switching from elements mode to text mode
    // creates a text filter definition targeting the secondary label used for display,
    // not the primary label from filterInput.
    // We intentionally avoid effectiveDisplayFormRef here so that a local setDisplayForm call
    // does not cause the memo to produce an "all" filter that would reset the inner
    // controller's operator state via the sync effect.
    const textFilterDisplayFormRef = displayAsLabel ?? displayFormRef;
    const textFilter = useMemo(
        () =>
            isTextMode && filterInput && isSourceTextFilter
                ? filterInput
                : createEmptyFilterForMode("text", textFilterDisplayFormRef, localId),
        [textFilterDisplayFormRef, isTextMode, localId, filterInput, isSourceTextFilter],
    );

    const onChangeForText = useCallback(
        (filter: IAttributeFilter) => {
            const isInverted = isArbitraryAttributeFilter(filter)
                ? (filter.arbitraryAttributeFilter.negativeSelection ?? false)
                : false;
            onChange?.(filter, isInverted, selectionMode, [], undefined, false, {});
        },
        [onChange, selectionMode],
    );

    const {
        currentDisplayFormRef,
        isApplyDisabled,
        isTextFilterInvalid,
        isWorkingSelectionChanged,
        textFilterOperator,
        textFilterCaseSensitive,
        textFilterValues,
        textFilterLiteral,
        textFilterLiteralEmptyError,
        textFilterValuesEmptyError,
        textFilterValuesLimitReachedWarning,
        textFilterValuesLimitExceededError,
        textFilterCommittedFilter,
        onResetForDisplayFormChange,
        onTextFilterOperatorChange,
        onTextFilterValuesChange,
        onTextFilterValuesBlur,
        onTextFilterLiteralChange,
        onTextFilterLiteralBlur,
        onToggleTextFilterCaseSensitive,
        syncFromFilter,
        onCommitTextFilter,
        onReset,
    } = useTextFilterInnerController({
        enabled: isTextMode,
        backend,
        workspace,
        filter: textFilter,
        availableTextModes: availableTextFilterModes,
        withoutApply,
        onChange: onChangeForText,
        attributeMetadataStatus,
        attributeMetadataError,
        filterModeChanged,
    });
    const resetForModeSwitch = useCallback(
        (newFilter: IAttributeFilter) => {
            syncFromFilter?.(newFilter, false);
            const newDisplayFormRef = filterObjRef(newFilter);
            if (newDisplayFormRef) {
                setEffectiveDisplayFormRef(newDisplayFormRef);
            }
        },
        [syncFromFilter],
    );

    const setDisplayForm = useCallback(
        (newDisplayFormRef: ObjRef) => {
            if (areObjRefsEqual(newDisplayFormRef, effectiveDisplayFormRef)) {
                return;
            }
            setEffectiveDisplayFormRef(newDisplayFormRef);
            const operator = textFilterOperator ?? "all";
            const valuesOrLiteral = getValuesOrLiteral(operator);
            const caseSensitive = textFilterCaseSensitive ?? false;
            const nextFilter = createFilterFromOperator(
                operator,
                valuesOrLiteral,
                newDisplayFormRef,
                localId,
                caseSensitive,
            );
            const isInverted = isArbitraryAttributeFilter(nextFilter)
                ? (nextFilter.arbitraryAttributeFilter.negativeSelection ?? false)
                : false;
            onResetForDisplayFormChange?.(newDisplayFormRef);
            onChange?.(nextFilter, isInverted, selectionMode, [], newDisplayFormRef, false, {
                isSelectionInvalid: isApplyDisabled,
            });
        },
        [
            effectiveDisplayFormRef,
            isApplyDisabled,
            localId,
            onChange,
            onResetForDisplayFormChange,
            selectionMode,
            textFilterCaseSensitive,
            textFilterOperator,
        ],
    );

    if (isTextMode) {
        invariant(displayFormRef, "AttributeFilter: text filter display form is missing.");
    }

    return {
        // TextFilterControllerData (explicit)
        textFilterOperator,
        textFilterValues,
        textFilterLiteral,
        textFilterLiteralEmptyError,
        textFilterValuesEmptyError,
        textFilterValuesLimitReachedWarning,
        textFilterValuesLimitExceededError,
        textFilterCaseSensitive,
        textFilterCommittedFilter,
        // TextFilterControllerCallbacks
        onTextFilterOperatorChange,
        onTextFilterValuesChange,
        onTextFilterValuesBlur,
        onTextFilterLiteralChange,
        onTextFilterLiteralBlur,
        onToggleTextFilterCaseSensitive,
        // CommonFilterControllerData
        currentDisplayFormRef,
        // isInitializing: textControllerData.isInitializing,
        // initError: textControllerData.initError,
        // isFiltering: textControllerData.isFiltering,
        isTextFilterInvalid,
        isApplyDisabled,
        isWorkingSelectionChanged,
        // Internal fields for root
        syncFromFilter,
        onResetForDisplayFormChange,
        onCommitTextFilter,
        onReset,
        resetForModeSwitch,
        setDisplayForm,
    };
}

function getValuesOrLiteral(operator: TextFilterOperator): string[] | string {
    if (isAllOperator(operator)) {
        return [];
    }
    if (isArbitraryOperator(operator)) {
        return [];
    }
    return "";
}
