// (C) 2007-2025 GoodData Corporation

import { CSSProperties, ComponentClass, ReactElement } from "react";

import cx from "classnames";
import Downshift, { ControllerStateAndHelpers, DownshiftProps, DownshiftState } from "downshift";

import { SelectButton } from "./SelectButton.js";
import { SelectMenu } from "./SelectMenu.js";
import { ISelectItem, ISelectItemOption } from "./types.js";
import { getSelectableItems, itemToString } from "./utils.js";

const TypedDownshift = Downshift as unknown as ComponentClass<DownshiftProps<any>, DownshiftState<any>>;

export interface ISelectProps<V> {
    items: Array<ISelectItem<V>>;
    value?: ISelectItemOption<V>["value"];
    initialIsOpen?: boolean;
    onChange?: (item: ISelectItemOption<V>) => void;
    className?: string;
    style?: CSSProperties;
}

const DEFAULT_ITEMS = [];
const DEFAULT_STYLES: CSSProperties = {};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export function Select<V extends {}>({
    onChange = () => {},
    value,
    items = DEFAULT_ITEMS,
    initialIsOpen = false,
    className,
    style = DEFAULT_STYLES,
}: ISelectProps<V>): ReactElement {
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
}
