// (C) 2022 GoodData Corporation
import React, { useEffect } from "react";

import {
    uiActions,
    selectIsInEditMode,
    useDashboardDispatch,
    useDashboardSelector,
    useWidgetSelection,
} from "../../../model";
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
    const { deselectWidgets } = useWidgetSelection();

    const [{ isDragging }, dragRef] = useDashboardDrag({
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

    // deselect all widgets when starting the drag
    useEffect(() => {
        if (isDragging) {
            deselectWidgets();
        }
    }, [deselectWidgets, isDragging]);

    return (
        <div ref={dragRef}>
            <PlaceholderComponent {...placeholderComponentProps} />
        </div>
    );
};
