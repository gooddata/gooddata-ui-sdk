// (C) 2022 GoodData Corporation
import React from "react";

import { uiActions, selectIsInEditMode, useDashboardDispatch, useDashboardSelector } from "../../../model";
import { useDashboardDrag } from "../useDashboardDrag";
import {
    CustomDashboardKpiPlaceholderComponent,
    CustomDashboardKpiPlaceholderComponentProps,
} from "../types";

type DraggableKpiPlaceholderProps = {
    PlaceholderComponent: CustomDashboardKpiPlaceholderComponent;
    placeholderComponentProps: CustomDashboardKpiPlaceholderComponentProps;
};

export const DraggableKpiPlaceholder: React.FC<DraggableKpiPlaceholderProps> = ({
    PlaceholderComponent,
    placeholderComponentProps,
}) => {
    const dispatch = useDashboardDispatch();
    const isInEditMode = useDashboardSelector(selectIsInEditMode);

    const [, dragRef] = useDashboardDrag({
        dragItem: {
            type: "kpi-placeholder",
        },
        canDrag: isInEditMode && !placeholderComponentProps.disabled,
        hideDefaultPreview: false,
        dragEnd: (_, monitor) => {
            if (!monitor.didDrop()) {
                dispatch(uiActions.clearWidgetPlaceholder());
            }
        },
    });
    return (
        <div ref={dragRef}>
            <PlaceholderComponent {...placeholderComponentProps} />
        </div>
    );
};
