// (C) 2019-2025 GoodData Corporation
import React from "react";

import cx from "classnames";

import { bemFactory } from "@gooddata/sdk-ui-kit";

import { DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT } from "../../../../_staging/dashboard/flexibleLayout/config.js";
import { useResizeWidthStatus } from "../../../dragAndDrop/index.js";

const { b, e } = bemFactory("gd-grid-layout-ruler");

export function BulletsBar() {
    const widthResizingStatus = useResizeWidthStatus();

    const isActive = widthResizingStatus.isResizingWidth && !widthResizingStatus.isItemNested;
    const initialIndex = isActive ? widthResizingStatus.initialIndex : undefined;
    const currentIndex = isActive ? widthResizingStatus.currentIndex : undefined;
    const columnsNum = DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT;

    return (
        <div
            className={b({ active: isActive })}
            style={{ "--columns-num": columnsNum } as React.CSSProperties}
            aria-hidden={true}
        >
            <div className={e("grid")}>
                {Array.from({ length: columnsNum }).map((_, index) => (
                    <div key={index} className={e("bullet-container")}>
                        <Bullet
                            index={index}
                            isActive={index === currentIndex}
                            isInitial={index === initialIndex}
                        />
                    </div>
                ))}
            </div>
            {/*
              The bullets are placed in the gaps between the grid columns by shifting them horizontally.
              This is a classic fencepost problem,
              meaning we need to add one extra bullet to cover all column edges.
            */}
            <div className={e("bullet-container", { last: true })}>
                <Bullet
                    index={DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT}
                    isActive={currentIndex === DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT}
                    isInitial={initialIndex === DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT}
                />
            </div>
        </div>
    );
}

export function Bullet({
    index,
    isActive,
    isInitial,
}: {
    index: number;
    isActive: boolean;
    isInitial: boolean;
}) {
    return (
        <div
            className={cx(`s-resize-bullet-${index}`, e("bullet", { active: isActive, initial: isInitial }))}
        />
    );
}
