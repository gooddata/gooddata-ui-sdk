// (C) 2025 GoodData Corporation

import { type KeyboardEvent, useCallback, useMemo, useRef, useState } from "react";

import {
    autoUpdate,
    flip,
    size,
    useClick,
    useDismiss,
    useFloating,
    useInteractions,
    useListNavigation,
    useRole,
} from "@floating-ui/react";

import type { IUiComboboxOption, IUiComboboxParams, IUiComboboxState } from "./types.js";
import { normalizeValue } from "./utils.js";

/** @internal */
export function useCombobox(params: IUiComboboxParams): IUiComboboxState {
    const { value, defaultValue = "", onValueChange, options, creatable = false } = params;

    const [inputValue, setInputValue] = useControlledValue({ value, defaultValue, onValueChange });
    const isInputValueEmpty = inputValue.length === 0;

    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [selectedOption, setSelectedOption] = useState<IUiComboboxOption | undefined>(undefined);

    const resetState = useCallback(() => {
        setInputValue(defaultValue);
        setActiveIndex(null);
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
        if (creatable && matchedOptions.length > 1 && !hasExactMatch) {
            matchedOptions.push({
                id: `creatable/${inputValue}`,
                label: inputValue,
                creatable: true,
            });
        }

        return matchedOptions;
    }, [options, inputValue, selectedOption, creatable]);

    const activeOption = activeIndex == null ? undefined : availableOptions[activeIndex];

    const {
        setReferenceRef,
        setFloatingRef,
        floatingStyles,
        getReferenceProps,
        getFloatingProps,
        getItemProps,
        registerItemRef,
    } = useComboboxFloating({ isOpen, setIsOpen, activeIndex, setActiveIndex });

    const handleSelectOption = useCallback(
        (option: IUiComboboxOption, index?: number) => {
            if (index !== undefined) {
                setActiveIndex(index);
            }
            setSelectedOption(option);
            setIsOpen(false);
            setInputValue(option.label);
        },
        [setInputValue],
    );

    const handleInputChange = useCallback(
        (inputValue: string) => {
            setInputValue(inputValue);
            setIsOpen(true);
        },
        [setInputValue],
    );

    const handleInputKeyDown = useCallback(
        (event: KeyboardEvent<HTMLInputElement>) => {
            if (event.key === "Escape" && !isOpen && !isInputValueEmpty) {
                event.stopPropagation();
                resetState();
            }
            if (event.key === "Enter" && activeOption) {
                event.preventDefault();
                handleSelectOption(activeOption);
            }
        },
        [activeOption, isInputValueEmpty, isOpen, handleSelectOption, resetState],
    );

    const handleInputBlur = useCallback(() => {
        if (inputValue && selectedOption && inputValue !== selectedOption.label) {
            setInputValue(selectedOption.label);
        }
    }, [inputValue, selectedOption, setInputValue]);

    return useMemo(
        () =>
            ({
                availableOptions,
                inputValue,
                isOpen,
                setIsOpen,
                onInputChange: handleInputChange,
                onInputKeyDown: handleInputKeyDown,
                onInputBlur: handleInputBlur,
                activeIndex,
                setActiveIndex,
                activeOption,
                selectedOption,
                selectOption: handleSelectOption,
                setReferenceRef,
                setFloatingRef,
                registerItemRef,
                getReferenceProps,
                getFloatingProps,
                getItemProps,
                floatingStyles,
                creatable,
            }) satisfies IUiComboboxState,
        [
            availableOptions,
            inputValue,
            isOpen,
            handleInputChange,
            handleInputKeyDown,
            handleInputBlur,
            activeIndex,
            activeOption,
            selectedOption,
            handleSelectOption,
            setReferenceRef,
            setFloatingRef,
            registerItemRef,
            getReferenceProps,
            getFloatingProps,
            getItemProps,
            floatingStyles,
            creatable,
        ],
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

type UseComboboxFloatingParams = Pick<
    IUiComboboxState,
    "isOpen" | "setIsOpen" | "activeIndex" | "setActiveIndex"
>;

function useComboboxFloating(params: UseComboboxFloatingParams) {
    const { isOpen, setIsOpen, activeIndex, setActiveIndex } = params;
    const listRef = useRef<Array<HTMLElement | null>>([]);

    const { refs, floatingStyles, context } = useFloating({
        placement: "bottom-start",
        open: isOpen,
        onOpenChange: setIsOpen,
        whileElementsMounted: autoUpdate,
        middleware: [
            flip(),
            size({
                apply({ rects, elements }) {
                    elements.floating.style.width = `${rects.reference.width}px`;
                },
            }),
        ],
    });

    const listNav = useListNavigation(context, {
        listRef,
        activeIndex,
        onNavigate: setActiveIndex,
        virtual: true,
        loop: true,
    });
    const click = useClick(context);
    const dismiss = useDismiss(context);
    const role = useRole(context, { role: "combobox" });

    const { getReferenceProps, getFloatingProps, getItemProps } = useInteractions([
        listNav,
        click,
        dismiss,
        role,
    ]);

    const registerItemRef = useCallback((node: HTMLElement | null, index: number) => {
        listRef.current[index] = node;
    }, []);

    return {
        setReferenceRef: refs.setReference,
        setFloatingRef: refs.setFloating,
        floatingStyles,
        getReferenceProps,
        getFloatingProps,
        getItemProps,
        registerItemRef,
    };
}
