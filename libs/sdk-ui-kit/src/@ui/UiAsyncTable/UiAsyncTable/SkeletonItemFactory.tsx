// (C) 2025 GoodData Corporation

import { ComponentType, useEffect, useMemo, useState } from "react";

import { isEqual } from "lodash-es";

import { COLUMN_PADDING, SKELETON_ITEM_HEIGHT } from "./constants.js";
import { getColumnWidths } from "./utils.js";
import { UiPagedVirtualListSkeletonItemProps } from "../../UiPagedVirtualList/UiPagedVirtualList.js";
import { UiSkeleton } from "../../UiSkeleton/UiSkeleton.js";
import { UiAsyncTableBulkAction, UiAsyncTableColumn } from "../types.js";

export function skeletonItemFactory(
    columnWidths: Array<number>,
): ComponentType<UiPagedVirtualListSkeletonItemProps> {
    function SkeletonItem() {
        return (
            <UiSkeleton
                itemHeight={SKELETON_ITEM_HEIGHT}
                itemWidth={columnWidths}
                itemPadding={COLUMN_PADDING}
                itemsCount={columnWidths.length}
                direction="row"
                itemsGap={0}
            />
        );
    }

    return SkeletonItem;
}

export const useSkeletonItem = <T extends { id: string }>(
    columns: UiAsyncTableColumn<T>[],
    bulkActions: UiAsyncTableBulkAction[] | undefined,
    isLargeRow: boolean,
) => {
    const hasCheckbox = !!bulkActions;
    const computedColumnWidths = getColumnWidths(columns, hasCheckbox, isLargeRow);
    const [columnWidths, setColumnWidths] = useState(computedColumnWidths);

    // keep the column widths reference unless the actual columns widths change,
    // this prevents the skeleton item from re-rendering when
    // irrelevant columns properties change(e.g. permissions)
    useEffect(() => {
        if (!isEqual(columnWidths, computedColumnWidths)) {
            setColumnWidths(computedColumnWidths);
        }
    }, [computedColumnWidths, columnWidths]);

    return useMemo(
        () => skeletonItemFactory(columnWidths.filter((w): w is number => w !== undefined)),
        [columnWidths],
    );
};
