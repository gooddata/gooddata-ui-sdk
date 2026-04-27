// (C) 2026 GoodData Corporation

import { type Ref, useMemo } from "react";

import classNames from "classnames";

import { type IInsight, insightVisualizationType } from "@gooddata/sdk-model";
import { type IInsightPickerItem, INSIGHT_WIDGET_SIZE_INFO_DEFAULT } from "@gooddata/sdk-ui-ext";
import { InsightListItemDate, InsightListItemTypeIcon, getDateTimeConfig } from "@gooddata/sdk-ui-kit";

import { getSizeInfo } from "../../../_staging/layout/sizing.js";
import { useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import { useWidgetSelection } from "../../../model/react/useWidgetSelection.js";
import { selectSettings } from "../../../model/store/config/configSelectors.js";
import { selectIsInEditMode } from "../../../model/store/renderMode/renderModeSelectors.js";
import { useWidgetDragEndHandler } from "../../dragAndDrop/draggableWidget/useWidgetDragEndHandler.js";
import { useDashboardDrag } from "../../dragAndDrop/useDashboardDrag.js";

/**
 * Props for a single insight picker list item.
 *
 * @internal
 */
export interface IInsightPickerListItemProps {
    item: IInsightPickerItem;
    type: string;
    /**
     * The original IInsight object, needed for drag-and-drop.
     * When undefined (e.g. semantic search results), the item is not draggable.
     */
    sourceInsight?: IInsight;
    metadataTimeZone?: string;
    /**
     * Called when the item is activated via keyboard (Enter/Space).
     * Receives the source insight so the caller can add it to the layout.
     */
    onActivate?: (insight: IInsight) => void;
    /**
     * Called when a drag-and-drop ends with a successful drop.
     */
    onDropped?: () => void;
}

/**
 * A single draggable insight item for the insight picker panel.
 * Renders a visualization type icon, title, and last-updated date.
 *
 * @internal
 */
export function InsightPickerListItem({
    item,
    type,
    sourceInsight,
    metadataTimeZone,
    onActivate,
    onDropped,
}: IInsightPickerListItemProps) {
    const isInEditMode = useDashboardSelector(selectIsInEditMode);
    const settings = useDashboardSelector(selectSettings);
    const handleDragEnd = useWidgetDragEndHandler();
    const { deselectWidgets } = useWidgetSelection();

    const canDrag = isInEditMode && !!sourceInsight;

    const [{ isDragging }, dragRef] = useDashboardDrag(
        {
            dragItem: () => {
                if (!sourceInsight) {
                    // Should not happen since canDrag is false, but satisfy types
                    return {
                        type: "insightListItem" as const,
                        insight: undefined!,
                        size: { gridHeight: 0, gridWidth: 0 },
                    };
                }
                const sizeInfo = getSizeInfo(settings, "insight", sourceInsight);
                return {
                    type: "insightListItem" as const,
                    insight: sourceInsight,
                    size: {
                        gridHeight:
                            sizeInfo.height.default || INSIGHT_WIDGET_SIZE_INFO_DEFAULT.height.default,
                        gridWidth: sizeInfo.width.default || INSIGHT_WIDGET_SIZE_INFO_DEFAULT.width.default,
                    },
                };
            },
            canDrag,
            hideDefaultPreview: false,
            dragEnd: (_item, monitor) => {
                handleDragEnd();
                if (monitor.didDrop()) {
                    onDropped?.();
                }
            },
            dragStart: () => deselectWidgets(),
        },
        [canDrag, sourceInsight, settings, handleDragEnd, onDropped],
    );

    const resolvedType = sourceInsight ? (insightVisualizationType(sourceInsight) ?? type) : type;

    const updated = item.updated ?? item.created;
    const dateConfig = useMemo(
        () => (updated ? getDateTimeConfig(updated, { dateTimezone: metadataTimeZone }) : undefined),
        [updated, metadataTimeZone],
    );

    return (
        <div
            className={classNames("gd-insight-picker-list-item", {
                "is-dragging": isDragging,
                "is-not-draggable": !canDrag,
            })}
            ref={dragRef as unknown as Ref<HTMLDivElement>}
            onClick={sourceInsight ? () => onActivate?.(sourceInsight) : undefined}
        >
            <div className="gd-insight-picker-list-item__icon">
                <InsightListItemTypeIcon type={resolvedType} />
            </div>
            <div className="gd-insight-picker-list-item__content">
                <div className="gd-insight-picker-list-item__title" title={item.title}>
                    {item.title}
                </div>
                {dateConfig ? (
                    <div className="gd-insight-picker-list-item__date">
                        <InsightListItemDate config={dateConfig} />
                    </div>
                ) : null}
            </div>
        </div>
    );
}
