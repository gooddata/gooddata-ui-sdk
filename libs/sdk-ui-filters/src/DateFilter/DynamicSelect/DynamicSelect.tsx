// (C) 2019-2022 GoodData Corporation
import React from "react";
import Downshift, { ControllerStateAndHelpers } from "downshift";
import cx from "classnames";
import { getSelectableItems, itemToString } from "../Select/utils";
import {
    defaultVisibleItemsRange,
    getMedianIndex,
    VirtualizedSelectMenu,
} from "../Select/VirtualizedSelectMenu";

import { findRelativeDateFilterOptionByValue } from "./utils";
import { DynamicSelectItem, DynamicSelectOption } from "./types";
import noop from "lodash/noop";
import { ISelectItemOption } from "../Select/types";

export interface IDynamicSelectProps {
    getItems: (inputValue: string) => DynamicSelectItem[];
    onChange?: (item: number) => void;
    initialIsOpen?: boolean;
    placeholder?: string;
    value?: number;
    className?: string;
    style?: React.CSSProperties;
    optionClassName?: string;
    visibleItemsRange?: number;
    customValueValidator?: (value: string) => boolean;
}

export interface IDynamicSelectState {
    inputValue: string;
}

export class DynamicSelect extends React.Component<IDynamicSelectProps, IDynamicSelectState> {
    constructor(props: IDynamicSelectProps) {
        super(props);

        const selectedItem =
            props.value !== undefined
                ? findRelativeDateFilterOptionByValue(
                      // pass the current value to make sure the searched options include it even if it is outside the default range
                      props.getItems(props.value.toString()),
                      props.value,
                  )
                : null;

        this.state = {
            inputValue: selectedItem ? itemToString(selectedItem) : props.value ? props.value.toString() : "",
        };
    }

    public inputRef = React.createRef<HTMLDivElement>();

    public static defaultProps: Pick<
        IDynamicSelectProps,
        "onChange" | "initialIsOpen" | "visibleItemsRange"
    > = {
        onChange: noop,
        initialIsOpen: false,
        visibleItemsRange: defaultVisibleItemsRange,
    };

    public onChange = (option: DynamicSelectOption | null): void => {
        if (option) {
            this.props.onChange(option.value);
        }
    };

    public componentDidUpdate = (lastProps: IDynamicSelectProps): void => {
        if (lastProps.value !== this.props.value) {
            const defaultItems = this.props.getItems(this.props.value.toString());
            const inputValue =
                findRelativeDateFilterOptionByValue(defaultItems, this.props.value)?.label ||
                this.props.value.toString();
            this.setState({
                inputValue,
            });
        }
    };

    public focus = (): void => {
        if (this.inputRef.current) {
            this.inputRef.current.focus();
        }
    };

    public blur = (): void => {
        if (this.inputRef.current) {
            this.inputRef.current.blur();
        }
    };

    public onInputValueChanged = (inputValue: string): void => {
        if (inputValue !== this.state.inputValue) {
            this.setState({ inputValue });
        }
    };

    public render() {
        const {
            initialIsOpen,
            placeholder,
            getItems,
            value = null,
            className,
            style,
            optionClassName,
            visibleItemsRange,
        } = this.props;

        const items = getItems(this.state.inputValue);
        // this is important to correctly find out selected option. It is different than 'items'.
        const itemsByValue = value !== null ? getItems(value.toString()) : [];
        // Downshift requires null as empty selected item, if we would pass undefined it would change
        // from controlled to uncontrolled component
        const selectedItem =
            (value !== null && findRelativeDateFilterOptionByValue(itemsByValue, value)) || null;

        const selectableItems = getSelectableItems(items);
        const isFiltered = this.state.inputValue.trim() !== "";

        return (
            <Downshift
                onChange={this.onChange}
                itemToString={itemToString}
                initialIsOpen={initialIsOpen}
                selectedItem={selectedItem}
                itemCount={selectableItems.length}
                inputValue={this.state.inputValue}
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
                    inputValue,
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
                        <div className={cx("gd-dynamic-select", className)} style={style}>
                            <div className="gd-dynamic-select-input-wrapper">
                                <input
                                    type="text"
                                    className="s-relative-range-input gd-input-field"
                                    {...getInputProps({
                                        ref: this.inputRef,
                                        placeholder: selectedItem ? selectedItem.label : placeholder,
                                        value: inputValue,
                                        onFocus: () => {
                                            this.setState({ inputValue: "" });
                                            openMenu();
                                        },
                                        onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
                                            this.onChangeHandler(event, selectItem),
                                        onBlur: () => this.onBlurHandler(selectedItem, selectItem, closeMenu),
                                    })}
                                />
                            </div>
                            {isOpen && items.length > 0 && <VirtualizedSelectMenu {...menuProps} />}
                        </div>
                    );
                }}
            </Downshift>
        );
    }

    private onBlurHandler = (
        selectedItem: ISelectItemOption<number>,
        selectItem: (item: ISelectItemOption<number>) => void,
        closeMenu: () => void,
    ): void => {
        const { customValueValidator, value } = this.props;
        if (customValueValidator) {
            closeMenu();
            this.onInputValueChanged(value?.toString());
        } else {
            selectItem(selectedItem);
            this.onInputValueChanged(selectedItem ? selectedItem.label : "");
        }
    };

    private onChangeHandler = (
        event: React.ChangeEvent<HTMLInputElement>,
        selectItem: (item: ISelectItemOption<number>) => void,
    ): void => {
        const { customValueValidator } = this.props;
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
        this.onInputValueChanged(currentValue);
    };
}
