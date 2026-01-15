// (C) 2024-2026 GoodData Corporation

import { useMemo } from "react";

import ReactLoadingSkeleton from "react-loading-skeleton";

import { bem } from "../@utils/bem.js";

const { b, e } = bem("gd-ui-kit-skeleton");

/**
 * @internal
 */
export interface IUiSkeletonProps {
    /**
     * Number of items to render.
     */
    itemsCount?: number;

    /**
     * Height of the item, or items.
     */
    itemHeight?: (number | string) | (number | string)[];

    /**
     * Width of the item, or items.
     */
    itemWidth?: (number | string) | (number | string)[];

    /**
     * Padding of the item, or items.
     */
    itemPadding?: number | number[];

    /**
     * Gap between the items.
     */
    itemsGap?: number;

    /**
     * Whether to render the skeleton in a row or column.
     */
    direction?: "row" | "column";

    /**
     * Border radius of the item.
     */
    itemBorderRadius?: number;
}

/**
 * @internal
 */
export function UiSkeleton({
    itemsCount = 1,
    itemHeight = 24,
    itemPadding = 0,
    itemWidth,
    itemsGap = 10,
    direction = "column",
    itemBorderRadius,
}: IUiSkeletonProps) {
    const items = Array.from({ length: itemsCount }, (_, idx) => (
        <div
            className={e("item")}
            key={idx}
            style={{
                height:
                    typeof itemHeight === "number" || typeof itemHeight === "undefined"
                        ? itemHeight
                        : itemHeight[idx],
                width:
                    typeof itemWidth === "number" || typeof itemWidth === "undefined"
                        ? itemWidth
                        : itemWidth[idx],
                padding:
                    typeof itemPadding === "number"
                        ? `0 ${itemPadding ?? 0}px`
                        : `0 ${itemPadding[idx] ?? 0}px`,
            }}
        >
            <ReactLoadingSkeleton borderRadius={itemBorderRadius} />
        </div>
    ));

    const style = useMemo(() => ({ gap: itemsGap }), [itemsGap]);

    return (
        <div className={b({ direction })} style={style}>
            {items}
        </div>
    );
}
