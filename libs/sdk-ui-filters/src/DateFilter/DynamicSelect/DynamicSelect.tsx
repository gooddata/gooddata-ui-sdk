// (C) 2019-2026 GoodData Corporation

import { type CSSProperties, type ChangeEvent, useCallback, useEffect, useRef, useState } from "react";

import cx from "classnames";
import { defaultImport } from "default-import";
import DefaultDownshift, { type ControllerStateAndHelpers } from "downshift";

import {
    type ISelectMenuProps,
    ScrollableSelectMenu,
    defaultVisibleItemsRange,
    getMedianIndex,
} from "../Select/ScrollableSelectMenu.js";
import { type ISelectItemOption } from "../Select/types.js";
import { getSelectableItems, itemToString } from "../Select/utils.js";

import { type DynamicSelectItem, type DynamicSelectOption } from "./types.js";
import { findRelativeDateFilterOptionByValue } from "./utils.js";

// There are known compatibility issues between CommonJS (CJS) and ECMAScript modules (ESM).
// In ESM, default exports of CJS modules are wrapped in default properties instead of being exposed directly.
// https://github.com/microsoft/TypeScript/issues/52086#issuecomment-1385978414
const Downshift = defaultImport(DefaultDownshift);

export interface IDynamicSelectProps {
    getItems: (inputValue: string) => DynamicSelectItem[];
    onChange?: (item: number) => void;
    initialIsOpen?: boolean;
    placeholder?: string;
    value?: number;
    className?: string;
    style?: CSSProperties;
    optionClassName?: string;
    visibleItemsRange?: number;
    ariaLabel?: string;
    customValueValidator?: (value: string) => boolean;
}

export interface IDynamicSelectState {
    inputValue: string;
}

export function DynamicSelect({
    getItems,
    onChange = () => {},
    initialIsOpen = false,
    placeholder,
    value,
    className,
    style,
    optionClassName,
    visibleItemsRange = defaultVisibleItemsRange,
    ariaLabel,
    customValueValidator,
}: IDynamicSelectProps) {
    const [inputValue, setInputValue] = useState<string>(() => {
        const selectedItem =
            value === undefined
                ? null
                : findRelativeDateFilterOptionByValue(
                      // pass the current value to make sure the searched options include it even if it is outside the default range
                      getItems(value.toString()),
                      value,
                  );

        return selectedItem ? itemToString(selectedItem) : value ? value.toString() : "";
    });

    const inputRef = useRef<HTMLDivElement>(null);

    // keep the input value in sync with the controlled value prop, but not on the initial render
    const prevValue = useRef(value);
    useEffect(() => {
        if (prevValue.current !== value && value !== undefined) {
            const defaultItems = getItems(value.toString());
            setInputValue(
                findRelativeDateFilterOptionByValue(defaultItems, value)?.label || value.toString(),
            );
        }
        prevValue.current = value;
    }, [value, getItems]);

    const onInputValueChanged = useCallback((newInputValue: string): void => {
        setInputValue((currentInputValue) =>
            newInputValue === currentInputValue ? currentInputValue : newInputValue,
        );
    }, []);

    const handleChange = useCallback(
        (option: DynamicSelectOption | null): void => {
            if (option && onChange) {
                onChange(option.value);
            }
        },
        [onChange],
    );

    const onBlurHandler = useCallback(
        (
            selectedItem: ISelectItemOption<number>,
            selectItem: (item: ISelectItemOption<number>) => void,
            closeMenu: () => void,
        ): void => {
            if (customValueValidator) {
                closeMenu();
                onInputValueChanged(value?.toString() ?? "");
            } else {
                selectItem(selectedItem);
                onInputValueChanged(selectedItem.label);
            }
        },
        [customValueValidator, value, onInputValueChanged],
    );

    const onChangeHandler = useCallback(
        (
            event: ChangeEvent<HTMLInputElement>,
            selectItem: (item: ISelectItemOption<number>) => void,
        ): void => {
            const currentValue = (event.target as HTMLInputElement).value;
            if (customValueValidator?.(currentValue)) {
                selectItem({
                    type: "option",
                    value: Number(currentValue),
                    label: currentValue,
                });
            }
            // Downshifts onInputValueChanged fires twice and with an old value,
            // so we need to use our own callback
            onInputValueChanged(currentValue);
        },
        [customValueValidator, onInputValueChanged],
    );

    const effectiveValue = value ?? null;

    const items = getItems(inputValue);
    // this is important to correctly find out selected option. It is different than 'items'.
    const itemsByValue = effectiveValue === null ? [] : getItems(effectiveValue.toString());
    // Downshift requires null as empty selected item, if we would pass undefined it would change
    // from controlled to uncontrolled component
    const selectedItem =
        (effectiveValue !== null && findRelativeDateFilterOptionByValue(itemsByValue, effectiveValue)) ||
        null;

    const selectableItems = getSelectableItems(items);
    const isFiltered = inputValue.trim() !== "";

    return (
        <Downshift
            onChange={handleChange}
            itemToString={itemToString}
            initialIsOpen={initialIsOpen}
            selectedItem={selectedItem}
            itemCount={selectableItems.length}
            inputValue={inputValue}
            // automatically highlight (and therefore scroll to) the middle option if default items are displayed
            defaultHighlightedIndex={selectedItem || isFiltered ? 0 : getMedianIndex(selectableItems)}
        >
            {({
                getInputProps,
                getMenuProps,
                getItemProps,
                isOpen,
                openMenu,
                closeMenu,
                inputValue: downshiftInputValue,
                highlightedIndex,
                setHighlightedIndex,
                selectItem,
            }: ControllerStateAndHelpers<DynamicSelectOption>) => {
                // Without this, highlight is not properly reset during filtering
                const effectiveHighlightedIndex =
                    highlightedIndex === null || highlightedIndex > selectableItems.length - 1
                        ? 0
                        : highlightedIndex;
                const effectiveInputValue = downshiftInputValue ?? "";

                const menuProps: ISelectMenuProps<number> = {
                    items,
                    selectedItem: selectedItem as ISelectItemOption<number>,
                    highlightedIndex: effectiveHighlightedIndex,
                    getItemProps: getItemProps as unknown as ISelectMenuProps<number>["getItemProps"],
                    getMenuProps: getMenuProps as unknown as ISelectMenuProps<number>["getMenuProps"],
                    className: "gd-dynamic-select-menu",
                    optionClassName,
                    inputValue: effectiveInputValue,
                    setHighlightedIndex,
                    visibleItemsRange,
                };

                return (
                    <div
                        className={cx("gd-dynamic-select", className)}
                        style={style}
                        aria-labelledby={undefined}
                    >
                        <div className="gd-dynamic-select-input-wrapper">
                            <input
                                type="text"
                                className="s-relative-range-input gd-input-field"
                                aria-label={ariaLabel}
                                {...getInputProps({
                                    "aria-labelledby": undefined,
                                    ref: inputRef,
                                    placeholder: selectedItem ? selectedItem.label : placeholder,
                                    value: effectiveInputValue,
                                    onFocus: () => {
                                        setInputValue("");
                                        openMenu();
                                    },
                                    onChange: (event: ChangeEvent<HTMLInputElement>) =>
                                        onChangeHandler(event, selectItem),
                                    onBlur: () => {
                                        onBlurHandler(selectedItem!, selectItem, closeMenu);
                                    },
                                })}
                            />
                        </div>
                        {isOpen && items.length > 0 ? (
                            <ScrollableSelectMenu {...(menuProps as unknown as ISelectMenuProps<object>)} />
                        ) : null}
                    </div>
                );
            }}
        </Downshift>
    );
}
