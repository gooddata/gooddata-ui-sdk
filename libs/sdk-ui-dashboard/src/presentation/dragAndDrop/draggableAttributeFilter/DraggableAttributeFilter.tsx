// (C) 2022 GoodData Corporation
import React from "react";
import { IDashboardAttributeFilter } from "@gooddata/sdk-model";
import classNames from "classnames";
import { useDashboardSelector, selectIsInEditMode } from "../../../model";
import { AttributeFilterDropZoneHint } from "./AttributeFilterDropZoneHint";
import { CustomDashboardAttributeFilterComponent } from "../../filterBar/types";
import { useDashboardDrag } from "../useDashboardDrag";

type DraggableAttributeFilterProps = {
    filter: IDashboardAttributeFilter;
    filterIndex: number;
    FilterComponent: CustomDashboardAttributeFilterComponent;
    onAttributeFilterChanged: (filter: IDashboardAttributeFilter) => void;
    onAttributeFilterAdded: (index: number) => void;
};

export function DraggableAttributeFilter({
    FilterComponent,
    filter,
    filterIndex,
    onAttributeFilterChanged,
    onAttributeFilterAdded,
}: DraggableAttributeFilterProps) {
    const isInEditMode = useDashboardSelector(selectIsInEditMode);
    const [{ isDragging }, dragRef] = useDashboardDrag(
        {
            dragItem: {
                type: "attributeFilter",
                filter,
                filterIndex,
            },
        },
        [filter, filterIndex],
    );

    const showDropZones = isInEditMode && !isDragging;

    return (
        <div style={{ position: "relative" }}>
            {showDropZones && (
                <AttributeFilterDropZoneHint
                    hintPosition="prev"
                    targetIndex={filterIndex}
                    onAddAttributePlaceholder={onAttributeFilterAdded}
                />
            )}

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

            {showDropZones && (
                <AttributeFilterDropZoneHint
                    hintPosition="next"
                    targetIndex={filterIndex}
                    onAddAttributePlaceholder={onAttributeFilterAdded}
                />
            )}
        </div>
    );
}
