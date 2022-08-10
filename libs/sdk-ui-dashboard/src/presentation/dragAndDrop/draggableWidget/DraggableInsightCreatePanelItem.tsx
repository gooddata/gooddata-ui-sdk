// (C) 2022 GoodData Corporation
import React from "react";

import { uiActions, selectIsInEditMode, useDashboardDispatch, useDashboardSelector } from "../../../model";
import { useDashboardDrag } from "../useDashboardDrag";
import {
    CustomDashboardInsightCreatePanelItemComponent,
    CustomDashboardInsightCreatePanelItemComponentProps,
} from "../types";

/**
 * @internal
 */
export interface IDraggableInsightCreatePanelItemProps {
    CreatePanelItemComponent: CustomDashboardInsightCreatePanelItemComponent;
    createPanelItemComponentProps: CustomDashboardInsightCreatePanelItemComponentProps;
}

/**
 * @internal
 */
export const DraggableInsightCreatePanelItem: React.FC<IDraggableInsightCreatePanelItemProps> = ({
    CreatePanelItemComponent,
    createPanelItemComponentProps,
}) => {
    const dispatch = useDashboardDispatch();
    const isInEditMode = useDashboardSelector(selectIsInEditMode);

    const [, dragRef] = useDashboardDrag({
        dragItem: {
            type: "insight-placeholder",
        },
        canDrag: isInEditMode && !createPanelItemComponentProps.disabled,
        hideDefaultPreview: false,
        dragEnd: (_, monitor) => {
            if (!monitor.didDrop()) {
                dispatch(uiActions.clearWidgetPlaceholder());
            }
        },
    });
    return (
        <div ref={dragRef}>
            <CreatePanelItemComponent {...createPanelItemComponentProps} />
        </div>
    );
};
