// (C) 2019-2025 GoodData Corporation
import React, { useCallback, useMemo, useState } from "react";

import cx from "classnames";
import { defaultImport } from "default-import";
import DefaultDownshift, { ControllerStateAndHelpers } from "downshift";
import noop from "lodash/noop.js";

import { DynamicSelectItem, DynamicSelectOption } from "./types.js";
import { findRelativeDateFilterOptionByValue, findRelativeDateFilterOptionIndexByLabel } from "./utils.js";
import { getSelectableItems, itemToString } from "../Select/utils.js";
import {
    VirtualizedSelectMenu,
    defaultVisibleItemsRange,
    getMedianIndex,
} from "../Select/VirtualizedSelectMenu.js";

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
    style?: React.CSSProperties;
    optionClassName?: string;
    visibleItemsRange?: number;

    accessibilityConfig?: {
        labelId?: string;
        descriptionId?: string;
        ariaLabel?: string;
    };
}

export function RelativeRangeDynamicSelect(props: IRelativeRangeDynamicSelectProps) {
    const {
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
        onChange = noop,
        onInputValueChange,
        onBlur,
    } = props;

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
            } else {
                selectItem(selectedItem);
                handleInputValueChange(selectedItem ? selectedItem.label : "");
            }
        },
        [onBlur, handleInputValueChange],
    );

    const handleChangeInput = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>): void => {
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
                highlightedIndex,
                setHighlightedIndex,
                selectItem,
            }: ControllerStateAndHelpers<DynamicSelectOption>) => {
                // Without this, highlight is not properly reset during filtering
                const effectiveHighlightedIndex =
                    searchValue.trim() !== "" && highlightedIndex > selectableItems.length - 1
                        ? 0
                        : highlightedIndex;

                const menuProps = {
                    items,
                    selectedItem,
                    highlightedIndex: effectiveHighlightedIndex,
                    getItemProps,
                    getMenuProps,
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
                        aria-labelledby={undefined}
                        aria-describedby={accessibilityConfig?.descriptionId}
                        onKeyDown={(e) => {
                            if (isOpen) {
                                e.stopPropagation();
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
                        {isOpen && items.length > 0 ? <VirtualizedSelectMenu {...menuProps} /> : null}
                    </div>
                );
            }}
        </Downshift>
    );
}
