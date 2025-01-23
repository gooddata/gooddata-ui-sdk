// (C) 2024-2025 GoodData Corporation
import React, { useMemo } from "react";
import ReactLoadingSkeleton from "react-loading-skeleton";
import { bem } from "../@utils/bem.js";

const { b, e } = bem("gd-ui-kit-skeleton");

/**
 * @internal
 */
export interface UiSkeletonProps {
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
     * Gap between the items.
     */
    itemsGap?: number;

    /**
     * Whether to render the skeleton in a row or column.
     */
    direction?: "row" | "column";
}

/**
 * @internal
 */
export function UiSkeleton({
    itemsCount = 1,
    itemHeight = 24,
    itemWidth,
    itemsGap = 10,
    direction = "column",
}: UiSkeletonProps) {
    const items = Array.from({ length: itemsCount }, (_, idx) => {
        const height =
            typeof itemHeight === "number" || typeof itemHeight === "undefined"
                ? itemHeight
                : itemHeight[idx];
        const width =
            typeof itemWidth === "number" || typeof itemWidth === "undefined" ? itemWidth : itemWidth[idx];

        const isFixedSize = typeof width === "number" && typeof height === "number";

        return (
            <div
                className={e("item")}
                key={idx}
                style={{
                    height,
                    width,
                    // For fixed sizes, disable shrinking
                    flexShrink: isFixedSize ? 0 : undefined,
                }}
            >
                <ReactLoadingSkeleton />
            </div>
        );
    });

    const style = useMemo(() => ({ gap: itemsGap }), [itemsGap]);

    return (
        <div className={b({ direction })} style={style}>
            {items}
        </div>
    );
}
