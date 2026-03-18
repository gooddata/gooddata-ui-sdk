// (C) 2022-2026 GoodData Corporation

import { useCallback, useMemo } from "react";

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { type IAttributeFilter } from "@gooddata/sdk-model";
import { type GoodDataSdkError } from "@gooddata/sdk-ui";

import { type TextFilterController } from "./types.js";
import { type ITextFilterState, useTextFilterInnerController } from "./useTextFilterInnerController.js";
import { type AsyncOperationStatus } from "../../AttributeFilterHandler/types/common.js";
import { type AttributeFilterAvailableMode } from "../filterModeTypes.js";
import { getAvailableTextModes } from "../filterModeUtils.js";

/**
 * @internal
 */
export interface ITextFilterControllerProps {
    isTextMode: boolean;
    backend: IAnalyticalBackend;
    workspace: string;
    filterInput: IAttributeFilter;
    onTextStateChange?: (state: ITextFilterState) => void;
    availableFilterModes?: AttributeFilterAvailableMode[];
    filterModeChanged?: boolean;
    /** Attribute metadata from orchestrator (handler) */
    attributeMetadataStatus?: AsyncOperationStatus;
    attributeMetadataError?: GoodDataSdkError;
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
        availableFilterModes,
        attributeMetadataStatus,
        attributeMetadataError,
        filterModeChanged = false,
    } = props;

    const availableTextFilterModes = useMemo(
        () => getAvailableTextModes(availableFilterModes),
        [availableFilterModes],
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
        availableTextModes: availableTextFilterModes,
        onTextStateChange,
        attributeMetadataStatus,
        attributeMetadataError,
        filterModeChanged,
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
