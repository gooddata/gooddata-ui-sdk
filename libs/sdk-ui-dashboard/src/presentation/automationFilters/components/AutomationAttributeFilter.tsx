// (C) 2025 GoodData Corporation

import { MutableRefObject, ReactNode, useCallback } from "react";

import { useIntl } from "react-intl";

import { FilterContextItem, IDashboardAttributeFilter, ObjRef } from "@gooddata/sdk-model";
import {
    AttributeFilterButton,
    IAttributeFilterButtonProps,
    IAttributeFilterDropdownButtonProps,
} from "@gooddata/sdk-ui-filters";
import {
    OverlayPositionType,
    UiChip,
    UiSkeleton,
    UiTooltip,
    isActionKey,
    useIdPrefixed,
} from "@gooddata/sdk-ui-kit";

import {
    AutomationAttributeFilterProvider,
    useAutomationAttributeFilterContext,
} from "./AutomationAttributeFilterContext.js";
import { DefaultDashboardAttributeFilter } from "../../../presentation/filterBar/index.js";

export function AutomationAttributeFilter({
    filter,
    onChange,
    onDelete,
    isLocked,
    displayAsLabel,
    overlayPositionType,
}: {
    filter: IDashboardAttributeFilter;
    onChange: (filter: FilterContextItem) => void;
    onDelete: (filter: FilterContextItem) => void;
    isLocked?: boolean;
    displayAsLabel?: ObjRef;
    overlayPositionType?: OverlayPositionType;
}) {
    const intl = useIntl();
    const deleteAriaLabel = intl.formatMessage({ id: "dialogs.automation.filters.deleteAriaLabel" });
    const deleteTooltipContent = intl.formatMessage({ id: "dialogs.automation.filters.deleteTooltip" });
    const lockedTooltipContent = intl.formatMessage({ id: "dialogs.automation.filters.lockedTooltip" });

    return (
        <AutomationAttributeFilterProvider
            filter={filter}
            onChange={onChange}
            onDelete={onDelete}
            isLocked={isLocked}
            deleteAriaLabel={deleteAriaLabel}
            deleteTooltipContent={deleteTooltipContent}
            lockedTooltipContent={lockedTooltipContent}
        >
            <AttributeFilterWrapper
                displayAsLabel={displayAsLabel}
                overlayPositionType={overlayPositionType}
            />
        </AutomationAttributeFilterProvider>
    );
}

function AttributeFilterWrapper({
    displayAsLabel,
    overlayPositionType,
}: {
    displayAsLabel?: ObjRef;
    overlayPositionType?: OverlayPositionType;
}) {
    const { onChange, filter } = useAutomationAttributeFilterContext();

    const handleFilterChanged = useCallback(
        (newFilter: IDashboardAttributeFilter) => {
            onChange(newFilter);
        },
        [onChange],
    );

    return (
        <DefaultDashboardAttributeFilter
            filter={filter}
            onFilterChanged={handleFilterChanged}
            displayAsLabel={displayAsLabel}
            AttributeFilterComponent={AttributeFilter}
            overlayPositionType={overlayPositionType}
        />
    );
}

function AttributeFilter(props: IAttributeFilterButtonProps) {
    return (
        <AttributeFilterButton
            {...props}
            LoadingComponent={AutomationAttributeFilterLoadingComponent}
            DropdownButtonComponent={AutomationAttributeFilterDropdownButtonComponent}
        />
    );
}

function AutomationAttributeFilterLoadingComponent() {
    return <UiSkeleton itemWidth={160} itemHeight={27} itemBorderRadius={20} />;
}

function AutomationAttributeFilterDropdownButtonComponent(props: IAttributeFilterDropdownButtonProps) {
    const { isLocked, onDelete, filter, deleteAriaLabel, deleteTooltipContent, lockedTooltipContent } =
        useAutomationAttributeFilterContext();
    const label = `${props.title!}: ${props.subtitle!}`;
    const tag = props.selectedItemsCount ? `(${props.selectedItemsCount})` : undefined;
    const attributeFilterTooltipId = useIdPrefixed("attribute-filter-tooltip");
    const attributeFilterDeleteTooltipId = useIdPrefixed("attribute-filter-delete-tooltip");

    const tooltipContent = (
        <>
            {label}
            {tag ? ` ${tag}` : null}
            {isLocked ? <div>{lockedTooltipContent}</div> : null}
        </>
    );

    return (
        <UiChip
            label={label}
            tag={tag}
            isLocked={isLocked}
            isActive={props.isOpen}
            isDeletable={!isLocked}
            onClick={props.onClick}
            onDelete={() => onDelete?.(filter!)}
            onKeyDown={(event) => {
                // In case the button is locked and not disabled we need to explicitly
                // stop the event propagation to prevent dropdown from opening
                if (isLocked && isActionKey(event)) {
                    event.stopPropagation();
                }
            }}
            onDeleteKeyDown={(event) => {
                // Do not propagate event to parent as attribute filter would always open
                if (isActionKey(event)) {
                    event.stopPropagation();
                }
            }}
            accessibilityConfig={{
                isExpanded: props.isOpen,
                ariaDescribedBy: attributeFilterTooltipId,
                deleteAriaLabel,
                deleteAriaDescribedBy: attributeFilterTooltipId,
            }}
            buttonRef={props.buttonRef as MutableRefObject<HTMLButtonElement>}
            renderChipContent={(content: ReactNode) => (
                <UiTooltip
                    id={attributeFilterTooltipId}
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
                    id={attributeFilterDeleteTooltipId}
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
