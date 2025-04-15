// (C) 2025 GoodData Corporation

import {
    areObjRefsEqual,
    FilterContextItem,
    IDashboardDateFilter,
    isDashboardCommonDateFilter,
} from "@gooddata/sdk-model";
import { UiChip } from "@gooddata/sdk-ui-kit";
import React from "react";
import {
    selectCatalogDateDatasets,
    selectEffectiveDateFilterAvailableGranularities,
    selectEffectiveDateFilterOptions,
    useDashboardSelector,
} from "../../../model/index.js";
import { DefaultDashboardDateFilter, IDashboardDateFilterConfig } from "../../filterBar/index.js";

export const AutomationDateFilter: React.FC<{
    filter: IDashboardDateFilter;
    onChange: (filter: FilterContextItem | undefined) => void;
    onDelete: (filter: FilterContextItem) => void;
    isLocked?: boolean;
}> = ({ filter, onChange, onDelete, isLocked }) => {
    const isCommonDateFilter = isDashboardCommonDateFilter(filter);

    const availableGranularities = useDashboardSelector(selectEffectiveDateFilterAvailableGranularities);
    const dateFilterOptions = useDashboardSelector(selectEffectiveDateFilterOptions);
    const allDateDatasets = useDashboardSelector(selectCatalogDateDatasets);
    const commonDateFilterComponentConfig: IDashboardDateFilterConfig = {
        availableGranularities,
        dateFilterOptions,
    };

    const defaultDateFilterName = allDateDatasets.find((ds) =>
        areObjRefsEqual(ds.dataSet.ref, filter.dateFilter.dataSet),
    )?.dataSet?.title;
    const filterConfig = isCommonDateFilter
        ? commonDateFilterComponentConfig
        : {
              ...commonDateFilterComponentConfig,
              customFilterName: defaultDateFilterName,
          };

    return (
        <DefaultDashboardDateFilter
            filter={filter}
            workingFilter={filter}
            onFilterChanged={onChange}
            config={filterConfig}
            ButtonComponent={(props) => (
                <UiChip
                    label={props.textTitle + ": " + props.textSubtitle || ""}
                    iconBefore="date"
                    isActive={props.isOpen}
                    isLocked={isLocked}
                    isDeletable={!isLocked && !isCommonDateFilter}
                    onDelete={() => onDelete(filter)}
                />
            )}
        />
    );
};
