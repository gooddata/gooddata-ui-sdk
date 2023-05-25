// (C) 2019-2022 GoodData Corporation
import React from "react";
import { DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT } from "../../../../_staging/dashboard/fluidLayout/config.js";
import { useResizeWidthStatus } from "../../LayoutResizeContext.js";
import { Bullet } from "./Bullet.js";

export interface BulletsBarProps {
    visible: boolean;
    initialIndex: number;
    currentIndex: number;
}

const BULLETS_COUNT = DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT + 1;

export function BulletsBar() {
    const widthResizingStatus = useResizeWidthStatus();

    if (!widthResizingStatus.isResizingWidth) {
        return null;
    }

    return (
        <div className="gd-resize-bullets-bar">
            {[...Array(BULLETS_COUNT)].map((_, index) => (
                <Bullet
                    key={index}
                    index={index}
                    isInitial={widthResizingStatus.initialIndex === index}
                    isCurrent={widthResizingStatus.currentIndex === index}
                />
            ))}
        </div>
    );
}
