// (C) 2025 GoodData Corporation

import React from "react";
import { UiAsyncTableColumn } from "../types.js";
import { UiSkeleton } from "../../UiSkeleton/UiSkeleton.js";
import { UiPagedVirtualListSkeletonItemProps } from "../../UiPagedVirtualList/UiPagedVirtualList.js";
import {
    CHECKBOX_COLUMN_WIDTH,
    COLUMN_PADDING,
    MENU_COLUMN_WIDTH,
    SKELETON_ITEM_HEIGHT,
} from "./constants.js";

export function skeletonItemFactory<T extends { id: string }>(
    columns: UiAsyncTableColumn<T>[],
    hasCheckbox?: boolean,
): React.ComponentType<UiPagedVirtualListSkeletonItemProps> {
    return function SkeletonItem() {
        const columnWidths = columns.map((col) => (col.renderMenu ? MENU_COLUMN_WIDTH : col.width));
        const widths = hasCheckbox ? [CHECKBOX_COLUMN_WIDTH, ...columnWidths] : columnWidths;

        return (
            <UiSkeleton
                itemHeight={SKELETON_ITEM_HEIGHT}
                itemWidth={widths}
                itemPadding={COLUMN_PADDING}
                itemsCount={widths.length}
                direction="row"
                itemsGap={0}
            />
        );
    };
}
