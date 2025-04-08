// (C) 2019-2025 GoodData Corporation
import React, { useMemo, useCallback } from "react";
import DefaultDownshift, { ControllerStateAndHelpers } from "downshift";
import cx from "classnames";
import { getSelectableItems, itemToString } from "../Select/utils.js";
import {
    defaultVisibleItemsRange,
    getMedianIndex,
    VirtualizedSelectMenu,
} from "../Select/VirtualizedSelectMenu.js";
import { defaultImport } from "default-import";

import { findRelativeDateFilterOptionByValue } from "./utils.js";
import { DynamicSelectItem, DynamicSelectOption } from "./types.js";
import noop from "lodash/noop.js";

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

export const RelativeRangeDynamicSelect: React.FC<IRelativeRangeDynamicSelectProps> = (props) => {
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

    const handleChange = useCallback(
        (option: DynamicSelectOption | null): void => {
            if (option) {
                onChange(option.value);
            }
        },
        [onChange],
    );

    const handleInputValueChange = useCallback(
        (value: string): void => {
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

    const items = useMemo(() => getItems(inputValue), [getItems, inputValue]);
    const itemsByValue = useMemo(() => (value !== null ? getItems(value.toString()) : []), [getItems, value]);
    const selectedItem = useMemo(
        () =>
            // Downshift requires null as empty selected item, if we would pass undefined it would change
            // from controlled to uncontrolled component
            (value !== null && findRelativeDateFilterOptionByValue(itemsByValue, value)) || null,
        [value, itemsByValue],
    );
    const selectableItems = useMemo(() => getSelectableItems(items), [items]);
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
                highlightedIndex,
                setHighlightedIndex,
                selectItem,
            }: ControllerStateAndHelpers<DynamicSelectOption>) => {
                // Without this, highlight is not properly reset during filtering
                const effectiveHighlightedIndex =
                    highlightedIndex > selectableItems.length - 1 ? 0 : highlightedIndex;

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
                                    onFocus: openMenu,
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
};
