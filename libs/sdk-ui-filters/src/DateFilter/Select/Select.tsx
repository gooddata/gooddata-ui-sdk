// (C) 2007-2022 GoodData Corporation

import React from "react";
import Downshift, { ControllerStateAndHelpers } from "downshift";
import cx from "classnames";
import noop from "lodash/noop";
import { SelectButton } from "./SelectButton";
import { SelectMenu } from "./SelectMenu";
import { ISelectItem, ISelectItemOption } from "./types";
import { getSelectableItems, itemToString } from "./utils";

export interface ISelectProps<V> {
    items: Array<ISelectItem<V>>;
    value?: ISelectItemOption<V>["value"];
    initialIsOpen?: boolean;
    onChange?: (item: ISelectItemOption<V>) => void;
    className?: string;
    style?: React.CSSProperties;
}

// eslint-disable-next-line @typescript-eslint/ban-types
export const Select = <V extends {}>({
    onChange,
    value,
    items,
    initialIsOpen,
    className,
    style,
}: ISelectProps<V>): JSX.Element => {
    const selectableOptions = getSelectableItems(items);

    return (
        <Downshift
            onChange={onChange}
            itemToString={itemToString}
            selectedItem={selectableOptions.find((item) => item.value === value) || selectableOptions[0]}
            initialIsOpen={initialIsOpen}
        >
            {({
                getToggleButtonProps,
                getMenuProps,
                getItemProps,
                isOpen,
                selectedItem,
                highlightedIndex,
            }: ControllerStateAndHelpers<ISelectItemOption<V>>) => (
                <div className={cx("gd-select", className)} style={style}>
                    <SelectButton
                        isOpen={isOpen}
                        selectedItem={selectedItem}
                        getToggleButtonProps={getToggleButtonProps}
                    />
                    {isOpen ? (
                        <SelectMenu
                            items={items}
                            selectedItem={selectedItem}
                            highlightedIndex={highlightedIndex}
                            getItemProps={getItemProps}
                            getMenuProps={getMenuProps}
                        />
                    ) : null}
                </div>
            )}
        </Downshift>
    );
};

Select.defaultProps = {
    onChange: noop,
    value: undefined,
    items: [],
    initialIsOpen: false,
    style: {},
};
