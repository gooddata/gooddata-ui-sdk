// (C) 2007-2026 GoodData Corporation

import { useCallback, useEffect, useState } from "react";

import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import {
    type IAttributeFilter,
    type ObjRef,
    filterLocalIdentifier,
    filterObjRef,
    isMatchAttributeFilter,
} from "@gooddata/sdk-model";
import { type GoodDataSdkError, useDebounce } from "@gooddata/sdk-ui";

import { MAX_SELECTION_SIZE } from "./constants.js";
import { type AsyncOperationStatus } from "../../AttributeFilterHandler/types/common.js";
import { type AttributeFilterTextMode } from "../filterModeTypes.js";
import {
    type TextFilterOperator,
    createFilterFromOperator,
    getOperatorFromFilter,
    getValuesFromFilter,
    isArbitraryOperator,
    isNegativeOperator,
    resolveValuesOnTextOperatorChange,
} from "../textFilterOperatorUtils.js";
import { type OnApplyCallbackType, type OnChangeCallbackType } from "../types.js";

/**
 * Props for useTextFilterController hook.
 * @internal
 */
export interface ITextFilterInnerControllerProps {
    enabled?: boolean;
    backend: IAnalyticalBackend;
    workspace: string;
    filter: IAttributeFilter;
    onApply?: OnApplyCallbackType;
    onChange?: OnChangeCallbackType;
    withoutApply?: boolean;
    filterModeChanged?: boolean;
    availableTextModes?: AttributeFilterTextMode[];
    attributeMetadataStatus?: AsyncOperationStatus;
    attributeMetadataError?: GoodDataSdkError;
}

const DEFAULT_TEXT_MODES: AttributeFilterTextMode[] = ["arbitrary", "match"];

const isOperatorAllowed = (
    nextOperator: TextFilterOperator,
    availableTextModes: AttributeFilterTextMode[],
): boolean => {
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
 * Internal result of useTextFilterController. Not part of public API.
 *
 * @internal
 */
export interface ITextFilterInnerController {
    currentDisplayFormRef: ObjRef;
    isTextFilterInvalid: boolean;
    isApplyDisabled: boolean;
    isWorkingSelectionChanged: boolean;
    textFilterOperator: TextFilterOperator;
    textFilterValues?: string[];
    textFilterLiteral?: string;
    textFilterLiteralEmptyError?: boolean;
    textFilterValuesEmptyError?: boolean;
    textFilterValuesLimitReachedWarning?: boolean;
    textFilterValuesLimitExceededError?: boolean;
    textFilterCaseSensitive?: boolean;
    textFilterCommittedFilter?: IAttributeFilter;
    onTextFilterOperatorChange?: (operator: TextFilterOperator) => void;
    onTextFilterValuesChange?: (values: string[]) => void;
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
 * @internal
 */
export function useTextFilterInnerController(
    props: ITextFilterInnerControllerProps,
): ITextFilterInnerController {
    const { filter, onChange, availableTextModes = DEFAULT_TEXT_MODES, filterModeChanged = false } = props;

    const [operator, setOperator] = useState<TextFilterOperator>(() => getOperatorFromFilter(filter) ?? "is");
    const [values, setValues] = useState<string[]>(() => {
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
    const [displayForm, setDisplayForm] = useState<ObjRef>(filterObjRef(filter));

    const [committedFilter, setCommittedFilter] = useState<IAttributeFilter>(filter);
    const [isLiteralTouched, setIsLiteralTouched] = useState(false);
    const [isValuesTouched, setIsValuesTouched] = useState(false);
    const [hasValuesLimitExceeded, setHasValuesLimitExceeded] = useState(false);
    const [isEmptyAfterDisplayFormReset, setIsEmptyAfterDisplayFormReset] = useState(false);

    const localIdentifier = filterLocalIdentifier(filter);

    const emitSelect = useCallback(
        (nextFilter: IAttributeFilter) => {
            const operator = getOperatorFromFilter(nextFilter);
            const isNegative = isNegativeOperator(operator);
            onChange?.(nextFilter, isNegative);
        },
        [onChange],
    );

    const syncFromFilter = useCallback(
        (nextFilter: IAttributeFilter, updateCommitted = true) => {
            setDisplayForm(filterObjRef(nextFilter));
            const filterOperator = getOperatorFromFilter(nextFilter);
            const nextOperator = isOperatorAllowed(filterOperator, availableTextModes)
                ? filterOperator
                : getFallbackOperator(availableTextModes);
            const nextValues = getValuesFromFilter(nextFilter);
            setOperator(nextOperator);
            setValues(Array.isArray(nextValues) ? nextValues : []);
            setLiteral(typeof nextValues === "string" ? nextValues : "");
            setCaseSensitive(
                isMatchAttributeFilter(nextFilter)
                    ? (nextFilter.matchAttributeFilter.caseSensitive ?? false)
                    : false,
            );
            if (updateCommitted) {
                setCommittedFilter(nextFilter);
                setIsEmptyAfterDisplayFormReset(false);
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
            setIsEmptyAfterDisplayFormReset(false);
            const newFilter = createFilterFromOperator(
                newOperator,
                isArbitraryOperator(newOperator) ? next.values : next.literal,
                displayForm,
                localIdentifier,
                caseSensitive,
            );
            // When crossing groups (arbitrary ↔ match), reset committed filter so the filter
            // is fully reset — Apply stays disabled until user enters new values.
            if (isArbitraryOperator(newOperator) !== isArbitraryOperator(operator)) {
                setCommittedFilter(newFilter);
            }
            emitSelect(newFilter);
        },
        [
            localIdentifier,
            availableTextModes,
            caseSensitive,
            displayForm,
            emitSelect,
            operator,
            literal,
            values,
        ],
    );

    const onValuesChange = useCallback(
        (newValues: string[]) => {
            const exceedsLimit = newValues.length > MAX_SELECTION_SIZE;
            const cappedValues = exceedsLimit ? newValues.slice(0, MAX_SELECTION_SIZE) : newValues;
            setHasValuesLimitExceeded(exceedsLimit);
            setValues(cappedValues);
            if (cappedValues.length > 0) {
                setIsEmptyAfterDisplayFormReset(false);
            }
            const newFilter = createFilterFromOperator(
                operator,
                cappedValues,
                displayForm,
                localIdentifier,
                caseSensitive,
            );
            emitSelect(newFilter);
        },
        [localIdentifier, caseSensitive, displayForm, emitSelect, operator],
    );

    const emitLiteralFilter = useCallback(
        (newLiteral: string) => {
            const newFilter = createFilterFromOperator(
                operator,
                newLiteral,
                displayForm,
                localIdentifier,
                caseSensitive,
            );
            emitSelect(newFilter);
        },
        [localIdentifier, caseSensitive, displayForm, emitSelect, operator],
    );

    const debouncedEmitLiteralFilter = useDebounce(emitLiteralFilter, 300);

    const onLiteralChange = useCallback(
        (newLiteral: string) => {
            setLiteral(newLiteral);
            setIsLiteralTouched(false);
            if (newLiteral.trim() !== "") {
                setIsEmptyAfterDisplayFormReset(false);
            }
            debouncedEmitLiteralFilter(newLiteral);
        },
        [debouncedEmitLiteralFilter],
    );

    const onToggleCaseSensitive = useCallback(() => {
        const newCaseSensitive = !caseSensitive;
        setCaseSensitive(newCaseSensitive);
        const newFilter = createFilterFromOperator(
            operator,
            isArbitraryOperator(operator) ? values : literal,
            displayForm,
            localIdentifier,
            newCaseSensitive,
        );
        emitSelect(newFilter);
    }, [localIdentifier, caseSensitive, displayForm, emitSelect, operator, literal, values]);

    const onLiteralBlur = useCallback(() => {
        debouncedEmitLiteralFilter.flush();
        setIsLiteralTouched(true);
    }, [debouncedEmitLiteralFilter]);

    useEffect(() => {
        return () => debouncedEmitLiteralFilter.cancel();
    }, [debouncedEmitLiteralFilter]);

    const onValuesBlur = useCallback(() => {
        setIsValuesTouched(true);
    }, []);

    const onCommitTextFilter = useCallback(() => {
        const nextFilter = createFilterFromOperator(
            operator,
            isArbitraryOperator(operator) ? values : literal,
            displayForm,
            localIdentifier,
            caseSensitive,
        );
        setCommittedFilter(nextFilter);
        setIsLiteralTouched(false);
        setIsValuesTouched(false);
        setIsEmptyAfterDisplayFormReset(false);
    }, [localIdentifier, caseSensitive, displayForm, operator, literal, values]);

    const onResetForDisplayFormChange = useCallback(
        (newDisplayFormRef: ObjRef) => {
            const emptyFilter = createFilterFromOperator(
                operator,
                isArbitraryOperator(operator) ? [] : "",
                newDisplayFormRef,
                localIdentifier,
                caseSensitive,
            );
            setHasValuesLimitExceeded(false);
            setIsEmptyAfterDisplayFormReset(true);
            // Only sync working state; keep committedFilter so hasDraftChanged detects the change.
            syncFromFilter(emptyFilter, false);
        },
        [localIdentifier, caseSensitive, operator, syncFromFilter],
    );

    // Validation
    const isArbitraryInputEmpty = isArbitraryOperator(operator) && values.length === 0;
    const isMatchInputEmpty = !isArbitraryOperator(operator) && literal.trim() === "";
    // Apply disabled when empty AND (user touched input OR we just reset for display form change).
    // Input error state only when user touched - isEmptyAfterDisplayFormReset does NOT trigger it.
    const isTextFilterInvalid =
        ((isValuesTouched || isEmptyAfterDisplayFormReset || filterModeChanged) && isArbitraryInputEmpty) ||
        ((isLiteralTouched || isEmptyAfterDisplayFormReset || filterModeChanged) && isMatchInputEmpty);
    const isApplyDisabled =
        hasValuesLimitExceeded ||
        isTextFilterInvalid ||
        !hasDraftChanged(operator, values, literal, caseSensitive ?? false, committedFilter);

    return {
        currentDisplayFormRef: displayForm,
        isTextFilterInvalid: isTextFilterInvalid,
        isApplyDisabled,
        isWorkingSelectionChanged:
            hasDraftChanged(operator, values, literal, caseSensitive ?? false, committedFilter) ||
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
        textFilterCommittedFilter: committedFilter,
        onTextFilterOperatorChange: onOperatorChange,
        onTextFilterValuesChange: onValuesChange,
        onTextFilterValuesBlur: onValuesBlur,
        onTextFilterLiteralChange: onLiteralChange,
        onTextFilterLiteralBlur: onLiteralBlur,
        onToggleTextFilterCaseSensitive: onToggleCaseSensitive,
        onCommitTextFilter,
        onReset: () => syncFromFilter(committedFilter),
        onResetForDisplayFormChange,
        syncFromFilter,
    };
}

function hasDraftChanged(
    operator: TextFilterOperator,
    values: string[],
    literal: string,
    caseSensitive: boolean,
    committedFilter: IAttributeFilter,
): boolean {
    const committedOperator = getOperatorFromFilter(committedFilter);
    const committedValue = getValuesFromFilter(committedFilter);
    const committedCaseSensitive = isMatchAttributeFilter(committedFilter)
        ? committedFilter.matchAttributeFilter.caseSensitive
        : false;

    if (operator !== committedOperator) {
        return true;
    }

    if (isArbitraryOperator(operator)) {
        const committedValues = Array.isArray(committedValue) ? committedValue : [];
        if (values.length !== committedValues.length) {
            return true;
        }
        return values.some((value, index) => value !== committedValues[index]);
    }

    const committedLiteral = typeof committedValue === "string" ? committedValue : "";
    return literal !== committedLiteral || caseSensitive !== committedCaseSensitive;
}
