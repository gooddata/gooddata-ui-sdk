// (C) 2022-2025 GoodData Corporation
import React from "react";
import { IDashboardDateFilter } from "@gooddata/sdk-model";
import classNames from "classnames";
import { useDashboardSelector, selectIsInEditMode, selectCanAddMoreFilters } from "../../../model/index.js";
import { DraggableFilterDropZoneHint } from "../draggableFilterDropZone/DraggableFilterDropZoneHint.js";
import { CustomDashboardDateFilterComponent, IDashboardDateFilterConfig } from "../../filterBar/types.js";
import { useDashboardDrag } from "../useDashboardDrag.js";

type DraggableDateFilterProps = {
    filter: IDashboardDateFilter;
    filterIndex: number;
    config: IDashboardDateFilterConfig;
    autoOpen: boolean;
    readonly: boolean;
    FilterComponent: CustomDashboardDateFilterComponent;
    onDateFilterChanged: (
        filter: IDashboardDateFilter | undefined,
        dateFilterOptionLocalId?: string,
        isWorkingSelectionChange?: boolean,
    ) => void;
    onDateFilterAdded: (index: number) => void;
    onDateFilterClose: () => void;
};

export function DraggableDateFilter({
    FilterComponent,
    filter,
    filterIndex,
    autoOpen,
    readonly,
    onDateFilterChanged,
    onDateFilterAdded,
    config,
}: DraggableDateFilterProps) {
    const isInEditMode = useDashboardSelector(selectIsInEditMode);
    const [{ isDragging }, dragRef] = useDashboardDrag(
        {
            dragItem: {
                type: "dateFilter",
                filter,
                filterIndex,
            },
            canDrag: isInEditMode,
        },
        [filter, filterIndex, isInEditMode],
    );

    const canAddMoreDateFilters = useDashboardSelector(selectCanAddMoreFilters);

    const showDropZones = isInEditMode && !isDragging;

    return (
        <div className="draggable-attribute-filter">
            {showDropZones ? (
                <DraggableFilterDropZoneHint
                    hintPosition="prev"
                    targetIndex={filterIndex}
                    onAddAttributePlaceholder={onDateFilterAdded}
                    acceptPlaceholder={canAddMoreDateFilters}
                />
            ) : null}

            <div
                className={classNames("dash-filters-date", "dash-filters-nodate", {
                    "dash-filter-is-edit-mode": isInEditMode,
                    "is-dragging": isDragging,
                })}
                ref={dragRef}
            >
                <FilterComponent
                    filter={filter}
                    config={config}
                    onFilterChanged={onDateFilterChanged}
                    isDraggable={isInEditMode}
                    readonly={readonly}
                    autoOpen={autoOpen}
                />
            </div>

            {showDropZones ? (
                <DraggableFilterDropZoneHint
                    hintPosition="next"
                    targetIndex={filterIndex}
                    onAddAttributePlaceholder={onDateFilterAdded}
                    acceptPlaceholder={canAddMoreDateFilters}
                />
            ) : null}
        </div>
    );
}
