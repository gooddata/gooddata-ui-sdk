// (C) 2025 GoodData Corporation

import type { CSSProperties, KeyboardEvent } from "react";

import type { ReferenceType, UseInteractionsReturn } from "@floating-ui/react";

/** @internal */
export interface IUiComboboxOption {
    id: string;
    label: string;
    disabled?: boolean;
    creatable?: boolean;
}

/** @internal */
export interface IUiComboboxParams {
    /**
     * The options to display in the combobox.
     */
    options: IUiComboboxOption[];
    /**
     * The selected value of the combobox. Use when controlled.
     */
    value?: string;
    /**
     * The default value of the combobox. Use when uncontrolled.
     */
    defaultValue?: string;
    /**
     * Event handler called when the selected value of the combobox changes.
     */
    onValueChange?: (value: string) => void;
    /**
     * When enabled, the combobox will include a "creatable" option for the current input
     * if there are multiple matching options and none of them matches the input exactly.
     */
    creatable?: boolean;
}

/** @internal */
export interface IUiComboboxState {
    inputValue: string;
    onInputChange: (value: string) => void;
    onInputKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
    onInputBlur: () => void;

    availableOptions: IUiComboboxOption[];
    activeIndex: number | null;
    setActiveIndex: (index: number | null) => void;
    activeOption: IUiComboboxOption | undefined;
    selectedOption: IUiComboboxOption | undefined;
    selectOption: (option: IUiComboboxOption, index?: number) => void;

    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    setReferenceRef: (node: ReferenceType | null) => void;
    setFloatingRef: (node: HTMLDivElement | null) => void;
    registerItemRef: (node: HTMLElement | null, index: number) => void;
    getReferenceProps: UseInteractionsReturn["getReferenceProps"];
    getFloatingProps: UseInteractionsReturn["getFloatingProps"];
    getItemProps: UseInteractionsReturn["getItemProps"];
    floatingStyles: CSSProperties;

    creatable: boolean;
}
