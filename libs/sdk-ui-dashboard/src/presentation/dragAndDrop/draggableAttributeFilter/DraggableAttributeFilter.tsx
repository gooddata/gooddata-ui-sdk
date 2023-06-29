// (C) 2022 GoodData Corporation
import React, { useCallback, useMemo } from "react";
import { IDashboardAttributeFilter } from "@gooddata/sdk-model";
import classNames from "classnames";
import {
    useDashboardSelector,
    selectIsInEditMode,
    selectSupportsElementUris,
    selectCanAddMoreAttributeFilters,
} from "../../../model/index.js";
import { AttributeFilterDropZoneHint } from "./AttributeFilterDropZoneHint.js";
import { CustomDashboardAttributeFilterComponent } from "../../filterBar/types.js";
import { useDashboardDrag } from "../useDashboardDrag.js";
import { convertDashboardAttributeFilterElementsUrisToValues } from "../../../_staging/dashboard/legacyFilterConvertors.js";

type DraggableAttributeFilterProps = {
    filter: IDashboardAttributeFilter;
    filterIndex: number;
    autoOpen: boolean;
    FilterComponent: CustomDashboardAttributeFilterComponent;
    onAttributeFilterChanged: (filter: IDashboardAttributeFilter) => void;
    onAttributeFilterAdded: (index: number) => void;
    onAttributeFilterClose: () => void;
};

export function DraggableAttributeFilter({
    FilterComponent,
    filter,
    filterIndex,
    autoOpen,
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
    const canAddMoreAttributeFilters = useDashboardSelector(selectCanAddMoreAttributeFilters);
    const filterToUse = useMemo(() => {
        if (supportElementUris) {
            return filter;
        }
        return convertDashboardAttributeFilterElementsUrisToValues(filter);
    }, [filter, supportElementUris]);

    const onClose = useCallback(() => {
        onAttributeFilterClose();
    }, [onAttributeFilterClose]);

    const showDropZones = isInEditMode && !isDragging;

    return (
        <div className="draggable-attribute-filter">
            {showDropZones ? (
                <AttributeFilterDropZoneHint
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
                    onFilterChanged={onAttributeFilterChanged}
                    isDraggable={isInEditMode}
                    autoOpen={autoOpen}
                    onClose={onClose}
                />
            </div>

            {showDropZones ? (
                <AttributeFilterDropZoneHint
                    hintPosition="next"
                    targetIndex={filterIndex}
                    onAddAttributePlaceholder={onAttributeFilterAdded}
                    acceptPlaceholder={canAddMoreAttributeFilters}
                />
            ) : null}
        </div>
    );
}
