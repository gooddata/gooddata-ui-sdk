// (C) 2022-2025 GoodData Corporation
import React, { useCallback, useMemo } from "react";
import { IDashboardAttributeFilter, ObjRef } from "@gooddata/sdk-model";
import classNames from "classnames";
import {
    useDashboardSelector,
    selectIsInEditMode,
    selectSupportsElementUris,
    selectCanAddMoreFilters,
    selectEnableDashboardFiltersApplyModes,
} from "../../../model/index.js";
import { DraggableFilterDropZoneHint } from "../draggableFilterDropZone/DraggableFilterDropZoneHint.js";
import { CustomDashboardAttributeFilterComponent } from "../../filterBar/types.js";
import { useDashboardDrag } from "../useDashboardDrag.js";
import { convertDashboardAttributeFilterElementsUrisToValues } from "../../../_staging/dashboard/legacyFilterConvertors.js";

type DraggableAttributeFilterProps = {
    filter: IDashboardAttributeFilter;
    workingFilter?: IDashboardAttributeFilter;
    filterIndex: number;
    autoOpen: boolean;
    readonly: boolean;
    displayAsLabel?: ObjRef;
    FilterComponent: CustomDashboardAttributeFilterComponent;
    onAttributeFilterChanged: (filter: IDashboardAttributeFilter) => void;
    onAttributeFilterAdded: (index: number) => void;
    onAttributeFilterClose: () => void;
};

export function DraggableAttributeFilter({
    FilterComponent,
    filter,
    workingFilter,
    filterIndex,
    autoOpen,
    readonly,
    displayAsLabel,
    onAttributeFilterChanged,
    onAttributeFilterAdded,
    onAttributeFilterClose,
}: DraggableAttributeFilterProps) {
    const isInEditMode = useDashboardSelector(selectIsInEditMode);
    const [{ isDragging }, dragRef] = useDashboardDrag(
        {
            dragItem: {
                type: "attributeFilter",
                filter,
                filterIndex,
            },
            canDrag: isInEditMode,
        },
        [filter, filterIndex, isInEditMode],
    );

    const supportElementUris = useDashboardSelector(selectSupportsElementUris);
    const canAddMoreAttributeFilters = useDashboardSelector(selectCanAddMoreFilters);
    const filterToUse = useMemo(() => {
        if (supportElementUris) {
            return filter;
        }
        return convertDashboardAttributeFilterElementsUrisToValues(filter);
    }, [filter, supportElementUris]);

    const workingFilterToUse = useMemo(() => {
        if (supportElementUris) {
            return workingFilter ?? filter;
        }
        return convertDashboardAttributeFilterElementsUrisToValues(workingFilter ?? filter);
    }, [workingFilter, filter, supportElementUris]);

    const onClose = useCallback(() => {
        onAttributeFilterClose();
    }, [onAttributeFilterClose]);

    const showDropZones = isInEditMode && !isDragging;

    const enableDashboardFiltersApplyModes = useDashboardSelector(selectEnableDashboardFiltersApplyModes);

    return (
        <div className="draggable-attribute-filter">
            {showDropZones ? (
                <DraggableFilterDropZoneHint
                    hintPosition="prev"
                    targetIndex={filterIndex}
                    onAddAttributePlaceholder={onAttributeFilterAdded}
                    acceptPlaceholder={canAddMoreAttributeFilters}
                />
            ) : null}

            <div
                className={classNames("dash-filters-notdate", "dash-filters-attribute", {
                    "dash-filter-is-edit-mode": isInEditMode,
                    "is-dragging": isDragging,
                })}
                ref={dragRef}
            >
                <FilterComponent
                    filter={filterToUse}
                    workingFilter={enableDashboardFiltersApplyModes ? workingFilterToUse : undefined}
                    onFilterChanged={onAttributeFilterChanged}
                    isDraggable={isInEditMode}
                    readonly={readonly}
                    displayAsLabel={displayAsLabel}
                    autoOpen={autoOpen}
                    onClose={onClose}
                />
            </div>

            {showDropZones ? (
                <DraggableFilterDropZoneHint
                    hintPosition="next"
                    targetIndex={filterIndex}
                    onAddAttributePlaceholder={onAttributeFilterAdded}
                    acceptPlaceholder={canAddMoreAttributeFilters}
                />
            ) : null}
        </div>
    );
}
