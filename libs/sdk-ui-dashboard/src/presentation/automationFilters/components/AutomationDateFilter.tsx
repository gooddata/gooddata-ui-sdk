// (C) 2025 GoodData Corporation

import { KeyboardEvent, MutableRefObject, ReactNode, useCallback, useMemo } from "react";

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
            isExpanded: props.isOpen,
            deleteAriaLabel: props.textTitle ? `${deleteAriaLabel} ${props.textTitle}` : deleteAriaLabel,
            deleteAriaDescribedBy: dateFilterDeleteTooltipId,
        }),
        [dateFilterTooltipId, dateFilterDeleteTooltipId, props.isOpen, deleteAriaLabel, props.textTitle],
    );

    return (
        <UiChip
            label={label}
            iconBefore="date"
            isActive={props.isOpen}
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
}: {
    filter: IDashboardDateFilter;
    onChange: (filter: FilterContextItem | undefined) => void;
    onDelete: (filter: FilterContextItem) => void;
    isLocked?: boolean;
    isCommonDateFilter?: boolean;
    overlayPositionType?: OverlayPositionType;
    readonly?: boolean;
}) {
    const intl = useIntl();
    const deleteAriaLabel = intl.formatMessage({ id: "dialogs.automation.filters.deleteAriaLabel" });
    const deleteTooltipContent = intl.formatMessage({ id: "dialogs.automation.filters.deleteTooltip" });
    const lockedTooltipContent = intl.formatMessage({ id: "dialogs.automation.filters.lockedTooltip" });

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
            />
        </AutomationDateFilterProvider>
    );
}
