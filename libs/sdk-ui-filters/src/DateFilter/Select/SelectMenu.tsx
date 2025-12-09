// (C) 2007-2025 GoodData Corporation

import { ReactElement } from "react";

import cx from "classnames";
import { ControllerStateAndHelpers } from "downshift";

import { SelectHeading } from "./SelectHeading.js";
import { SelectOption } from "./SelectOption.js";
import { SelectSeparator } from "./SelectSeparator.js";
import { ISelectItem, ISelectItemOption } from "./types.js";
import { getSelectableItems } from "./utils.js";

export interface ISelectMenuProps<V> {
    items: Array<ISelectItem<V>>;
    selectedItem: ISelectItemOption<V>;
    highlightedIndex?: number;
    getItemProps: ControllerStateAndHelpers<ISelectItem<V>>["getItemProps"];
    getMenuProps: ControllerStateAndHelpers<ISelectItem<V>>["getMenuProps"];
    className?: string;
    optionClassName?: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export function SelectMenu<V extends {}>({
    items,
    selectedItem,
    highlightedIndex,
    getItemProps,
    getMenuProps,
    className,
    optionClassName,
}: ISelectMenuProps<V>): ReactElement {
    const selectableOptions = getSelectableItems(items);

    return (
        <div {...getMenuProps({ className: cx("gd-select-menu-wrapper", className) })}>
            <div className="gd-select-menu s-select-menu">
                {items.map((item, index) => {
                    if (item.type === "option") {
                        const isSelected = selectedItem && item ? selectedItem.value === item.value : false;
                        const isFocused =
                            highlightedIndex !== undefined && selectableOptions[highlightedIndex] && item
                                ? selectableOptions[highlightedIndex].value === item.value
                                : false;
                        const itemProps = getItemProps({
                            item,
                            index: selectableOptions.indexOf(item),
                            isSelected,
                            className: optionClassName,
                        });
                        return (
                            <SelectOption
                                key={`${item.type}-${item.value}`}
                                {...itemProps}
                                isFocused={isFocused}
                            >
                                {item.label}
                            </SelectOption>
                        );
                    } else if (item.type === "heading") {
                        return <SelectHeading key={`${item.type}-${item.label}`}>{item.label}</SelectHeading>;
                    } else if (item.type === "separator") {
                        return <SelectSeparator key={`${item.type}-${index}`} />;
                    }

                    return null;
                })}
            </div>
        </div>
    );
}
