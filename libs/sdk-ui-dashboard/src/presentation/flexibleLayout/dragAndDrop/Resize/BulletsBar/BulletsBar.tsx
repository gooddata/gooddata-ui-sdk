// (C) 2019-2024 GoodData Corporation
import React from "react";

import { DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT } from "../../../../../_staging/dashboard/flexibleLayout/config.js";
import { useResizeWidthStatus } from "../../../../dragAndDrop/index.js";

import { Bullet } from "./Bullet.js";

export const BulletsBar: React.FC = () => {
    const widthResizingStatus = useResizeWidthStatus();

    if (!widthResizingStatus.isResizingWidth) {
        return null;
    }

    // CSS Grid: grid setup copies the main dashboard grid with 12 columns. Each column contains one bullet
    // that marks the grid column start. The last bullet is rendered next to the grid in flex container and
    // shifted via CSS to the left so, it is placed directly on the grid line. This could be done entirely
    // in CSS, but we need to be able to style bullets based on state (current, initial).
    return (
        <div className="gd-grid-layout__ruler">
            <div className="gd-grid-layout__container--root">
                {[...Array(DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT)].map((_, index) => (
                    <div key={index} className="gd-grid-layout__item--span-1">
                        <Bullet
                            key={index}
                            index={index}
                            isInitial={widthResizingStatus.initialIndex === index}
                            isCurrent={widthResizingStatus.currentIndex === index}
                        />
                        {index === DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT - 1 ? (
                            <Bullet
                                index={DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT}
                                isInitial={
                                    widthResizingStatus.initialIndex === DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT
                                }
                                isCurrent={
                                    widthResizingStatus.currentIndex === DASHBOARD_LAYOUT_GRID_COLUMNS_COUNT
                                }
                                isLast={true}
                            />
                        ) : null}
                    </div>
                ))}
            </div>
        </div>
    );
};
