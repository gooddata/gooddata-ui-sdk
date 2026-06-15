// (C) 2025-2026 GoodData Corporation

import type { KeyboardEvent, RefObject } from "react";

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
     * Called whenever the input value changes — on typing, on Escape reset,
     * and when an option is selected. The combobox is fully controlled when
     * paired with `value`; consumers that need to distinguish selection from
     * typing should inspect the current `selectedOption` state.
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
    /**
     * Drives popup visibility. Sync combobox sets it to `availableOptions.length > 0`;
     * async sources keep it `true` so status rows (loading / error / no-match) can show.
     */
    shouldRenderPopup: boolean;
    /** Anchor for the popup — typically the input's outer wrapper, so the popup matches the visible field width. */
    anchorRef: RefObject<HTMLElement | null>;
    registerItemRef: (node: HTMLElement | null, index: number) => void;

    creatable: boolean;
    /**
     * Stable id of the `<ul role="listbox">`. The input advertises it via
     * `aria-controls`; the listbox sets it as its `id`.
     */
    listboxId: string;
}
