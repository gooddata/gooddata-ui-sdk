// (C) 2025-2026 GoodData Corporation

import { type KeyboardEvent, type MutableRefObject, type ReactNode, useCallback, useMemo } from "react";

import { useIntl } from "react-intl";

import { type FilterContextItem, type IDashboardDateFilter, areObjRefsEqual } from "@gooddata/sdk-model";
import { type IDateFilterButtonProps } from "@gooddata/sdk-ui-filters";
import { type OverlayPositionType, UiChip, UiTooltip, useIdPrefixed } from "@gooddata/sdk-ui-kit";

import {
    AutomationDateFilterProvider,
    useAutomationDateFilterContext,
} from "./AutomationDateFilterContext.js";
import { useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import { selectCatalogDateDatasets } from "../../../model/store/catalog/catalogSelectors.js";
import {
    selectEffectiveDateFilterAvailableGranularities,
    selectEffectiveDateFilterAvailableGranularitiesForTab,
    selectEffectiveDateFilterOptions,
    selectEffectiveDateFilterOptionsForTab,
} from "../../../model/store/tabs/dateFilterConfig/dateFilterConfigSelectors.js";
import { DefaultDashboardDateFilter } from "../../filterBar/dateFilter/DefaultDashboardDateFilter.js";
import type { IDashboardDateFilterConfig } from "../../filterBar/dateFilter/types.js";

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

    // Use tab-specific selectors when tabId is provided
    const availableGranularitiesActive = useDashboardSelector(
        selectEffectiveDateFilterAvailableGranularities,
    );
    const availableGranularitiesForTab = useDashboardSelector(
        tabId
            ? selectEffectiveDateFilterAvailableGranularitiesForTab(tabId)
            : selectEffectiveDateFilterAvailableGranularities,
    );
    // Fallback to active tab granularities if tab-specific config is empty
    const availableGranularities =
        tabId && availableGranularitiesForTab.length > 0
            ? availableGranularitiesForTab
            : availableGranularitiesActive;

    const dateFilterOptionsActive = useDashboardSelector(selectEffectiveDateFilterOptions);
    const dateFilterOptionsForTab = useDashboardSelector(
        tabId ? selectEffectiveDateFilterOptionsForTab(tabId) : selectEffectiveDateFilterOptions,
    );
    const dateFilterOptions =
        tabId && dateFilterOptionsForTab ? dateFilterOptionsForTab : dateFilterOptionsActive;

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
