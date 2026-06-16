// (C) 2026 GoodData Corporation

import { useCallback, useMemo, useState } from "react";

import type { IUiComboboxOption } from "./types.js";
import { normalizeValue } from "./utils.js";

/** @internal */
export interface IUseComboboxSelectionParams {
    options: IUiComboboxOption[];
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    creatable?: boolean;
    setIsOpen: (open: boolean) => void;
}

/**
 * @internal
 */
export function useComboboxSelection({
    options,
    value,
    defaultValue = "",
    onValueChange,
    creatable = false,
    setIsOpen,
}: IUseComboboxSelectionParams) {
    const [inputValue, setInputValue] = useControlledValue({ value, defaultValue, onValueChange });

    const [selectedOption, setSelectedOption] = useState<IUiComboboxOption | undefined>(undefined);

    const resetState = useCallback(() => {
        setInputValue(defaultValue);
        setSelectedOption(undefined);
    }, [defaultValue, setInputValue]);

    const availableOptions = useMemo(() => {
        const value = normalizeValue(inputValue);
        const selectedValue = selectedOption ? normalizeValue(selectedOption.label) : undefined;

        // Show all options when there is no value or the value is the same as the selected value
        if (!value || value === selectedValue) {
            return options;
        }

        const matchedOptions = options.filter((option) => normalizeValue(option.label).includes(value));
        const hasExactMatch = matchedOptions.some((option) => normalizeValue(option.label) === value);

        // Add a creatable option if there are multiple matches and none matches the input exactly
        if (creatable && !hasExactMatch) {
            matchedOptions.push({
                id: `creatable/${inputValue}`,
                label: inputValue,
                creatable: true,
            });
        }

        return matchedOptions;
    }, [options, inputValue, selectedOption, creatable]);

    const selectOption = useCallback(
        (option: IUiComboboxOption) => {
            // Hover sets the highlight without checking `disabled`, so without
            // this guard a disabled row could be Enter-confirmed even though
            // clicking it is blocked in the list item.
            if (option.disabled) {
                return;
            }
            setSelectedOption(option);
            setIsOpen(false);
            setInputValue(option.label);
        },
        [setIsOpen, setInputValue],
    );

    const onInputChange = useCallback(
        (next: string) => {
            setInputValue(next);
            setIsOpen(true);
        },
        [setInputValue, setIsOpen],
    );

    const onInputBlur = useCallback(() => {
        if (inputValue && selectedOption && inputValue !== selectedOption.label && !creatable) {
            setInputValue(selectedOption.label);
        }
        setIsOpen(false);
    }, [inputValue, selectedOption, setInputValue, creatable, setIsOpen]);

    return useMemo(
        () => ({
            availableOptions,
            inputValue,
            onInputChange,
            onInputBlur,
            selectedOption,
            selectOption,
            resetState,
        }),
        [availableOptions, inputValue, onInputChange, onInputBlur, selectedOption, selectOption, resetState],
    );
}

function useControlledValue(params: {
    value: string | undefined;
    defaultValue: string;
    onValueChange?: (value: string) => void;
}) {
    const { value, defaultValue, onValueChange } = params;
    const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
    const isControlled = value !== undefined;
    const controlledValue = isControlled ? value : uncontrolledValue;

    const setControlledValue = useCallback(
        (newValue: string) => {
            if (isControlled) {
                onValueChange?.(newValue);
            } else {
                setUncontrolledValue(newValue);
            }
        },
        [isControlled, onValueChange],
    );

    return [controlledValue, setControlledValue] as const;
}
