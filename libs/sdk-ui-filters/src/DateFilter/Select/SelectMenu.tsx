// (C) 2007-2019 GoodData Corporation
import React from "react";
import cx from "classnames";
import { ControllerStateAndHelpers } from "downshift";
import { SelectOption } from "./SelectOption";
import { SelectHeading } from "./SelectHeading";
import { SelectSeparator } from "./SelectSeparator";
import { ISelectItem, ISelectItemOption } from "./types";
import { getSelectableItems } from "./utils";

export interface ISelectMenuProps<V> {
    items: Array<ISelectItem<V>>;
    selectedItem: ISelectItemOption<V>;
    highlightedIndex?: number;
    getItemProps: ControllerStateAndHelpers<ISelectItem<V>>["getItemProps"];
    getMenuProps: ControllerStateAndHelpers<ISelectItem<V>>["getMenuProps"];
    className?: string;
    optionClassName?: string;
}

export const SelectMenu = <V extends {}>({
    items,
    selectedItem,
    highlightedIndex,
    getItemProps,
    getMenuProps,
    className,
    optionClassName,
}: ISelectMenuProps<V>) => {
    const selectableOptions = getSelectableItems(items);

    return (
        <div {...getMenuProps({ className: cx("gd-select-menu-wrapper", className) })}>
            <div className="gd-select-menu s-select-menu">
                {items.map((item, index) => {
                    if (item.type === "option") {
                        const isSelected = selectedItem && item ? selectedItem.value === item.value : false;
                        const isFocused =
                            selectableOptions[highlightedIndex] && item
                                ? selectableOptions[highlightedIndex].value === item.value
                                : false;
                        return (
                            <SelectOption
                                {...getItemProps({
                                    key: `${item.type}-${item.value}`,
                                    item,
                                    index: selectableOptions.indexOf(item),
                                    isSelected,
                                    className: optionClassName,
                                })}
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
};
