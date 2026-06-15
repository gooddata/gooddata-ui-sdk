// (C) 2025-2026 GoodData Corporation

import { type KeyboardEvent, useId, useMemo } from "react";

import { makeKeyboardNavigation } from "../@utils/keyboardNavigation.js";

import type { IUiComboboxParams, IUiComboboxState } from "./types.js";
import { useComboboxChrome } from "./useComboboxChrome.js";
import { useComboboxSelection } from "./useComboboxSelection.js";

// Omit handlers where we want default behavior to fall through —
// `makeKeyboardNavigation` preventDefaults every registered action.
const comboboxKeys = makeKeyboardNavigation<{
    onArrowDown: Array<{ code: string }>;
    onArrowUp: Array<{ code: string }>;
    onEnter: Array<{ code: string[] }>;
    onEscape: Array<{ code: string }>;
}>({
    onArrowDown: [{ code: "ArrowDown" }],
    onArrowUp: [{ code: "ArrowUp" }],
    onEnter: [{ code: ["Enter", "NumpadEnter"] }],
    onEscape: [{ code: "Escape" }],
});

/** @internal */
export function useCombobox(params: IUiComboboxParams): IUiComboboxState {
    const { value, defaultValue = "", onValueChange, options, creatable = false } = params;

    const listboxId = useId();

    const chrome = useComboboxChrome();
    const selection = useComboboxSelection({
        options,
        value,
        defaultValue,
        onValueChange,
        creatable,
        setIsOpen: chrome.setIsOpen,
        setActiveIndex: chrome.setActiveIndex,
    });

    // Clamp on read so a filter that shrinks the list doesn't leave us
    // pointing past the end (Enter would otherwise be a silent no-op).
    const optionCount = selection.availableOptions.length;
    const safeActiveIndex = chrome.activeIndex == null ? null : Math.min(chrome.activeIndex, optionCount - 1);
    const activeOption =
        safeActiveIndex == null || optionCount === 0
            ? undefined
            : selection.availableOptions[safeActiveIndex];

    const onInputKeyDown = useMemo(() => {
        // Leave Enter unhandled when there's no selectable target so creatable
        // flows like UiTags (add tag on unhandled Enter) can react to it.
        const onEnter =
            chrome.isOpen && activeOption
                ? activeOption.disabled
                    ? () => undefined
                    : () => selection.selectOption(activeOption)
                : undefined;

        // Leave Escape unhandled when idle so the enclosing modal can dismiss.
        const hasSomethingToClose = chrome.isOpen || selection.inputValue.length > 0;
        const onEscape = hasSomethingToClose
            ? (event: KeyboardEvent<HTMLInputElement>) => {
                  event.nativeEvent.stopPropagation();
                  if (chrome.isOpen) {
                      chrome.setIsOpen(false);
                      return;
                  }
                  selection.resetState();
              }
            : undefined;

        return comboboxKeys<KeyboardEvent<HTMLInputElement>>({
            onArrowDown: () => chrome.focusByDelta(1, optionCount),
            onArrowUp: () => chrome.focusByDelta(-1, optionCount),
            onEnter,
            onEscape,
        });
    }, [chrome, selection, activeOption, optionCount]);

    return useMemo(
        () =>
            ({
                availableOptions: selection.availableOptions,
                inputValue: selection.inputValue,
                isOpen: chrome.isOpen,
                setIsOpen: chrome.setIsOpen,
                onInputChange: selection.onInputChange,
                onInputKeyDown,
                onInputBlur: selection.onInputBlur,
                activeIndex: chrome.activeIndex,
                setActiveIndex: chrome.setActiveIndex,
                activeOption,
                selectedOption: selection.selectedOption,
                selectOption: selection.selectOption,
                anchorRef: chrome.anchorRef,
                registerItemRef: chrome.registerItemRef,
                shouldRenderPopup: optionCount > 0,
                creatable,
                listboxId,
            }) satisfies IUiComboboxState,
        [chrome, selection, onInputKeyDown, activeOption, creatable, listboxId, optionCount],
    );
}
