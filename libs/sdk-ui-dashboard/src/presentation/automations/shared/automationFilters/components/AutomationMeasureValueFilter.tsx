// (C) 2026 GoodData Corporation

import { type KeyboardEvent, type ReactNode, useCallback } from "react";

import { useIntl } from "react-intl";

import {
    type FilterContextItem,
    type IDashboardMeasureValueFilter,
    type IMeasureValueFilter,
} from "@gooddata/sdk-model";
import { type IMeasureValueFilterDropdownButtonProps, MeasureValueFilter } from "@gooddata/sdk-ui-filters";
import {
    type OverlayPositionType,
    UiChip,
    UiTooltip,
    isActionKey,
    useIdPrefixed,
} from "@gooddata/sdk-ui-kit";

import {
    getSharedDashboardMvfProps,
    normalizeMeasureValueFilterConditions,
    useDashboardMeasureValueFilterData,
} from "../../../../filterBar/measureValueFilter/useDashboardMeasureValueFilterData.js";

import {
    AutomationMeasureValueFilterProvider,
    useAutomationMeasureValueFilterContext,
} from "./AutomationMeasureValueFilterContext.js";

export function AutomationMeasureValueFilter({
    filter,
    onChange,
    onDelete,
    isLocked,
    overlayPositionType,
    readonly,
}: {
    filter: IDashboardMeasureValueFilter;
    onChange: (filter: FilterContextItem) => void;
    onDelete: (filter: FilterContextItem) => void;
    isLocked?: boolean;
    overlayPositionType?: OverlayPositionType;
    readonly?: boolean;
}) {
    const intl = useIntl();
    const deleteAriaLabel = intl.formatMessage({ id: "dialogs.automation.filters.deleteAriaLabel" });
    const deleteTooltipContent = intl.formatMessage({ id: "dialogs.automation.filters.deleteTooltip" });
    const lockedTooltipContent = intl.formatMessage({ id: "dialogs.automation.filters.lockedTooltip" });

    // Automation/scheduling has no "Apply together" working filter — just reflect the persisted filter.
    const mvfData = useDashboardMeasureValueFilterData(filter);
    const { conditionLabel } = mvfData;

    const handleApply = useCallback(
        (updated: IMeasureValueFilter | null) => {
            const newConditions = normalizeMeasureValueFilterConditions(updated);
            const next: IDashboardMeasureValueFilter = {
                dashboardMeasureValueFilter: {
                    ...filter.dashboardMeasureValueFilter,
                    ...(newConditions && newConditions.length > 0
                        ? { conditions: newConditions }
                        : { conditions: undefined }),
                },
            };
            onChange(next);
        },
        [filter, onChange],
    );

    return (
        <AutomationMeasureValueFilterProvider
            filter={filter}
            onChange={onChange}
            onDelete={onDelete}
            isLocked={isLocked}
            deleteAriaLabel={deleteAriaLabel}
            deleteTooltipContent={deleteTooltipContent}
            lockedTooltipContent={lockedTooltipContent}
        >
            <MeasureValueFilter
                {...getSharedDashboardMvfProps(mvfData)}
                onApply={handleApply}
                DropdownButtonComponent={(props) => (
                    <AutomationMeasureValueFilterButton
                        {...props}
                        conditionLabel={conditionLabel}
                        overlayPositionType={overlayPositionType}
                        readonly={readonly}
                    />
                )}
            />
        </AutomationMeasureValueFilterProvider>
    );
}

interface IAutomationMeasureValueFilterButtonProps extends IMeasureValueFilterDropdownButtonProps {
    conditionLabel: string;
    overlayPositionType?: OverlayPositionType;
    readonly?: boolean;
}

function AutomationMeasureValueFilterButton({
    isActive,
    buttonTitle,
    onClick,
    conditionLabel,
    readonly,
    disabled,
    dropdownId,
}: IAutomationMeasureValueFilterButtonProps) {
    const { isLocked, onDelete, filter, deleteAriaLabel, deleteTooltipContent, lockedTooltipContent } =
        useAutomationMeasureValueFilterContext();
    const label = `${buttonTitle}: ${conditionLabel}`;
    const mvfTooltipId = useIdPrefixed("mvf-filter-tooltip");
    const mvfDeleteTooltipId = useIdPrefixed("mvf-filter-delete-tooltip");

    const tooltipContent = (
        <>
            {label}
            {isLocked ? <div>{lockedTooltipContent}</div> : null}
        </>
    );

    // The whole-panel disabled state is handled by a visual overlay in
    // AutomationFiltersSelect (`gd-automation-filters__overlay`), so the chip should not
    // claim a locked state from it. The lock icon only reflects the filter's own config.
    const isDeletable = !isLocked && !readonly;

    return (
        <UiChip
            label={label}
            iconBefore="metric"
            isActive={isActive}
            isLocked={isLocked}
            isDisabled={disabled}
            isDeletable={isDeletable}
            onClick={onClick}
            onDelete={() => onDelete?.(filter)}
            onKeyDown={(event: KeyboardEvent) => {
                // In case the button is locked and not disabled we need to explicitly
                // stop the event propagation to prevent dropdown from opening
                if (isLocked && isActionKey(event)) {
                    event.stopPropagation();
                }
            }}
            onDeleteKeyDown={(event: KeyboardEvent) => {
                // Do not propagate event to parent as MVF dropdown would always open
                if (isActionKey(event)) {
                    event.stopPropagation();
                }
            }}
            accessibilityConfig={{
                isExpanded: isActive,
                popupId: dropdownId,
                popupType: "dialog",
                ariaDescribedBy: mvfTooltipId,
                deleteAriaLabel: buttonTitle ? `${deleteAriaLabel} ${buttonTitle}` : deleteAriaLabel,
                deleteAriaDescribedBy: mvfDeleteTooltipId,
            }}
            renderChipContent={(content: ReactNode) => (
                <UiTooltip
                    id={mvfTooltipId}
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
                    id={mvfDeleteTooltipId}
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
