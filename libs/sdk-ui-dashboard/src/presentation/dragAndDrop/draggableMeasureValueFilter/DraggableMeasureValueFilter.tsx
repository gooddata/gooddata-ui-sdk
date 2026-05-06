// (C) 2026 GoodData Corporation

import classNames from "classnames";

import { type IDashboardMeasureValueFilter, type MeasureValueFilterCondition } from "@gooddata/sdk-model";

import { useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import { selectIsInEditMode } from "../../../model/store/renderMode/renderModeSelectors.js";
import { selectCanAddMoreFilters } from "../../../model/store/tabs/filterContext/filterContextSelectors.js";
import { type CustomDashboardMeasureValueFilterComponent } from "../../filterBar/measureValueFilter/types.js";
import { DraggableFilterDropZoneHint } from "../draggableFilterDropZone/DraggableFilterDropZoneHint.js";

type DraggableMeasureValueFilterProps = {
    filter: IDashboardMeasureValueFilter;
    filterIndex: number;
    autoOpen: boolean;
    readonly: boolean;
    FilterComponent: CustomDashboardMeasureValueFilterComponent;
    onMeasureValueFilterChanged: (
        filter: IDashboardMeasureValueFilter,
        conditions: MeasureValueFilterCondition[] | undefined,
    ) => void;
    onMeasureValueFilterAdded: (index: number) => void;
};

/**
 * Mirrors {@link DraggableAttributeFilter} so MVF chips occupy a real slot in the filter
 * list with proper neighbor drop targets. The chip itself is not yet a drag source — the
 * "measureValueFilter" drag type and the corresponding `moveMeasureValueFilter` model
 * command are not implemented yet (TODO CQ-2286). Until that lands, MVFs render in the
 * correct position and neighboring attribute/date drops resolve to correct indices, but
 * the MVF chip cannot itself be reordered via drag.
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
    const canAddMoreFilters = useDashboardSelector(selectCanAddMoreFilters);

    const showDropZones = isInEditMode;

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
                })}
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
