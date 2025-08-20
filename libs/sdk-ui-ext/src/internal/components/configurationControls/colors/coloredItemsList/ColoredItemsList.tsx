// (C) 2019-2025 GoodData Corporation
import React, { memo, useRef, useState } from "react";

import { WrappedComponentProps, injectIntl } from "react-intl";

import { IColor, IColorPalette } from "@gooddata/sdk-model";
import { DropdownList } from "@gooddata/sdk-ui-kit";

import ColoredItem from "./ColoredItem.js";
import { IColoredItem } from "../../../../interfaces/Colors.js";
import { getSearchedItems } from "../../../../utils/colors.js";

const VISIBLE_ITEMS_COUNT = 5;
const SEARCHFIELD_VISIBILITY_THRESHOLD = 7;
const DROPDOWN_BODY_WIDTH = 218;

export interface IColoredItemsListOwnProps {
    colorPalette: IColorPalette;
    inputItems: IColoredItem[];
    onSelect: (selectedColorItem: IColoredItem, color: IColor) => void;
    showCustomPicker?: boolean;
    disabled?: boolean;
    isLoading?: boolean;
}

export interface IColoredItemsListState {
    searchString?: string;
}

export type IColoredItemsListProps = IColoredItemsListOwnProps & WrappedComponentProps;

export const ColoredItemsList = memo(function ColoredItemsList(props: IColoredItemsListProps) {
    const {
        colorPalette,
        inputItems,
        onSelect: onSelectProp,
        showCustomPicker,
        disabled = false,
        isLoading = false,
    } = props;

    const [searchString, setSearchString] = useState<string>("");
    const listRef = useRef<any>();

    const onScroll = () => {
        if (listRef?.current) {
            const node = listRef.current;
            node.dispatchEvent(new CustomEvent("goodstrap.scrolled", { bubbles: true }));
        }
    };

    const closeOpenDropdownOnSearch = () => {
        // we have to close all dropdown ONE-3526
        // (IE has bug onClick on ClearIcon in Input doesn't fire click event and dropdown will not close)
        // so we can close it by onScroll event
        onScroll();
    };

    const onSearch = (searchString: string) => {
        setSearchString(searchString);
        closeOpenDropdownOnSearch();
    };

    const isSearchFieldVisible = () => {
        return inputItems.length > SEARCHFIELD_VISIBILITY_THRESHOLD && !isLoading;
    };

    const onSelect = (selectedColorItem: IColoredItem, color: IColor) => {
        onSelectProp(selectedColorItem, color);
    };

    const searchStringToUse = isSearchFieldVisible() ? searchString : "";
    const items: IColoredItem[] = getSearchedItems(inputItems, searchStringToUse);

    return (
        <div ref={listRef}>
            <DropdownList
                width={DROPDOWN_BODY_WIDTH}
                showSearch={isSearchFieldVisible()}
                searchString={searchStringToUse}
                onSearch={onSearch}
                onScrollStart={onScroll}
                items={items}
                className="gd-colored-items-list"
                maxVisibleItemsCount={VISIBLE_ITEMS_COUNT}
                isLoading={isLoading}
                renderItem={({ item }) => (
                    <ColoredItem
                        colorPalette={colorPalette}
                        onSelect={onSelect}
                        showCustomPicker={showCustomPicker}
                        disabled={disabled}
                        item={item}
                    />
                )}
            />
        </div>
    );
});

export default injectIntl(ColoredItemsList);
