// (C) 2019 GoodData Corporation

// tslint:disable member-ordering

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
}

export interface IDynamicSelectState {
    inputValue: string;
}

export class DynamicSelect extends React.Component<IDynamicSelectProps, IDynamicSelectState> {
    constructor(props: IDynamicSelectProps) {
        super(props);

        const selectedItem =
            props.value !== undefined
                ? findRelativeDateFilterOptionByValue(props.getItems(""), props.value)
                : null;

        this.state = {
            inputValue: selectedItem ? itemToString(selectedItem) : "",
        };
    }

    public inputRef = React.createRef<HTMLDivElement>();

    public static defaultProps: Partial<IDynamicSelectProps> = {
        onChange: noop,
        initialIsOpen: false,
        placeholder: undefined,
        value: undefined,
        className: undefined,
        style: undefined,
        visibleItemsRange: defaultVisibleItemsRange,
    };

    public onChange = (option: DynamicSelectOption | null) => {
        if (option) {
            this.props.onChange(option.value);
        }
    };

    public componentDidUpdate = (lastProps: IDynamicSelectProps) => {
        if (lastProps.value !== this.props.value) {
            const defaultItems = this.props.getItems(this.props.value.toString());
            const inputValue = findRelativeDateFilterOptionByValue(defaultItems, this.props.value).label;
            this.setState({
                inputValue,
            });
        }
    };

    public focus = () => {
        if (this.inputRef.current) {
            this.inputRef.current.focus();
        }
    };

    public onInputValueChanged = (inputValue: string) => {
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
                                        // Downshifts onInputValueChanged fires twice and with an old value
                                        // So we need to use our own callback
                                        onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
                                            this.onInputValueChanged(
                                                (event.target as HTMLInputElement).value,
                                            ),
                                        onBlur: () => {
                                            // reset to selected item on blur
                                            selectItem(selectedItem);
                                            this.setState({
                                                inputValue: selectedItem ? selectedItem.label : "",
                                            });
                                        },
                                    })}
                                />
                            </div>
                            {isOpen && <VirtualizedSelectMenu {...menuProps} />}
                        </div>
                    );
                }}
            </Downshift>
        );
    }
}
