// (C) 2024 GoodData Corporation
import React, { useMemo } from "react";
import ReactLoadingSkeleton from "react-loading-skeleton";
import { bem } from "../bem.js";

const { b, e } = bem("gd-ui-ext-skeleton");

export interface ISkeletonProps {
    itemHeight: number;
    itemsCount?: number;
    gap?: number;
}

export function Skeleton({ itemsCount = 1, itemHeight, gap = 10 }: ISkeletonProps) {
    const items = Array.from({ length: itemsCount }, (_, idx) => (
        <ReactLoadingSkeleton key={idx} className={e("item")} height={itemHeight} />
    ));

    const style = useMemo(() => ({ gap }), [gap]);

    return (
        <div className={b()} style={style}>
            {items}
        </div>
    );
}
