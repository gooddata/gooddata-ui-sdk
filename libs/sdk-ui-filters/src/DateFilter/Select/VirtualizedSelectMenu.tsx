// (C) 2019-2022 GoodData Corporation
import React from "react";
import { VariableSizeList as List, ListChildComponentProps } from "react-window";
import cx from "classnames";
import range from "lodash/range.js";
import { ControllerStateAndHelpers } from "downshift";
import { SelectOption } from "./SelectOption.js";
import { SelectHeading } from "./SelectHeading.js";
import { SelectSeparator } from "./SelectSeparator.js";
import { ISelectItem, ISelectItemOption, SelectItemTypes } from "./types.js";
import { getSelectableItems } from "./utils.js";

export interface IOptionGetterProps<V> {
    items: Array<ISelectItem<V>>;
    selectedItem: ISelectItemOption<V>;
    highlightedIndex?: number;
    getItemProps: ControllerStateAndHelpers<ISelectItem<V>>["getItemProps"];
    optionClassName?: string;
    visibleItemsRange?: number;
}
export interface ISelectMenuProps<V> extends IOptionGetterProps<V> {
    getMenuProps: ControllerStateAndHelpers<ISelectItem<V>>["getMenuProps"];
    className?: string;
    inputValue: string;
    setHighlightedIndex: (index: number) => void;
}

export const defaultVisibleItemsRange = 3;

// eslint-disable-next-line @typescript-eslint/ban-types
const optionGetter = <V extends {}>({
    items,
    selectedItem,
    highlightedIndex,
    getItemProps,
    optionClassName,
}: IOptionGetterProps<V>) => {
    return function WrappedSelectOption({ index, style }: ListChildComponentProps) {
        const selectableOptions = getSelectableItems(items);
        const item = items[index];
        if (item.type === "option") {
            return (
                <SelectOption
                    {...getItemProps({
                        key: `${item.type}-${item.value}`,
                        item,
                        index: selectableOptions.indexOf(item),
                        isSelected: selectedItem && item ? selectedItem.value === item.value : false,
                        className: optionClassName,
                    })}
                    isFocused={
                        selectableOptions[highlightedIndex] && item
                            ? selectableOptions[highlightedIndex].value === item.value
                            : false
                    }
                    style={style}
                >
                    {item.label}
                </SelectOption>
            );
        } else if (item.type === "heading" || item.type === "error") {
            // for now errors look the same as headings
            return (
                <SelectHeading key={`${item.type}-${item.label}`} style={style}>
                    {item.label}
                </SelectHeading>
            );
        } else if (item.type === "separator") {
            return <SelectSeparator key={`${item.type}-${index}`} style={style} />;
        }
        return null;
    };
};

const itemHeightByTypeMap: { [key in SelectItemTypes]: number } = {
    option: 32,
    heading: 22,
    error: 22,
    separator: 1,
};

const getItemHeight =
    (items: Array<ISelectItem<unknown>>) =>
    (index: number): number => {
        const itemType = items[index].type;
        return itemHeightByTypeMap[itemType];
    };

export const getMedianIndex = (array: any[]): number => Math.floor(array.length / 2);

export class VirtualizedSelectMenu<V> extends React.Component<ISelectMenuProps<V>> {
    // static cannot have <V>
    public static defaultProps: Partial<ISelectMenuProps<any>> = {
        selectedItem: null,
        visibleItemsRange: defaultVisibleItemsRange,
    };

    private listRef = React.createRef<List>();

    public render() {
        const {
            items,
            selectedItem,
            highlightedIndex,
            getItemProps,
            getMenuProps,
            className,
            optionClassName,
            visibleItemsRange,
        } = this.props;

        const Option = optionGetter<V>({
            items,
            selectedItem,
            highlightedIndex,
            getItemProps,
            optionClassName,
        });

        const middleItemIndex = getMedianIndex(getSelectableItems(items));
        const visibleIndexes = range(
            Math.max(middleItemIndex - visibleItemsRange, 0),
            Math.min(middleItemIndex + visibleItemsRange + 1, items.length),
        );

        const listHeight = visibleIndexes.reduce(
            (totalHeight, itemIndex) => totalHeight + getItemHeight(items)(itemIndex),
            0,
        );

        return (
            <div {...getMenuProps({ className: cx("gd-select-menu-wrapper", className) })}>
                <div className="gd-select-menu s-select-menu">
                    <List
                        className="List"
                        ref={this.listRef}
                        itemCount={items.length}
                        itemSize={getItemHeight(items)}
                        height={listHeight}
                        width="100%"
                        overscanCount={10} // initial value of 2 causes Downshifts scrollToView to break
                        estimatedItemSize={itemHeightByTypeMap.option}
                        // IE shows an unnecessary scrollbar when the list has only one item
                        // this means we have to explicitly disallow that
                        // we also cannot use className prop because react-window sets overflow using style
                        style={items.length === 1 ? { overflow: "hidden" } : undefined}
                    >
                        {Option}
                    </List>
                </div>
            </div>
        );
    }

    public scrollToIndex = (index = this.props.highlightedIndex): void => {
        if (this.listRef.current) {
            const { items } = this.props;
            const selectableOptions = getSelectableItems(items);
            const optionIndex = index !== null ? index : getMedianIndex(getSelectableItems(items));
            const highlightedOption = selectableOptions[optionIndex];
            // highlightedIndex ignores non selectable items, but scrollToItem doesn't.
            const actualItemIndex = items.indexOf(highlightedOption);
            this.listRef.current.scrollToItem(actualItemIndex, "center");
        }
    };

    public scrollToTop = (): void => {
        if (!this.listRef.current) {
            return;
        }
        this.listRef.current.scrollTo(0);
    };

    public componentDidUpdate = (lastProps: ISelectMenuProps<V>): void => {
        const { highlightedIndex, items, setHighlightedIndex, inputValue } = this.props;

        const lastSelectibleLastItemIndex = getSelectableItems(lastProps.items).length - 1;
        const selectiblelastItemIndex = getSelectableItems(items).length - 1;

        const lastHighlightIsAtStart = lastProps.highlightedIndex === 0;
        const lastHighlightIsAtEnd = lastProps.highlightedIndex === lastSelectibleLastItemIndex;
        const highlightIsAtStart = highlightedIndex === 0;
        const highlightIsAtEnd = highlightedIndex === selectiblelastItemIndex;
        const isHighlightLoopedBack = lastHighlightIsAtStart && highlightIsAtEnd;
        const isHighlightLoopedForward = lastHighlightIsAtEnd && highlightIsAtStart;

        const isInputValueEmpty = inputValue.trim() === "";
        const isInputValueReset = lastProps.inputValue.trim() !== "" && isInputValueEmpty;
        const isInputValueChanged = lastProps.inputValue.trim() !== inputValue.trim();

        const medianIndex = getMedianIndex(getSelectableItems(items));

        if (isInputValueReset) {
            // We need to set highlight to medianIndex manually after clearing inputValue
            setHighlightedIndex(medianIndex);
        } else if (isInputValueChanged) {
            // We need to set highlight to 0 manually after filtering
            setHighlightedIndex(0);
        }

        const hasOnlyOneItem = this.props.items.length === 1;

        if (isInputValueReset) {
            // We need to restore explicitly medianIndex scroll position immediately after inputValue reset
            // even though setHighlightedIndex(medianIndex) is called, because it takes effect after one tick
            this.scrollToIndex(medianIndex);
        } else if (isHighlightLoopedBack || isHighlightLoopedForward) {
            this.scrollToIndex();
        } else if (hasOnlyOneItem) {
            // if there is only one item, we need to explicitly scroll to top
            // in order to handle error messages being scrolled out of view
            this.scrollToTop();
        }
    };

    public componentDidMount(): void {
        if (!this.props.inputValue) {
            const medianIndex = getMedianIndex(getSelectableItems(this.props.items));
            this.props.setHighlightedIndex(medianIndex);
            this.scrollToIndex(medianIndex);
        } else {
            this.scrollToIndex();
        }
    }
}
