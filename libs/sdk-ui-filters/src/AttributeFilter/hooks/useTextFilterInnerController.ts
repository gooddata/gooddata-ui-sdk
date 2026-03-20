// (C) 2007-2026 GoodData Corporation

import { useCallback, useEffect, useState } from "react";

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { type IAttributeFilter, type ObjRef, isMatchAttributeFilter } from "@gooddata/sdk-model";
import { type GoodDataSdkError, useDebounce } from "@gooddata/sdk-ui";

import { MAX_SELECTION_SIZE } from "./constants.js";
import { type AsyncOperationStatus } from "../../AttributeFilterHandler/types/common.js";
import { type AttributeFilterTextMode } from "../filterModeTypes.js";
import {
    type TextFilterOperator,
    getOperatorFromFilter,
    getValuesFromFilter,
    isAllOperator,
    isArbitraryOperator,
    resolveValuesOnTextOperatorChange,
} from "../textFilterOperatorUtils.js";

/**
 * Snapshot of the text filter working state (operator, values, literal, caseSensitive).
 * Used for state emission and committed state tracking — no display form, no filter object.
 *
 * @internal
 */
export interface ITextFilterState {
    operator: TextFilterOperator;
    values: Array<string | null>;
    literal: string;
    caseSensitive: boolean;
}

/**
 * Props for useTextFilterInnerController hook.
 * @internal
 */
export interface ITextFilterInnerControllerProps {
    enabled?: boolean;
    backend: IAnalyticalBackend;
    workspace: string;
    filter: IAttributeFilter;
    onTextStateChange?: (state: ITextFilterState) => void;
    filterModeChanged?: boolean;
    availableTextModes?: AttributeFilterTextMode[];
    attributeMetadataStatus?: AsyncOperationStatus;
    attributeMetadataError?: GoodDataSdkError;
    withoutApply?: boolean;
}

/**
 * Check whether a text filter state is objectively invalid (empty values/literal),
 * regardless of UI touched flags. Used to gate onChange/placeholder updates.
 *
 * @internal
 */
export function isTextStateInvalid(state: ITextFilterState): boolean {
    if (isAllOperator(state.operator)) {
        return false;
    }
    if (isArbitraryOperator(state.operator)) {
        return state.values.length === 0;
    }
    return state.literal.trim() === "";
}

const DEFAULT_TEXT_MODES: AttributeFilterTextMode[] = ["arbitrary", "match"];

const isOperatorAllowed = (
    nextOperator: TextFilterOperator,
    availableTextModes: AttributeFilterTextMode[],
): boolean => {
    if (isAllOperator(nextOperator)) {
        return true;
    }
    if (isArbitraryOperator(nextOperator)) {
        return availableTextModes.includes("arbitrary");
    }
    return availableTextModes.includes("match");
};

const getFallbackOperator = (availableTextModes: AttributeFilterTextMode[]): TextFilterOperator => {
    if (availableTextModes.includes("arbitrary")) {
        return "is";
    }
    return "contains";
};

/**
 * Internal result of useTextFilterInnerController. Not part of public API.
 *
 * @internal
 */
export interface ITextFilterInnerController {
    isTextFilterInvalid: boolean;
    isApplyDisabled: boolean;
    isWorkingSelectionChanged: boolean;
    textFilterOperator: TextFilterOperator;
    textFilterValues?: Array<string | null>;
    textFilterLiteral?: string;
    textFilterLiteralEmptyError?: boolean;
    textFilterValuesEmptyError?: boolean;
    textFilterValuesLimitReachedWarning?: boolean;
    textFilterValuesLimitExceededError?: boolean;
    textFilterCaseSensitive?: boolean;
    committedState?: ITextFilterState;
    onTextFilterOperatorChange?: (operator: TextFilterOperator) => void;
    onTextFilterValuesChange?: (values: Array<string | null>) => void;
    onTextFilterValuesBlur?: () => void;
    onTextFilterLiteralChange?: (literal: string) => void;
    onTextFilterLiteralBlur?: () => void;
    onToggleTextFilterCaseSensitive?: () => void;
    onCommitTextFilter?: () => void;
    onReset?: () => void;
    onResetForDisplayFormChange?: (newDisplayFormRef: ObjRef) => void;
    syncFromFilter?: (nextFilter: IAttributeFilter, updateCommitted?: boolean) => void;
}

/**
 * Controller hook for text filter mode (arbitrary and match filters).
 * Manages only operator, values, literal, caseSensitive, and validation.
 * Does NOT track display form or construct filter objects — the parent handles that.
 *
 * @internal
 */
export function useTextFilterInnerController(
    props: ITextFilterInnerControllerProps,
): ITextFilterInnerController {
    const {
        filter,
        onTextStateChange,
        availableTextModes = DEFAULT_TEXT_MODES,
        filterModeChanged = false,
        withoutApply = false,
    } = props;

    const [operator, setOperator] = useState<TextFilterOperator>(
        () => getOperatorFromFilter(filter) ?? "all",
    );
    const [values, setValues] = useState<Array<string | null>>(() => {
        const filterValues = getValuesFromFilter(filter);
        return Array.isArray(filterValues) ? filterValues : [];
    });
    const [literal, setLiteral] = useState<string>(() => {
        const filterValues = getValuesFromFilter(filter);
        return typeof filterValues === "string" ? filterValues : "";
    });
    const [caseSensitive, setCaseSensitive] = useState(
        isMatchAttributeFilter(filter) ? (filter.matchAttributeFilter.caseSensitive ?? false) : false,
    );

    const [committedState, setCommittedState] = useState<ITextFilterState>(() =>
        extractStateFromFilter(filter, availableTextModes),
    );
    const [isLiteralTouched, setIsLiteralTouched] = useState(false);
    const [isValuesTouched, setIsValuesTouched] = useState(false);
    const [hasValuesLimitExceeded, setHasValuesLimitExceeded] = useState(false);
    const [isEmptyAfterOperatorChange, setIsEmptyAfterOperatorChange] = useState(false);

    const emitStateChange = useCallback(
        (state: ITextFilterState) => {
            // When withoutApply, auto-commit valid states (matching elements filter
            // which calls handler.commitSelection() on every valid select).
            if (withoutApply && !isTextStateInvalid(state)) {
                setCommittedState(state);
                setIsEmptyAfterOperatorChange(false);
                setIsLiteralTouched(false);
                setIsValuesTouched(false);
            }
            onTextStateChange?.(state);
        },
        [onTextStateChange, withoutApply],
    );

    const syncFromFilter = useCallback(
        (nextFilter: IAttributeFilter, updateCommitted = true) => {
            const filterOperator = getOperatorFromFilter(nextFilter);
            const nextOperator = isOperatorAllowed(filterOperator, availableTextModes)
                ? filterOperator
                : getFallbackOperator(availableTextModes);
            const nextValues = getValuesFromFilter(nextFilter);
            const nextLiteral = typeof nextValues === "string" ? nextValues : "";
            const nextValuesArray = Array.isArray(nextValues) ? nextValues : [];
            const nextCaseSensitive = isMatchAttributeFilter(nextFilter)
                ? (nextFilter.matchAttributeFilter.caseSensitive ?? false)
                : false;

            setOperator(nextOperator);
            setValues(nextValuesArray);
            setLiteral(nextLiteral);
            setCaseSensitive(nextCaseSensitive);
            if (updateCommitted) {
                setCommittedState({
                    operator: nextOperator,
                    values: nextValuesArray,
                    literal: nextLiteral,
                    caseSensitive: nextCaseSensitive,
                });
                setIsEmptyAfterOperatorChange(false);
            }
            setIsLiteralTouched(false);
            setIsValuesTouched(false);
        },
        [availableTextModes],
    );

    useEffect(() => {
        syncFromFilter(filter);
    }, [filter, syncFromFilter]);

    const onOperatorChange = useCallback(
        (newOperator: TextFilterOperator) => {
            if (!isOperatorAllowed(newOperator, availableTextModes)) {
                return;
            }
            const next = resolveValuesOnTextOperatorChange(newOperator, operator, values, literal);
            setOperator(newOperator);
            setValues(next.values);
            setLiteral(next.literal);
            setIsLiteralTouched(false);
            setIsValuesTouched(false);
            setIsEmptyAfterOperatorChange(true);
            emitStateChange({
                operator: newOperator,
                values: next.values,
                literal: next.literal,
                caseSensitive,
            });
        },
        [availableTextModes, caseSensitive, emitStateChange, operator, literal, values],
    );

    const onValuesChange = useCallback(
        (newValues: Array<string | null>) => {
            const exceedsLimit = newValues.length > MAX_SELECTION_SIZE;
            const cappedValues = exceedsLimit ? newValues.slice(0, MAX_SELECTION_SIZE) : newValues;
            setHasValuesLimitExceeded(exceedsLimit);
            setValues(cappedValues);
            setIsValuesTouched(false);
            if (cappedValues.length > 0) {
                setIsEmptyAfterOperatorChange(false);
            }
            emitStateChange({ operator, values: cappedValues, literal, caseSensitive });
        },
        [caseSensitive, emitStateChange, operator, literal],
    );

    const emitLiteralStateChange = useCallback(
        (newLiteral: string) => {
            emitStateChange({ operator, values, literal: newLiteral, caseSensitive });
        },
        [caseSensitive, emitStateChange, operator, values],
    );

    const debouncedEmitLiteralStateChange = useDebounce(emitLiteralStateChange, 300);

    const onLiteralChange = useCallback(
        (newLiteral: string) => {
            setLiteral(newLiteral);
            setIsLiteralTouched(false);
            if (newLiteral.trim() !== "") {
                setIsEmptyAfterOperatorChange(false);
            }
            debouncedEmitLiteralStateChange(newLiteral);
        },
        [debouncedEmitLiteralStateChange],
    );

    const onToggleCaseSensitive = useCallback(() => {
        const newCaseSensitive = !caseSensitive;
        setCaseSensitive(newCaseSensitive);
        emitStateChange({ operator, values, literal, caseSensitive: newCaseSensitive });
    }, [caseSensitive, emitStateChange, operator, literal, values]);

    const onLiteralBlur = useCallback(() => {
        debouncedEmitLiteralStateChange.flush();
        setIsLiteralTouched(true);
    }, [debouncedEmitLiteralStateChange]);

    useEffect(() => {
        return () => debouncedEmitLiteralStateChange.cancel();
    }, [debouncedEmitLiteralStateChange]);

    const onValuesBlur = useCallback(() => {
        setIsValuesTouched(true);
    }, []);

    const onCommitTextFilter = useCallback(() => {
        setCommittedState({ operator, values, literal, caseSensitive });
        setIsEmptyAfterOperatorChange(false);
        setIsLiteralTouched(false);
        setIsValuesTouched(false);
    }, [caseSensitive, operator, literal, values]);

    const onResetForDisplayFormChange = useCallback((_newDisplayFormRef: ObjRef) => {
        // Do not clear selection — values are plain text, valid from API standpoint.
        // They may show no data for the new display form; user can manually clear via Clear button.
        // Do not reset hasValuesLimitExceeded — values stay as-is, so limit state remains valid.
    }, []);

    const onReset = useCallback(() => {
        setOperator(committedState.operator);
        setValues(committedState.values);
        setLiteral(committedState.literal);
        setCaseSensitive(committedState.caseSensitive);
        setIsLiteralTouched(false);
        setIsValuesTouched(false);
        setIsEmptyAfterOperatorChange(false);
        setHasValuesLimitExceeded(false);
    }, [committedState]);

    // Validation
    const isArbitraryInputEmpty = isArbitraryOperator(operator) && values.length === 0;
    const isMatchInputEmpty =
        !isArbitraryOperator(operator) && !isAllOperator(operator) && literal.trim() === "";

    const hasUserInteractedOrReset = isEmptyAfterOperatorChange || filterModeChanged;

    const isArbitraryFilterInvalid = (isValuesTouched || hasUserInteractedOrReset) && isArbitraryInputEmpty;

    const isMatchFilterInvalid = (isLiteralTouched || hasUserInteractedOrReset) && isMatchInputEmpty;

    // Input error state only when user touched - isEmptyAfterOperatorChange does NOT trigger it.
    // "All" operator is always valid (no input required)
    const isTextFilterInvalid =
        !isAllOperator(operator) && (isArbitraryFilterInvalid || isMatchFilterInvalid);
    // Apply disabled always when literal/values are empty.
    const isApplyDisabled =
        hasValuesLimitExceeded ||
        isArbitraryInputEmpty ||
        isMatchInputEmpty ||
        (!hasDraftChanged(operator, values, literal, caseSensitive ?? false, committedState) &&
            !filterModeChanged);

    return {
        isTextFilterInvalid: isTextFilterInvalid,
        isApplyDisabled,
        isWorkingSelectionChanged:
            hasDraftChanged(operator, values, literal, caseSensitive ?? false, committedState) ||
            filterModeChanged,
        textFilterOperator: operator,
        textFilterValues: values,
        textFilterLiteral: literal,
        textFilterLiteralEmptyError: isLiteralTouched && isMatchInputEmpty,
        textFilterValuesEmptyError: isValuesTouched && isArbitraryInputEmpty,
        textFilterValuesLimitReachedWarning:
            isArbitraryOperator(operator) && values.length >= MAX_SELECTION_SIZE,
        textFilterValuesLimitExceededError: hasValuesLimitExceeded,
        textFilterCaseSensitive: caseSensitive,
        committedState,
        onTextFilterOperatorChange: onOperatorChange,
        onTextFilterValuesChange: onValuesChange,
        onTextFilterValuesBlur: onValuesBlur,
        onTextFilterLiteralChange: onLiteralChange,
        onTextFilterLiteralBlur: onLiteralBlur,
        onToggleTextFilterCaseSensitive: onToggleCaseSensitive,
        onCommitTextFilter,
        onReset,
        onResetForDisplayFormChange,
        syncFromFilter,
    };
}

function hasDraftChanged(
    operator: TextFilterOperator,
    values: Array<string | null>,
    literal: string,
    caseSensitive: boolean,
    committed: ITextFilterState,
): boolean {
    if (operator !== committed.operator) {
        return true;
    }

    if (isAllOperator(operator)) {
        return false;
    }

    if (isArbitraryOperator(operator)) {
        if (values.length !== committed.values.length) {
            return true;
        }
        return values.some((value, index) => value !== committed.values[index]);
    }

    return literal.trim() !== committed.literal.trim() || caseSensitive !== committed.caseSensitive;
}

function extractStateFromFilter(
    filter: IAttributeFilter,
    availableTextModes: AttributeFilterTextMode[],
): ITextFilterState {
    const filterOperator = getOperatorFromFilter(filter);
    const resolvedOperator = isOperatorAllowed(filterOperator, availableTextModes)
        ? filterOperator
        : getFallbackOperator(availableTextModes);
    const filterValues = getValuesFromFilter(filter);
    return {
        operator: resolvedOperator,
        values: Array.isArray(filterValues) ? filterValues : [],
        literal: typeof filterValues === "string" ? filterValues : "",
        caseSensitive: isMatchAttributeFilter(filter)
            ? (filter.matchAttributeFilter.caseSensitive ?? false)
            : false,
    };
}
