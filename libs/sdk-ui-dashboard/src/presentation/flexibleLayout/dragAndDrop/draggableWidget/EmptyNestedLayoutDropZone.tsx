// (C) 2022-2025 GoodData Corporation

import { ReactNode, Ref, useEffect } from "react";

import cx from "classnames";
import { FormattedMessage, defineMessages } from "react-intl";

import { Typography } from "@gooddata/sdk-ui-kit";

import { useEmptyContentHandlers } from "./useEmptyContentHandlers.js";
import { useWidgetDragHoverHandlers } from "./useWidgetDragHoverHandlers.js";
import { useDashboardItemPathAndSize } from "../../../dashboard/components/DashboardItemPathAndSizeContext.js";
import { DraggableItemType } from "../../../dragAndDrop/types.js";

const widgetCategoryMapping: Partial<{ [D in DraggableItemType]: string }> = {
    "insight-placeholder": "insight",
    insightListItem: "visualization",
    "kpi-placeholder": "kpi",
    richTextListItem: "richText",
    visualizationSwitcherListItem: "visualizationSwitcher",
    dashboardLayoutListItem: "dashboardLayout",
};

const messages = defineMessages({
    dropZoneMessage: {
        id: "nestedLayout.emptyDropZone.message",
    },
    dropZoneMessageActive: {
        id: "nestedLayout.emptyDropZone.active.message",
    },
});

export function DropZoneMessage({ canDrop = false }: { canDrop?: boolean }) {
    return (
        <Typography tagName="p" className="drop-target-message">
            <FormattedMessage
                id={canDrop ? messages.dropZoneMessageActive.id : messages.dropZoneMessage.id}
                values={{
                    b: (chunks: ReactNode) => <b>{chunks}</b>,
                    br: <br />,
                }}
            />
        </Typography>
    );
}

export function DefaultEmptyNestedLayoutDropZoneBody() {
    return (
        <div className="drag-info-placeholder-box drag-info-empty-nested-layout s-drag-info-placeholder-box">
            <DropZoneMessage />
        </div>
    );
}

export function EmptyNestedLayoutDropZone() {
    const { layoutItemPath } = useDashboardItemPathAndSize();
    const sectionPath = {
        parent: layoutItemPath,
        sectionIndex: 0,
    };

    const { itemType, canDrop, isOver, dropRef } = useEmptyContentHandlers(sectionPath);
    const { handleDragHoverEnd } = useWidgetDragHoverHandlers();

    useEffect(() => {
        if (isOver) {
            // hide section end drop zone in case when user drags widget to empty nested layout drag zone
            handleDragHoverEnd();
        }
    }, [isOver, handleDragHoverEnd]);

    const widgetCategory = widgetCategoryMapping[itemType];

    return (
        <div
            className={cx("drag-info-placeholder", "dash-item", {
                [`type-${widgetCategory}`]: !!widgetCategory,
                "type-none": !widgetCategory,
                "s-last-drop-position": canDrop,
            })}
        >
            <div
                className={cx("drag-info-placeholder-inner", { "can-drop": canDrop, "is-over": isOver })}
                ref={dropRef as unknown as Ref<HTMLDivElement> | undefined}
            >
                <DefaultEmptyNestedLayoutDropZoneBody />
                <div className="drag-info-placeholder-drop-target s-drag-info-placeholder-drop-target">
                    <div className="drop-target-inner">
                        <DropZoneMessage canDrop={canDrop} />
                    </div>
                </div>
            </div>
        </div>
    );
}
