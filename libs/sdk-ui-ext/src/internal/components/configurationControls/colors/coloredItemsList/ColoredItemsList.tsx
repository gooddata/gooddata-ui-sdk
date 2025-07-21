// (C) 2019-2025 GoodData Corporation
import { memo, useRef, useState } from "react";
import { DropdownList } from "@gooddata/sdk-ui-kit";
import { IColor, IColorPalette } from "@gooddata/sdk-model";

import ColoredItem from "./ColoredItem.js";
import { getSearchedItems } from "../../../../utils/colors.js";
import { IColoredItem } from "../../../../interfaces/Colors.js";

const VISIBLE_ITEMS_COUNT = 5;
const SEARCHFIELD_VISIBILITY_THRESHOLD = 7;
const DROPDOWN_BODY_WIDTH = 218;

export interface IColoredItemsListProps {
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

export default memo(function ColoredItemsList({
    colorPalette,
    inputItems,
    onSelect,
    showCustomPicker,
    disabled = false,
    isLoading = false,
}: IColoredItemsListProps) {
    const [searchString, setSearchString] = useState("");
    const listRef = useRef<HTMLDivElement>(null);

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

    const handleSelect = (selectedColorItem: IColoredItem, color: IColor) => {
        onSelect(selectedColorItem, color);
    };

    const effectiveSearchString = isSearchFieldVisible() ? searchString : "";
    const items: IColoredItem[] = getSearchedItems(inputItems, effectiveSearchString);

    return (
        <div ref={listRef}>
            <DropdownList
                width={DROPDOWN_BODY_WIDTH}
                showSearch={isSearchFieldVisible()}
                searchString={effectiveSearchString}
                onSearch={onSearch}
                onScrollStart={onScroll}
                items={items}
                className="gd-colored-items-list"
                maxVisibleItemsCount={VISIBLE_ITEMS_COUNT}
                isLoading={isLoading}
                renderItem={({ item }) => (
                    <ColoredItem
                        colorPalette={colorPalette}
                        onSelect={handleSelect}
                        showCustomPicker={showCustomPicker}
                        disabled={disabled}
                        item={item}
                    />
                )}
            />
        </div>
    );
});
