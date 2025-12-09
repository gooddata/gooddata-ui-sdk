// (C) 2019-2025 GoodData Corporation

import { CSSProperties, ChangeEvent, useCallback, useMemo, useState } from "react";

import cx from "classnames";
import { defaultImport } from "default-import";
import DefaultDownshift, { ControllerStateAndHelpers } from "downshift";

import { DynamicSelectItem, DynamicSelectOption } from "./types.js";
import { findRelativeDateFilterOptionByValue, findRelativeDateFilterOptionIndexByLabel } from "./utils.js";
import {
    ISelectMenuProps,
    ScrollableSelectMenu,
    defaultVisibleItemsRange,
    getMedianIndex,
} from "../Select/ScrollableSelectMenu.js";
import { ISelectItemOption } from "../Select/types.js";
import { getSelectableItems, itemToString } from "../Select/utils.js";

// There are known compatibility issues between CommonJS (CJS) and ECMAScript modules (ESM).
// In ESM, default exports of CJS modules are wrapped in default properties instead of being exposed directly.
// https://github.com/microsoft/TypeScript/issues/52086#issuecomment-1385978414
const Downshift = defaultImport(DefaultDownshift);

export interface IRelativeRangeDynamicSelectProps {
    getItems: (inputValue: string) => DynamicSelectItem[];
    onChange?: (item: number) => void;
    initialIsOpen?: boolean;
    placeholder?: string;
    value?: number | null;
    inputValue: string;
    onInputValueChange: (value: string) => void;
    onBlur?: () => void;
    className?: string;
    style?: CSSProperties;
    optionClassName?: string;
    visibleItemsRange?: number;

    accessibilityConfig?: {
        labelId?: string;
        descriptionId?: string;
        ariaLabel?: string;
    };
}

export function RelativeRangeDynamicSelect({
    initialIsOpen = false,
    placeholder,
    getItems,
    value = null,
    className,
    style,
    optionClassName,
    visibleItemsRange = defaultVisibleItemsRange,
    accessibilityConfig,
    inputValue,
    onChange = () => {},
    onInputValueChange,
    onBlur,
}: IRelativeRangeDynamicSelectProps) {
    const [searchValue, setSearchValue] = useState("");

    const handleChange = useCallback(
        (option: DynamicSelectOption | null): void => {
            if (option) {
                setSearchValue(option.label);
                onChange(option.value);
            }
        },
        [onChange],
    );

    const handleInputValueChange = useCallback(
        (value: string): void => {
            setSearchValue(value);
            onInputValueChange(value);
        },
        [onInputValueChange],
    );

    const handleBlur = useCallback(
        (selectedItem: DynamicSelectOption | null, selectItem: (item: DynamicSelectOption) => void): void => {
            if (onBlur) {
                onBlur();
            } else if (selectedItem) {
                selectItem(selectedItem);
                handleInputValueChange(selectedItem.label);
            }
        },
        [onBlur, handleInputValueChange],
    );

    const handleChangeInput = useCallback(
        (event: ChangeEvent<HTMLInputElement>): void => {
            const currentValue = event.target.value;
            handleInputValueChange(currentValue);
        },
        [handleInputValueChange],
    );
    const itemsByValue = useMemo(() => (value === null ? [] : getItems(value.toString())), [getItems, value]);
    const selectedItem = useMemo(
        () =>
            // Downshift requires null as empty selected item, if we would pass undefined it would change
            // from controlled to uncontrolled component
            (value !== null && findRelativeDateFilterOptionByValue(itemsByValue, value)) || null,
        [value, itemsByValue],
    );

    const getItemsIncludingSelectedItem = useCallback(
        (searchValue: string) => {
            const items = getItems(searchValue);
            // when search value was reseted and selected item is not in the items, we need to add it to the items
            if (
                selectedItem &&
                searchValue.trim() !== selectedItem.label &&
                !findRelativeDateFilterOptionByValue(items, selectedItem.value)
            ) {
                if (selectedItem.value < 0) {
                    return [selectedItem, ...items];
                }
                return [...items, selectedItem];
            } else {
                return items;
            }
        },
        [getItems, selectedItem],
    );

    const items = useMemo(
        () => getItemsIncludingSelectedItem(searchValue),
        [getItemsIncludingSelectedItem, searchValue],
    );
    const selectableItems = useMemo(() => getSelectableItems(items), [items]);
    const isFiltered = searchValue.trim() !== "";
    const selectedItemIndex = selectedItem
        ? findRelativeDateFilterOptionIndexByLabel(selectableItems, selectedItem.label)
        : undefined;
    const defaultHighlightedIndex = isFiltered
        ? 0
        : selectedItem
          ? selectedItemIndex
          : getMedianIndex(selectableItems);

    const refreshHighlightedIndex = useCallback(
        (setHighlightedIndex: (index: number) => void, newSearchValue: string) => {
            const items = getItemsIncludingSelectedItem(newSearchValue);
            const selectableItems = getSelectableItems(items);
            if (!selectedItem) {
                setHighlightedIndex(getMedianIndex(selectableItems));
                return;
            }
            const highlightedIndex = findRelativeDateFilterOptionIndexByLabel(
                selectableItems,
                selectedItem.label,
            );
            setHighlightedIndex(highlightedIndex);
        },
        [selectedItem, getItemsIncludingSelectedItem],
    );

    return (
        <Downshift
            onChange={handleChange}
            itemToString={itemToString}
            initialIsOpen={initialIsOpen}
            selectedItem={selectedItem}
            itemCount={selectableItems.length}
            inputValue={inputValue}
            // automatically highlight (and therefore scroll to) the middle option if default items are displayed
            defaultHighlightedIndex={defaultHighlightedIndex}
        >
            {({
                getInputProps,
                getMenuProps,
                getItemProps,
                isOpen,
                openMenu,
                closeMenu,
                highlightedIndex,
                setHighlightedIndex,
                selectItem,
            }: ControllerStateAndHelpers<DynamicSelectOption>) => {
                // Without this, highlight is not properly reset during filtering
                const effectiveHighlightedIndex =
                    searchValue.trim() !== "" &&
                    highlightedIndex !== null &&
                    highlightedIndex > selectableItems.length - 1
                        ? 0
                        : (highlightedIndex ?? 0);

                const menuProps: ISelectMenuProps<number> = {
                    items,
                    selectedItem: selectedItem as ISelectItemOption<number>,
                    highlightedIndex: effectiveHighlightedIndex,
                    getItemProps: getItemProps as unknown as ISelectMenuProps<number>["getItemProps"],
                    getMenuProps: getMenuProps as unknown as ISelectMenuProps<number>["getMenuProps"],
                    className: "gd-dynamic-select-menu",
                    optionClassName,
                    inputValue,
                    setHighlightedIndex,
                    visibleItemsRange,
                };
                return (
                    <div
                        className={cx("gd-dynamic-select", className)}
                        style={style}
                        role={undefined}
                        aria-expanded={undefined}
                        aria-haspopup={undefined}
                        aria-labelledby={undefined}
                        onKeyDown={(e) => {
                            if (isOpen && e.key !== "Tab") {
                                e.stopPropagation();
                            }
                            if (isOpen && e.key === "Tab") {
                                closeMenu();
                            }
                        }}
                    >
                        <div className="gd-dynamic-select-input-wrapper">
                            <input
                                type="text"
                                className="s-relative-range-input gd-input-field"
                                aria-describedby={accessibilityConfig?.descriptionId}
                                aria-activedescendant={undefined}
                                {...getInputProps({
                                    role: "combobox",
                                    "aria-expanded": isOpen,
                                    "aria-haspopup": "listbox",
                                    "aria-autocomplete": "list",
                                    "aria-labelledby": accessibilityConfig?.labelId,
                                    placeholder,
                                    value: inputValue,
                                    onFocus: () => {
                                        if (searchValue.trim() !== "") {
                                            setSearchValue("");
                                            // set highlighted index in Downshift inner state
                                            // without making it fully controlled by this component
                                            // to avoid keyboard navigation handling
                                            refreshHighlightedIndex(setHighlightedIndex, "");
                                        }
                                        openMenu();
                                    },
                                    onChange: handleChangeInput,
                                    onBlur: () => handleBlur(selectedItem, selectItem),
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
