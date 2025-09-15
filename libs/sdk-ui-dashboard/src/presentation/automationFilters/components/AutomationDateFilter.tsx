// (C) 2025 GoodData Corporation

import React, { useCallback, useMemo } from "react";

import { useIntl } from "react-intl";

import { FilterContextItem, IDashboardDateFilter, areObjRefsEqual } from "@gooddata/sdk-model";
import { IDateFilterButtonProps } from "@gooddata/sdk-ui-filters";
import { OverlayPositionType, UiChip, UiTooltip, useIdPrefixed } from "@gooddata/sdk-ui-kit";

import {
    AutomationDateFilterProvider,
    useAutomationDateFilterContext,
} from "./AutomationDateFilterContext.js";
import {
    selectCatalogDateDatasets,
    selectEffectiveDateFilterAvailableGranularities,
    selectEffectiveDateFilterOptions,
    useDashboardSelector,
} from "../../../model/index.js";
import { DefaultDashboardDateFilter, IDashboardDateFilterConfig } from "../../filterBar/index.js";

function AutomationDateFilterButton(props: IDateFilterButtonProps) {
    const { isLocked, isCommonDateFilter, onDelete, filter } = useAutomationDateFilterContext();
    const intl = useIntl();
    const deleteAriaLabel = intl.formatMessage({ id: "delete" });
    const label = `${props.textTitle}: ${props.textSubtitle}`;
    const dateFilterTooltipId = useIdPrefixed("date-filter-tooltip");

    const onDeleteHandler = useCallback(() => {
        onDelete(filter);
    }, [onDelete, filter]);

    const handleDeleteKeyDown = useCallback((event: React.KeyboardEvent) => {
        // Do not propagate event to parent as date filter would always open
        event.stopPropagation();
    }, []);

    const accessibilityConfig = useMemo(
        () => ({
            ariaDescribedBy: dateFilterTooltipId,
            isExpanded: props.isOpen,
            deleteAriaLabel,
        }),
        [dateFilterTooltipId, props.isOpen, deleteAriaLabel],
    );

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
                    onDelete={onDeleteHandler}
                    onDeleteKeyDown={handleDeleteKeyDown}
                    accessibilityConfig={accessibilityConfig}
                    buttonRef={props.buttonRef as React.MutableRefObject<HTMLButtonElement>}
                />
            }
        />
    );
}

export function AutomationDateFilter({
    filter,
    onChange,
    onDelete,
    isLocked,
    isCommonDateFilter,
    overlayPositionType,
}: {
    filter: IDashboardDateFilter;
    onChange: (filter: FilterContextItem | undefined) => void;
    onDelete: (filter: FilterContextItem) => void;
    isLocked?: boolean;
    isCommonDateFilter?: boolean;
    overlayPositionType?: OverlayPositionType;
}) {
    const availableGranularities = useDashboardSelector(selectEffectiveDateFilterAvailableGranularities);
    const dateFilterOptions = useDashboardSelector(selectEffectiveDateFilterOptions);
    const allDateDatasets = useDashboardSelector(selectCatalogDateDatasets);

    const handleFilterChanged = useCallback(
        (newFilter: FilterContextItem | undefined) => {
            onChange(newFilter);
        },
        [onChange],
    );

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
        <AutomationDateFilterProvider
            filter={filter}
            onDelete={onDelete}
            isLocked={isLocked}
            isCommonDateFilter={isCommonDateFilter}
        >
            <DefaultDashboardDateFilter
                filter={filter}
                workingFilter={filter}
                onFilterChanged={handleFilterChanged}
                config={filterConfig}
                overlayPositionType={overlayPositionType}
                ButtonComponent={AutomationDateFilterButton}
            />
        </AutomationDateFilterProvider>
    );
}
