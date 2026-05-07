// (C) 2026 GoodData Corporation

import { type Ref } from "react";

import classNames from "classnames";

import { type IDashboardMeasureValueFilter, type MeasureValueFilterCondition } from "@gooddata/sdk-model";

import { useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import { selectIsInEditMode } from "../../../model/store/renderMode/renderModeSelectors.js";
import { selectCanAddMoreFilters } from "../../../model/store/tabs/filterContext/filterContextSelectors.js";
import { type CustomDashboardMeasureValueFilterComponent } from "../../filterBar/measureValueFilter/types.js";
import { DraggableFilterDropZoneHint } from "../draggableFilterDropZone/DraggableFilterDropZoneHint.js";
import { useDashboardDrag } from "../useDashboardDrag.js";

type DraggableMeasureValueFilterProps = {
    filter: IDashboardMeasureValueFilter;
    filterIndex: number;
    autoOpen: boolean;
    readonly: boolean;
    FilterComponent: CustomDashboardMeasureValueFilterComponent;
    onMeasureValueFilterChanged: (
        filter: IDashboardMeasureValueFilter,
        conditions: MeasureValueFilterCondition[] | undefined,
        isWorkingSelectionChange?: boolean,
    ) => void;
    onMeasureValueFilterAdded: (index: number) => void;
};

/**
 * Mirrors {@link DraggableAttributeFilter} so MVF chips occupy a real draggable slot in
 * the filter list with proper neighbor drop targets.
 *
 * @internal
 */
export function DraggableMeasureValueFilter({
    FilterComponent,
    filter,
    filterIndex,
    autoOpen,
    readonly,
    onMeasureValueFilterChanged,
    onMeasureValueFilterAdded,
}: DraggableMeasureValueFilterProps) {
    const isInEditMode = useDashboardSelector(selectIsInEditMode);
    const [{ isDragging }, dragRef] = useDashboardDrag(
        {
            dragItem: {
                type: "measureValueFilter",
                filter,
                filterIndex,
            },
            canDrag: isInEditMode,
        },
        [filter, filterIndex, isInEditMode],
    );
    const canAddMoreFilters = useDashboardSelector(selectCanAddMoreFilters);

    const showDropZones = isInEditMode && !isDragging;

    return (
        <div className="draggable-measure-value-filter">
            {showDropZones ? (
                <DraggableFilterDropZoneHint
                    hintPosition="prev"
                    targetIndex={filterIndex}
                    onAddAttributePlaceholder={onMeasureValueFilterAdded}
                    acceptPlaceholder={canAddMoreFilters}
                />
            ) : null}

            <div
                className={classNames("dash-filters-notdate", "dash-filters-mvf", {
                    "dash-filter-is-edit-mode": isInEditMode,
                    "is-dragging": isDragging,
                })}
                ref={dragRef as unknown as Ref<HTMLDivElement> | undefined}
            >
                <FilterComponent
                    autoOpen={autoOpen}
                    filter={filter}
                    filterIndex={filterIndex}
                    readonly={readonly}
                    onMeasureValueFilterChanged={onMeasureValueFilterChanged}
                />
            </div>

            {showDropZones ? (
                <DraggableFilterDropZoneHint
                    hintPosition="next"
                    targetIndex={filterIndex}
                    onAddAttributePlaceholder={onMeasureValueFilterAdded}
                    acceptPlaceholder={canAddMoreFilters}
                />
            ) : null}
        </div>
    );
}
