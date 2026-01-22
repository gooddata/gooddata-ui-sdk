// (C) 2025-2026 GoodData Corporation

import { type MutableRefObject, type ReactNode, useCallback } from "react";

import { useIntl } from "react-intl";

import { type FilterContextItem, type IDashboardAttributeFilter, type ObjRef } from "@gooddata/sdk-model";
import {
    AttributeFilterButton,
    type IAttributeFilterButtonProps,
    type IAttributeFilterDropdownButtonProps,
} from "@gooddata/sdk-ui-filters";
import {
    type OverlayPositionType,
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
import { DefaultDashboardAttributeFilter } from "../../filterBar/attributeFilter/DefaultDashboardAttributeFilter.js";

export function AutomationAttributeFilter({
    filter,
    onChange,
    onDelete,
    isLocked,
    displayAsLabel,
    overlayPositionType,
    readonly,
    tabId,
}: {
    filter: IDashboardAttributeFilter;
    onChange: (filter: FilterContextItem) => void;
    onDelete: (filter: FilterContextItem) => void;
    isLocked?: boolean;
    displayAsLabel?: ObjRef;
    overlayPositionType?: OverlayPositionType;
    readonly?: boolean;
    tabId?: string;
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
                readonly={readonly}
                tabId={tabId}
            />
        </AutomationAttributeFilterProvider>
    );
}

function AttributeFilterWrapper({
    displayAsLabel,
    overlayPositionType,
    readonly,
    tabId,
}: {
    displayAsLabel?: ObjRef;
    overlayPositionType?: OverlayPositionType;
    readonly?: boolean;
    tabId?: string;
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
            readonly={readonly}
            tabId={tabId}
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
            isActive={props.isOpen ?? false}
            isDeletable={!isLocked}
            onClick={props.onClick}
            onDelete={() => onDelete?.(filter)}
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
                isExpanded: props.isOpen ?? false,
                popupId: props.dropdownId,
                popupType: "dialog",
                ariaDescribedBy: attributeFilterTooltipId,
                deleteAriaLabel: props.title ? `${deleteAriaLabel} ${props.title}` : deleteAriaLabel,
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
