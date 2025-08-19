// (C) 2022-2025 GoodData Corporation
import React, { ReactNode } from "react";

import cx from "classnames";
import { Col } from "react-grid-system";
import { FormattedMessage } from "react-intl";

import { Typography } from "@gooddata/sdk-ui-kit";

import { useNewSectionInsightListItemDropHandler } from "./useNewSectionInsightListItemDropHandler.js";
import { useNewSectionInsightPlaceholderDropHandler } from "./useNewSectionInsightPlaceholderDropHandler.js";
import { useNewSectionKpiPlaceholderDropHandler } from "./useNewSectionKpiPlaceholderDropHandler.js";
import { useNewSectionRichTextPlaceholderDropHandler } from "./useNewSectionRichTextPlaceholderDropHandler.js";
import { useNewSectionVisualizationSwitcherPlaceholderDropHandler } from "./useNewSectionVisualizationSwitcherPlaceholderDropHandler.js";
import { getDashboardLayoutItemHeightForGrid } from "../../../../_staging/layout/sizing.js";
import {
    selectWidgetPlaceholder,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../../model/index.js";
import { useDashboardComponentsContext } from "../../../dashboardContexts/index.js";
import {
    BaseDraggableLayoutItem,
    DraggableItemType,
    isInsightDraggableListItem,
    isInsightPlaceholderDraggableItem,
    isKpiPlaceholderDraggableItem,
    isRichTextDraggableListItem,
    isVisualizationSwitcherDraggableListItem,
    useDashboardDrop,
} from "../../../dragAndDrop/index.js";

const widgetCategoryMapping: Partial<{ [D in DraggableItemType]: string }> = {
    "insight-placeholder": "insight",
    insightListItem: "visualization",
    "kpi-placeholder": "kpi",
    richTextListItem: "richText",
    visualizationSwitcherListItem: "visualizationSwitcher",
};

export const EmptyDashboardDropZone: React.FC = () => {
    const dispatch = useDashboardDispatch();
    const widgetPlaceholder = useDashboardSelector(selectWidgetPlaceholder);

    const { EmptyLayoutDropZoneBodyComponent } = useDashboardComponentsContext();

    const handleInsightListItemDrop = useNewSectionInsightListItemDropHandler(0);
    const handleKpiPlaceholderDrop = useNewSectionKpiPlaceholderDropHandler(0);
    const handleInsightPlaceholderDrop = useNewSectionInsightPlaceholderDropHandler(0);
    const handleRichTextPlaceholderDrop = useNewSectionRichTextPlaceholderDropHandler(0);
    const handleVisualizationSwitcherPlaceholderDrop =
        useNewSectionVisualizationSwitcherPlaceholderDropHandler(0);

    const [{ canDrop, isOver, itemType, item }, dropRef] = useDashboardDrop(
        [
            "insightListItem",
            "kpi-placeholder",
            "insight-placeholder",
            "richTextListItem",
            "visualizationSwitcherListItem",
        ],
        {
            drop: (item) => {
                if (isInsightDraggableListItem(item)) {
                    handleInsightListItemDrop(item.insight);
                }
                if (isKpiPlaceholderDraggableItem(item)) {
                    handleKpiPlaceholderDrop();
                }
                if (isInsightPlaceholderDraggableItem(item)) {
                    handleInsightPlaceholderDrop();
                }
                if (isRichTextDraggableListItem(item)) {
                    handleRichTextPlaceholderDrop();
                }
                if (isVisualizationSwitcherDraggableListItem(item)) {
                    handleVisualizationSwitcherPlaceholderDrop();
                }
            },
        },
        [
            dispatch,
            widgetPlaceholder,
            handleInsightListItemDrop,
            handleKpiPlaceholderDrop,
            handleInsightPlaceholderDrop,
            handleVisualizationSwitcherPlaceholderDrop,
            handleRichTextPlaceholderDrop,
        ],
    );

    const { gridWidth = 12, gridHeight } = (item as BaseDraggableLayoutItem)?.size || {};

    const widgetCategory = widgetCategoryMapping[itemType];
    const message =
        widgetCategory === "visualization" || widgetCategory === "kpi" ? (
            <FormattedMessage id="newDashboard.dropInsight" />
        ) : (
            <FormattedMessage
                id="dropzone.widget.desc"
                values={{ b: (chunks: ReactNode) => <b>{chunks}</b> }}
            />
        );

    return (
        <Col
            xl={gridWidth}
            lg={gridWidth}
            md={gridWidth}
            sm={gridWidth}
            xs={gridWidth}
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
                <EmptyLayoutDropZoneBodyComponent />
                <div className="drag-info-placeholder-drop-target s-drag-info-placeholder-drop-target">
                    <div className="drop-target-inner">
                        <Typography
                            tagName="p"
                            className={cx("drop-target-message", `${widgetCategory}-drop-target`)}
                        >
                            {message}
                        </Typography>
                    </div>
                </div>
            </div>
        </Col>
    );
};
