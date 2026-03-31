// (C) 2022-2026 GoodData Corporation

import { useCallback, useMemo } from "react";

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { type IAttributeFilter } from "@gooddata/sdk-model";
import { type GoodDataSdkError } from "@gooddata/sdk-ui";

import { type TextFilterController } from "./types.js";
import { type ITextFilterState, useTextFilterInnerController } from "./useTextFilterInnerController.js";
import { type AsyncOperationStatus } from "../../AttributeFilterHandler/types/common.js";
import { type AttributeFilterAvailableSelectionType } from "../selectionTypes.js";
import { getAvailableTextSelectionTypes } from "../selectionTypeUtils.js";

/**
 * @internal
 */
export interface ITextFilterControllerProps {
    isTextMode: boolean;
    backend: IAnalyticalBackend;
    workspace: string;
    filterInput: IAttributeFilter;
    onTextStateChange?: (state: ITextFilterState) => void;
    availableSelectionTypes?: AttributeFilterAvailableSelectionType[];
    selectionTypeChanged?: boolean;
    /** Attribute metadata from orchestrator (handler) */
    attributeMetadataStatus?: AsyncOperationStatus;
    attributeMetadataError?: GoodDataSdkError;
    withoutApply?: boolean;
}

/**
 * Text-mode controller is intentionally always initialized from the parent hook
 * so that hook ordering remains stable even when the filter mode switches.
 *
 * This controller no longer tracks display form or constructs filter objects.
 * It only manages operator, values, literal, caseSensitive, and validation.
 * The parent (useAttributeFilterController) is responsible for display form
 * management and final filter construction.
 *
 * @internal
 */
export function useTextFilterController(props: ITextFilterControllerProps): TextFilterController {
    const {
        isTextMode,
        backend,
        workspace,
        filterInput,
        onTextStateChange,
        availableSelectionTypes,
        attributeMetadataStatus,
        attributeMetadataError,
        selectionTypeChanged = false,
        withoutApply = false,
    } = props;

    const availableTextSelectionTypes = useMemo(
        () => getAvailableTextSelectionTypes(availableSelectionTypes),
        [availableSelectionTypes],
    );

    const {
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
        committedState,
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
        filter: filterInput,
        availableTextModes: availableTextSelectionTypes,
        onTextStateChange,
        attributeMetadataStatus,
        attributeMetadataError,
        selectionTypeChanged,
        withoutApply,
    });

    const resetForModeSwitch = useCallback(
        (newFilter: IAttributeFilter) => {
            syncFromFilter?.(newFilter, false);
        },
        [syncFromFilter],
    );

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
        committedState,
        // TextFilterControllerCallbacks
        onTextFilterOperatorChange,
        onTextFilterValuesChange,
        onTextFilterValuesBlur,
        onTextFilterLiteralChange,
        onTextFilterLiteralBlur,
        onToggleTextFilterCaseSensitive,
        // CommonFilterControllerData
        isTextFilterInvalid,
        isApplyDisabled,
        isWorkingSelectionChanged,
        // Internal fields for root
        syncFromFilter,
        onResetForDisplayFormChange,
        onCommitTextFilter,
        onReset,
        resetForModeSwitch,
    };
}
