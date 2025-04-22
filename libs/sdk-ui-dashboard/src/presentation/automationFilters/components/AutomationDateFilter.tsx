// (C) 2025 GoodData Corporation

import React from "react";
import { Bubble, BubbleHoverTrigger, UiChip } from "@gooddata/sdk-ui-kit";
import {
    areObjRefsEqual,
    FilterContextItem,
    isDashboardCommonDateFilter,
    IDashboardDateFilter,
} from "@gooddata/sdk-model";
import { DefaultDashboardDateFilter, IDashboardDateFilterConfig } from "../../filterBar/index.js";
import {
    selectCatalogDateDatasets,
    selectEffectiveDateFilterAvailableGranularities,
    selectEffectiveDateFilterOptions,
    useDashboardSelector,
} from "../../../model/index.js";

const tooltipAlignPoints = [
    { align: "bl tl", offset: { x: 11, y: 0 } },
    { align: "tl bl", offset: { x: 11, y: 0 } },
];

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
            ButtonComponent={(props) => {
                const label = `${props.textTitle}: ${props.textSubtitle}`;
                return (
                    <BubbleHoverTrigger showDelay={200} hideDelay={0}>
                        <UiChip
                            label={label}
                            iconBefore="date"
                            isActive={props.isOpen}
                            isLocked={isLocked}
                            isDeletable={!isLocked && !isCommonDateFilter}
                            onDelete={() => onDelete(filter)}
                        />
                        <Bubble alignPoints={tooltipAlignPoints}>{label}</Bubble>
                    </BubbleHoverTrigger>
                );
            }}
        />
    );
};
