// (C) 2022 GoodData Corporation
import React, { useEffect } from "react";
import { useDrag } from "react-dnd";
import { IDashboardAttributeFilter } from "@gooddata/sdk-model";
import classNames from "classnames";
import { useDashboardSelector } from "../../../model";
import { selectIsInEditMode } from "../../../model/store/ui/uiSelectors";
import { AttributeFilterDropZoneHint } from "./AttributeFilterDropZoneHint";
import { getEmptyImage } from "react-dnd-html5-backend";
import { CustomDashboardAttributeFilterComponent } from "../../filterBar/types";

type DraggableAttributeFilterProps = {
    filter: IDashboardAttributeFilter;
    filterIndex: number;
    FilterComponent: CustomDashboardAttributeFilterComponent;
    onAttributeFilterChanged: (filter: IDashboardAttributeFilter) => void;
};

export function DraggableAttributeFilter({
    FilterComponent,
    filter,
    filterIndex,
    onAttributeFilterChanged,
}: DraggableAttributeFilterProps) {
    const isInEditMode = useDashboardSelector(selectIsInEditMode);
    const [{ isDragging }, dragRef, dragPreview] = useDrag(
        () => ({
            type: "attributeFilter",
            item: {
                filter,
                filterIndex,
            },
            collect: (monitor) => ({
                isDragging: monitor.isDragging(),
            }),
            canDrag: isInEditMode,
        }),
        [isInEditMode, filter, filterIndex],
    );

    useEffect(() => {
        // this is the way how to hide native drag preview, custom preview is rendered by DragLayer
        dragPreview(getEmptyImage(), { captureDraggingState: false });
    }, []);

    const showDropZones = isInEditMode && !isDragging;

    return (
        <div style={{ position: "relative" }}>
            {showDropZones && <AttributeFilterDropZoneHint placement="prev" targetIndex={filterIndex} />}

            <div
                className={classNames("dash-filters-notdate", "dash-filters-attribute", {
                    "is-dragging": isDragging,
                })}
                ref={dragRef}
            >
                <FilterComponent
                    filter={filter}
                    onFilterChanged={onAttributeFilterChanged}
                    isDraggable={isInEditMode}
                />
            </div>

            {showDropZones && <AttributeFilterDropZoneHint placement="next" targetIndex={filterIndex} />}
        </div>
    );
}
