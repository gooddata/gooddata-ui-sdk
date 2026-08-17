// (C) 2019-2026 GoodData Corporation

import { type CSSProperties, useCallback, useLayoutEffect, useRef } from "react";

import cx from "classnames";
import { type ControllerStateAndHelpers } from "downshift";
import { range } from "lodash-es";

import { SelectHeading } from "./SelectHeading.js";
import { SelectOption } from "./SelectOption.js";
import { SelectSeparator } from "./SelectSeparator.js";
import { type ISelectItem, type ISelectItemOption, type SelectItemTypes } from "./types.js";
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

// oxlint-disable-next-line @typescript-eslint/no-empty-object-type
const optionGetter = <V extends {}>({
    items,
    selectedItem,
    highlightedIndex,
    getItemProps,
    optionClassName,
}: IOptionGetterProps<V>) => {
    function WrappedSelectOption({ index, style }: { index: number; style?: CSSProperties }) {
        const selectableOptions = getSelectableItems(items);
        const item = items[index];
        if (item.type === "option") {
            const itemProps = getItemProps({
                item,
                index: selectableOptions.indexOf(item),
                isSelected: selectedItem && item ? selectedItem.value === item.value : false,
                className: optionClassName,
            });
            return (
                <SelectOption
                    key={`${item.type}-${item.value}`}
                    {...itemProps}
                    isFocused={
                        selectableOptions[highlightedIndex!] && item
                            ? selectableOptions[highlightedIndex!].value === item.value
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
    }

    return WrappedSelectOption;
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

export function ScrollableSelectMenu<V extends object>({
    items,
    selectedItem,
    highlightedIndex,
    getItemProps,
    getMenuProps,
    className,
    optionClassName,
    visibleItemsRange = defaultVisibleItemsRange,
    inputValue,
    setHighlightedIndex,
}: ISelectMenuProps<V>) {
    const listRef = useRef<HTMLDivElement | null>(null);

    const scrollToIndex = useCallback(
        (index = highlightedIndex): void => {
            if (listRef.current) {
                const selectableOptions = getSelectableItems(items);
                const optionIndex = index === null ? getMedianIndex(getSelectableItems(items)) : index;
                const highlightedOption = selectableOptions[optionIndex!];
                const actualItemIndex = items.indexOf(highlightedOption);
                if (actualItemIndex >= 0) {
                    const container = listRef.current;
                    const heightFn = getItemHeight(items);
                    const itemOffset = items
                        .slice(0, actualItemIndex)
                        .reduce((sum, _it, i) => sum + heightFn(i), 0);
                    const itemHeight = heightFn(actualItemIndex);
                    const targetTop = Math.max(
                        0,
                        itemOffset - Math.max(0, container.clientHeight / 2 - itemHeight / 2),
                    );
                    container.scrollTo({ top: targetTop });
                }
            }
        },
        [highlightedIndex, items],
    );

    const scrollToTop = useCallback((): void => {
        if (!listRef.current) {
            return;
        }
        listRef.current.scrollTo({ top: 0 });
    }, []);

    const isMounted = useRef(false);
    const prev = useRef({ items, highlightedIndex, inputValue });

    // componentDidMount; layout effect so it runs in the commit phase, as the class lifecycle did
    useLayoutEffect(() => {
        if (inputValue) {
            scrollToIndex();
        } else {
            const medianIndex = getMedianIndex(getSelectableItems(items));
            setHighlightedIndex(medianIndex);
            scrollToIndex(medianIndex);
        }
        // this must run only once on mount, exactly as componentDidMount did
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // componentDidUpdate: runs after every commit except the initial one
    useLayoutEffect(() => {
        if (!isMounted.current) {
            isMounted.current = true;
            return;
        }

        const lastProps = prev.current;

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

        const hasOnlyOneItem = items.length === 1;

        if (isInputValueReset) {
            // We need to restore explicitly medianIndex scroll position immediately after inputValue reset
            // even though setHighlightedIndex(medianIndex) is called, because it takes effect after one tick
            scrollToIndex(medianIndex);
        } else if (isHighlightLoopedBack || isHighlightLoopedForward) {
            scrollToIndex();
        } else if (hasOnlyOneItem) {
            // if there is only one item, we need to explicitly scroll to top
            // in order to handle error messages being scrolled out of view
            scrollToTop();
        }

        prev.current = { items, highlightedIndex, inputValue };
    });

    const Option = optionGetter<V>({
        items,
        selectedItem: selectedItem!,
        highlightedIndex,
        getItemProps,
        optionClassName,
    });

    const middleItemIndex = getMedianIndex(getSelectableItems(items));
    const visibleIndexes = range(
        Math.max(middleItemIndex - visibleItemsRange, 0),
        Math.min(middleItemIndex + visibleItemsRange + 1, items.length),
    );

    const itemHeightFn = getItemHeight(items);
    const listHeight = visibleIndexes.reduce(
        (totalHeight, itemIndex) => totalHeight + itemHeightFn(itemIndex),
        0,
    );

    return (
        <div {...getMenuProps({ className: cx("gd-select-menu-wrapper", className) })}>
            <div className="gd-select-menu s-select-menu">
                <div
                    className="List"
                    ref={listRef}
                    style={{
                        height: listHeight,
                        width: "100%",
                        overflowY: items.length === 1 ? "hidden" : "auto",
                    }}
                >
                    {items.map((_, index) => (
                        <Option key={`item-${index}`} index={index} style={{ height: itemHeightFn(index) }} />
                    ))}
                </div>
            </div>
        </div>
    );
}
