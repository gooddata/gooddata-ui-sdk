// (C) 2022 GoodData Corporation
import React from "react";
import { selectIsInEditMode, useDashboardSelector } from "../../../model";
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
    const isInEditMode = useDashboardSelector(selectIsInEditMode);
    const [, dragRef] = useDashboardDrag({
        dragItem: {
            type: "kpi-placeholder",
        },
        canDrag: isInEditMode && !placeholderComponentProps.disabled,
        hideDefaultPreview: false,
    });
    return (
        <div ref={dragRef}>
            <PlaceholderComponent {...placeholderComponentProps} />
        </div>
    );
};
