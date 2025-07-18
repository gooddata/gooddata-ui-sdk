// (C) 2022-2025 GoodData Corporation
import { RefObject } from "react";
import classNames from "classnames";

import { useDashboardSelector, selectIsInEditMode, selectSettings } from "../../model/index.js";
import { useDashboardDrag } from "./useDashboardDrag.js";
import { getSizeInfo } from "../../_staging/layout/sizing.js";
import { INSIGHT_WIDGET_SIZE_INFO_DEFAULT } from "@gooddata/sdk-ui-ext";
import { IWrapInsightListItemWithDragProps } from "./types.js";
import { useWidgetDragEndHandler } from "./draggableWidget/useWidgetDragEndHandler.js";

/**
 * @internal
 */
export function WrapInsightListItemWithDrag({
    children,
    insight,
    onDragStart,
}: IWrapInsightListItemWithDragProps) {
    const isInEditMode = useDashboardSelector(selectIsInEditMode);
    const settings = useDashboardSelector(selectSettings);
    const handleDragEnd = useWidgetDragEndHandler();

    const [{ isDragging }, dragRef] = useDashboardDrag(
        {
            dragItem: () => {
                const sizeInfo = getSizeInfo(settings, "insight", insight);
                return {
                    type: "insightListItem",
                    insight,
                    size: {
                        gridHeight:
                            sizeInfo.height.default || INSIGHT_WIDGET_SIZE_INFO_DEFAULT.height.default,
                        gridWidth: sizeInfo.width.default || INSIGHT_WIDGET_SIZE_INFO_DEFAULT.width.default,
                    },
                };
            },
            canDrag: isInEditMode,
            hideDefaultPreview: false,
            dragEnd: handleDragEnd,
            dragStart: onDragStart,
        },
        [isInEditMode, insight, handleDragEnd],
    );

    return (
        <div
            className={classNames({ "is-dragging": isDragging })}
            ref={dragRef as unknown as RefObject<HTMLDivElement>}
        >
            {children}
        </div>
    );
}
