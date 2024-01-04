// (C) 2007-2022 GoodData Corporation

import React from "react";
import Downshift, { ControllerStateAndHelpers, DownshiftProps, DownshiftState } from "downshift";
import cx from "classnames";
import noop from "lodash/noop.js";
import { SelectButton } from "./SelectButton.js";
import { SelectMenu } from "./SelectMenu.js";
import { ISelectItem, ISelectItemOption } from "./types.js";
import { getSelectableItems, itemToString } from "./utils.js";

const TypedDownshift = Downshift as unknown as React.ComponentClass<DownshiftProps<any>, DownshiftState<any>>;

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
        <TypedDownshift
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
        </TypedDownshift>
    );
};

Select.defaultProps = {
    onChange: noop,
    value: undefined,
    items: [],
    initialIsOpen: false,
    style: {},
};
