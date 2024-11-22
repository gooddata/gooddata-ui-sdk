// (C) 2022-2024 GoodData Corporation
import React, { ReactNode } from "react";
import { FormattedMessage } from "react-intl";
import cx from "classnames";
import { Typography } from "@gooddata/sdk-ui-kit";

import { BaseDraggableLayoutItem, DraggableItemType } from "../../../dragAndDrop/types.js";
import { getDashboardLayoutItemHeightForGrid } from "../../../../_staging/layout/sizing.js";
import { useEmptyContentHandlers } from "./useEmptyContentHandlers.js";
import { useDashboardItemPathAndSize } from "../../../dashboard/components/DashboardItemPathAndSizeContext.js";

const widgetCategoryMapping: Partial<{ [D in DraggableItemType]: string }> = {
    "insight-placeholder": "insight",
    insightListItem: "visualization",
    "kpi-placeholder": "kpi",
    richTextListItem: "richText",
    visualizationSwitcherListItem: "visualizationSwitcher",
    dashboardLayoutListItem: "dashboardLayout",
};
export const DropZoneMessage: React.FC = () => {
    return (
        <Typography tagName="p" className="drop-target-message">
            <FormattedMessage
                id="nestedLayout.emptyDropZone.message"
                values={{
                    b: (chunks: ReactNode) => <b>{chunks}</b>,
                    br: <br />,
                }}
            />
        </Typography>
    );
};

export const DefaultEmptyNestedLayoutDropZoneBody: React.FC = () => {
    return (
        <div className="drag-info-placeholder-box s-drag-info-placeholder-box">
            <DropZoneMessage />
        </div>
    );
};

export const EmptyNestedLayoutDropZone: React.FC = () => {
    const { itemPath } = useDashboardItemPathAndSize();
    const sectionPath = {
        parent: itemPath,
        sectionIndex: 0,
    };

    const { item, itemType, canDrop, isOver, dropRef } = useEmptyContentHandlers(sectionPath);

    const { gridHeight } = (item as BaseDraggableLayoutItem)?.size || {};

    const widgetCategory = widgetCategoryMapping[itemType];

    return (
        <div
            style={{
                minHeight: gridHeight ? getDashboardLayoutItemHeightForGrid(gridHeight) : undefined,
            }}
            className={cx("drag-info-placeholder", "dash-item", {
                [`type-${widgetCategory}`]: !!widgetCategory,
                "type-none": !widgetCategory,
                "s-last-drop-position": canDrop,
            })}
        >
            <div
                className={cx("drag-info-placeholder-inner", { "can-drop": canDrop, "is-over": isOver })}
                ref={dropRef}
            >
                {/* TODO INE: add this drop zone customization in M2 */}
                <DefaultEmptyNestedLayoutDropZoneBody />
                <div className="drag-info-placeholder-drop-target s-drag-info-placeholder-drop-target">
                    <div className="drop-target-inner">
                        <DropZoneMessage />
                    </div>
                </div>
            </div>
        </div>
    );
};
