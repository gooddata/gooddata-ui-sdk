// (C) 2022 GoodData Corporation
import React from "react";
import classNames from "classnames";
import { IInsight } from "@gooddata/sdk-model";

import { useDashboardSelector, selectIsInEditMode, selectSettings } from "../../../model";
import { useDashboardDrag } from "../useDashboardDrag";
import {
    CustomDashboardInsightListItemComponent,
    CustomDashboardInsightListItemComponentProps,
} from "../types";
import { useWidgetDragEndHandler } from "./useWidgetDragEndHandler";
import { getSizeInfo } from "../../../_staging/layout/sizing";
import { INSIGHT_WIDGET_SIZE_INFO_DEFAULT } from "@gooddata/sdk-ui-ext";

/**
 * @internal
 */
export interface IDraggableInsightListItemProps {
    ListItemComponent: CustomDashboardInsightListItemComponent;
    listItemComponentProps: CustomDashboardInsightListItemComponentProps;
    insight: IInsight;
}

/**
 * @internal
 */
export function DraggableInsightListItem({
    ListItemComponent,
    listItemComponentProps,
    insight,
}: IDraggableInsightListItemProps) {
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
        },
        [isInEditMode, insight, handleDragEnd],
    );

    return (
        <div className={classNames({ "is-dragging": isDragging })} ref={dragRef}>
            <ListItemComponent {...listItemComponentProps} />
        </div>
    );
}
