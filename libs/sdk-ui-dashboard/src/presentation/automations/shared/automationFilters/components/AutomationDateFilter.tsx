// (C) 2025-2026 GoodData Corporation

import { type KeyboardEvent, type MutableRefObject, type ReactNode, useCallback, useMemo } from "react";

import { useIntl } from "react-intl";

import {
    type FilterContextItem,
    type ICatalogDateDataset,
    type IDashboardDateFilter,
    areObjRefsEqual,
} from "@gooddata/sdk-model";
import { type IDateFilterButtonProps } from "@gooddata/sdk-ui-filters";
import { type OverlayPositionType, UiChip, UiTooltip, useIdPrefixed } from "@gooddata/sdk-ui-kit";

import { DefaultDashboardDateFilter } from "../../../../filterBar/dateFilter/DefaultDashboardDateFilter.js";
import type { IDashboardDateFilterConfig } from "../../../../filterBar/dateFilter/types.js";
import { useAutomationsContext } from "../../../contexts/AutomationsContext.js";

import {
    AutomationDateFilterProvider,
    useAutomationDateFilterContext,
} from "./AutomationDateFilterContext.js";

function AutomationDateFilterButton(props: IDateFilterButtonProps) {
    const {
        isLocked,
        isCommonDateFilter,
        onDelete,
        filter,
        deleteAriaLabel,
        deleteTooltipContent,
        lockedTooltipContent,
    } = useAutomationDateFilterContext();
    const label = `${props.textTitle}: ${props.textSubtitle}`;
    const dateFilterTooltipId = useIdPrefixed("date-filter-tooltip");
    const dateFilterDeleteTooltipId = useIdPrefixed("date-filter-delete-tooltip");
    const tooltipContent = (
        <>
            {label}
            {isLocked ? <div>{lockedTooltipContent}</div> : null}
        </>
    );

    const onDeleteHandler = useCallback(() => {
        onDelete(filter);
    }, [onDelete, filter]);

    const handleDeleteKeyDown = useCallback((event: KeyboardEvent) => {
        // Do not propagate event to parent as date filter would always open
        event.stopPropagation();
    }, []);

    const accessibilityConfig = useMemo(
        () => ({
            ariaDescribedBy: dateFilterTooltipId,
            isExpanded: props.isOpen ?? false,
            popupId: props.dropdownId,
            popupType: "dialog" as const,
            deleteAriaLabel: props.textTitle ? `${deleteAriaLabel} ${props.textTitle}` : deleteAriaLabel,
            deleteAriaDescribedBy: dateFilterDeleteTooltipId,
        }),
        [
            dateFilterTooltipId,
            dateFilterDeleteTooltipId,
            props.isOpen,
            props.dropdownId,
            deleteAriaLabel,
            props.textTitle,
        ],
    );

    return (
        <UiChip
            label={label}
            iconBefore="date"
            isActive={props.isOpen ?? false}
            isLocked={isLocked}
            isDeletable={!isLocked && !isCommonDateFilter}
            onDelete={onDeleteHandler}
            onDeleteKeyDown={handleDeleteKeyDown}
            accessibilityConfig={accessibilityConfig}
            buttonRef={props.buttonRef as MutableRefObject<HTMLButtonElement>}
            renderChipContent={(content: ReactNode) => (
                <UiTooltip
                    id={dateFilterTooltipId}
                    arrowPlacement="top-start"
                    content={tooltipContent}
                    triggerBy={["hover", "focus"]}
                    anchor={content}
                    anchorWrapperStyles={{
                        display: "flex",
                        width: "100%",
                        height: "100%",
                        minWidth: 0,
                    }}
                />
            )}
            renderDeleteButton={(button: ReactNode) => (
                <UiTooltip
                    id={dateFilterDeleteTooltipId}
                    arrowPlacement="top-start"
                    content={deleteTooltipContent}
                    triggerBy={["hover", "focus"]}
                    anchor={button}
                    anchorWrapperStyles={{
                        height: "100%",
                    }}
                />
            )}
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
    readonly,
    tabId,
}: {
    filter: IDashboardDateFilter;
    onChange: (filter: FilterContextItem | undefined) => void;
    onDelete: (filter: FilterContextItem) => void;
    isLocked?: boolean;
    isCommonDateFilter?: boolean;
    overlayPositionType?: OverlayPositionType;
    readonly?: boolean;
    tabId?: string;
}) {
    const intl = useIntl();
    const deleteAriaLabel = intl.formatMessage({ id: "dialogs.automation.filters.deleteAriaLabel" });
    const deleteTooltipContent = intl.formatMessage({ id: "dialogs.automation.filters.deleteTooltip" });
    const lockedTooltipContent = intl.formatMessage({ id: "dialogs.automation.filters.lockedTooltip" });

    const { dateFilterConfig, catalogDateDatasets } = useAutomationsContext();
    const tabGranularities = tabId ? dateFilterConfig.getGranularitiesForTab(tabId) : [];
    // Fallback to active tab granularities if tab-specific config is empty
    const availableGranularities =
        tabId && tabGranularities.length > 0 ? tabGranularities : dateFilterConfig.availableGranularities;
    const tabOptions = tabId ? dateFilterConfig.getOptionsForTab(tabId) : undefined;
    // Fallback to active options if tab-specific options are absent or empty
    const dateFilterOptions =
        tabOptions && Object.keys(tabOptions).length > 0 ? tabOptions : dateFilterConfig.dateFilterOptions;
    const allDateDatasets = catalogDateDatasets;

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

    const defaultDateFilterName = allDateDatasets.find((ds: ICatalogDateDataset) =>
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
            deleteAriaLabel={deleteAriaLabel}
            deleteTooltipContent={deleteTooltipContent}
            lockedTooltipContent={lockedTooltipContent}
        >
            <DefaultDashboardDateFilter
                filter={filter}
                workingFilter={filter}
                onFilterChanged={handleFilterChanged}
                readonly={readonly || isLocked}
                config={filterConfig}
                overlayPositionType={overlayPositionType}
                ButtonComponent={AutomationDateFilterButton}
                tabId={tabId}
            />
        </AutomationDateFilterProvider>
    );
}
