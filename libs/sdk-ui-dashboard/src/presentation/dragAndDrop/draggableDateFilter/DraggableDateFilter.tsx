// (C) 2022-2026 GoodData Corporation

import { type Ref } from "react";

import classNames from "classnames";

import { type IDashboardDateFilter } from "@gooddata/sdk-model";

import { useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import { selectIsApplyFiltersAllAtOnceEnabledAndSet } from "../../../model/store/config/configSelectors.js";
import { selectIsInEditMode } from "../../../model/store/renderMode/renderModeSelectors.js";
import { selectCanAddMoreFilters } from "../../../model/store/tabs/filterContext/filterContextSelectors.js";
import {
    type CustomDashboardDateFilterComponent,
    type IDashboardDateFilterConfig,
} from "../../filterBar/dateFilter/types.js";
import { DraggableFilterDropZoneHint } from "../draggableFilterDropZone/DraggableFilterDropZoneHint.js";
import { useDashboardDrag } from "../useDashboardDrag.js";

type DraggableDateFilterProps = {
    filter: IDashboardDateFilter;
    workingFilter?: IDashboardDateFilter;
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
    workingFilter,
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

    const isApplyAllAtOnceEnabledAndSet = useDashboardSelector(selectIsApplyFiltersAllAtOnceEnabledAndSet);

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
                ref={dragRef as unknown as Ref<HTMLDivElement> | undefined}
            >
                <FilterComponent
                    filter={filter}
                    workingFilter={isApplyAllAtOnceEnabledAndSet ? workingFilter : undefined}
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
