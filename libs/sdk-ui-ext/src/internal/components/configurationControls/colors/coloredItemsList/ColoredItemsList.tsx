// (C) 2019-2026 GoodData Corporation

import { memo, useRef, useState } from "react";

import { type IColor, type IColorPalette, isMeasureDescriptor } from "@gooddata/sdk-model";
import { type IChartFillConfig } from "@gooddata/sdk-ui-charts";
import { DropdownList, GOODSTRAP_SCROLLED_EVENT } from "@gooddata/sdk-ui-kit";

import { ColoredItem } from "./ColoredItem.js";
import { type IColoredItem } from "../../../../interfaces/Colors.js";
import { getSearchedItems } from "../../../../utils/colors.js";

const DROPDOWN_MAX_HEIGHT = 150;
const SEARCH_FIELD_VISIBILITY_THRESHOLD = 7;
const DROPDOWN_BODY_WIDTH = 218;

export interface IColoredItemsListProps {
    colorPalette: IColorPalette;
    inputItems: IColoredItem[];
    onSelect: (selectedColorItem: IColoredItem, color: IColor) => void;
    disabled?: boolean;
    isLoading?: boolean;
    chartFill?: IChartFillConfig;
    chartFillIgnoredMeasures: string[];
}

function isChartFillIgnoredMeasure(item: IColoredItem, chartFillIgnoredMeasures: string[]) {
    return (
        isMeasureDescriptor(item.mappingHeader) &&
        chartFillIgnoredMeasures.includes(item.mappingHeader.measureHeaderItem.localIdentifier)
    );
}

export const ColoredItemsList = memo(function ColoredItemsList(props: IColoredItemsListProps) {
    const {
        colorPalette,
        inputItems,
        onSelect: onSelectProp,
        disabled = false,
        isLoading = false,
        chartFill,
        chartFillIgnoredMeasures,
    } = props;

    const [searchString, setSearchString] = useState<string>("");
    const listRef = useRef<any>(null);

    const onScroll = () => {
        if (listRef?.current) {
            const node = listRef.current;
            node.dispatchEvent(new CustomEvent(GOODSTRAP_SCROLLED_EVENT, { bubbles: true }));
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
        return inputItems.length > SEARCH_FIELD_VISIBILITY_THRESHOLD && !isLoading;
    };

    const onSelect = (selectedColorItem: IColoredItem, color: IColor) => {
        onSelectProp(selectedColorItem, color);
    };

    const searchStringToUse = isSearchFieldVisible() ? searchString : "";
    const items: IColoredItem[] = getSearchedItems(inputItems, searchStringToUse);

    // if pattern fill was explicitly mapped to measure, use its name as an index for that item,
    // otherwise use the index matching the used color
    const itemPatternFillIndexes = items.map((item, index) => {
        if (!isMeasureDescriptor(item.mappingHeader)) {
            return index;
        }
        const localId = item.mappingHeader.measureHeaderItem.localIdentifier;
        return chartFill?.measureToPatternName?.[localId] ?? index;
    });

    return (
        <div className="adi-color-configuration" ref={listRef}>
            <DropdownList
                width={DROPDOWN_BODY_WIDTH}
                showSearch={isSearchFieldVisible()}
                searchString={searchStringToUse}
                onSearch={onSearch}
                onScroll={onScroll}
                items={items}
                className="gd-colored-items-list"
                maxHeight={DROPDOWN_MAX_HEIGHT}
                isLoading={isLoading}
                renderItem={({ item, rowIndex }) => {
                    const appliedChartFill = isChartFillIgnoredMeasure(item, chartFillIgnoredMeasures)
                        ? undefined
                        : chartFill;
                    return (
                        <ColoredItem
                            colorPalette={colorPalette}
                            onSelect={onSelect}
                            disabled={disabled}
                            item={item}
                            chartFill={appliedChartFill}
                            patternFillIndex={itemPatternFillIndexes[rowIndex]}
                        />
                    );
                }}
            />
        </div>
    );
});
