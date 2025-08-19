// (C) 2025 GoodData Corporation

import React from "react";

import { useIntl } from "react-intl";

import { FilterContextItem, IDashboardDateFilter, areObjRefsEqual } from "@gooddata/sdk-model";
import { OverlayPositionType, UiChip, UiTooltip, useIdPrefixed } from "@gooddata/sdk-ui-kit";

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
    isCommonDateFilter?: boolean;
    overlayPositionType?: OverlayPositionType;
}> = ({ filter, onChange, onDelete, isLocked, isCommonDateFilter, overlayPositionType }) => {
    const intl = useIntl();
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

    const dateFilterTooltipId = useIdPrefixed("date-filter-tooltip");

    return (
        <DefaultDashboardDateFilter
            filter={filter}
            workingFilter={filter}
            onFilterChanged={onChange}
            config={filterConfig}
            overlayPositionType={overlayPositionType}
            ButtonComponent={(props) => {
                const label = `${props.textTitle}: ${props.textSubtitle}`;
                return (
                    <UiTooltip
                        id={dateFilterTooltipId}
                        arrowPlacement="top-start"
                        content={label}
                        optimalPlacement
                        triggerBy={["hover", "focus"]}
                        anchor={
                            <UiChip
                                label={label}
                                iconBefore="date"
                                isActive={props.isOpen}
                                isLocked={isLocked}
                                isDeletable={!isLocked && !isCommonDateFilter}
                                onDelete={() => onDelete(filter)}
                                onDeleteKeyDown={(event) => {
                                    // Do not propagate event to parent as date filter would always open
                                    event.stopPropagation();
                                }}
                                accessibilityConfig={{
                                    ariaDescribedBy: dateFilterTooltipId,
                                    isExpanded: props.isOpen,
                                    deleteAriaLabel: intl.formatMessage({ id: "delete" }),
                                }}
                                buttonRef={props.buttonRef as React.MutableRefObject<HTMLButtonElement>}
                            />
                        }
                    />
                );
            }}
        />
    );
};
