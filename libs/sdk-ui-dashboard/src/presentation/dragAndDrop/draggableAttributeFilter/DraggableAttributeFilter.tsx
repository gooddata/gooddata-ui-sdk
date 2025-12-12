// (C) 2022-2025 GoodData Corporation

import { type Ref, useCallback, useMemo } from "react";

import classNames from "classnames";

import { type IDashboardAttributeFilter, type ObjRef } from "@gooddata/sdk-model";

import { convertDashboardAttributeFilterElementsUrisToValues } from "../../../_staging/dashboard/legacyFilterConvertors.js";
import {
    selectCanAddMoreFilters,
    selectIsApplyFiltersAllAtOnceEnabledAndSet,
    selectIsInEditMode,
    selectSupportsElementUris,
    useDashboardSelector,
} from "../../../model/index.js";
import { type CustomDashboardAttributeFilterComponent } from "../../filterBar/types.js";
import { DraggableFilterDropZoneHint } from "../draggableFilterDropZone/DraggableFilterDropZoneHint.js";
import { useDashboardDrag } from "../useDashboardDrag.js";

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

    const isApplyAllAtOnceEnabledAndSet = useDashboardSelector(selectIsApplyFiltersAllAtOnceEnabledAndSet);

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
                ref={dragRef as unknown as Ref<HTMLDivElement> | undefined}
            >
                <FilterComponent
                    filter={filterToUse}
                    workingFilter={isApplyAllAtOnceEnabledAndSet ? workingFilterToUse : undefined}
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
