// (C) 2025 GoodData Corporation

import React, { useCallback } from "react";

import { useIntl } from "react-intl";

import { FilterContextItem, IDashboardAttributeFilter, ObjRef } from "@gooddata/sdk-model";
import {
    AttributeFilterButton,
    IAttributeFilterButtonProps,
    IAttributeFilterDropdownButtonProps,
} from "@gooddata/sdk-ui-filters";
import { OverlayPositionType, UiChip, UiSkeleton, UiTooltip, useIdPrefixed } from "@gooddata/sdk-ui-kit";

import {
    AutomationAttributeFilterProvider,
    useAutomationAttributeFilterContext,
} from "./AutomationAttributeFilterContext.js";
import { DefaultDashboardAttributeFilter } from "../../../presentation/filterBar/index.js";

export const AutomationAttributeFilter: React.FC<{
    filter: IDashboardAttributeFilter;
    onChange: (filter: FilterContextItem) => void;
    onDelete: (filter: FilterContextItem) => void;
    isLocked?: boolean;
    displayAsLabel?: ObjRef;
    overlayPositionType?: OverlayPositionType;
}> = ({ filter, onChange, onDelete, isLocked, displayAsLabel, overlayPositionType }) => {
    const intl = useIntl();
    const deleteAriaLabel = intl.formatMessage({ id: "delete" });

    return (
        <AutomationAttributeFilterProvider
            filter={filter}
            onChange={onChange}
            onDelete={onDelete}
            isLocked={isLocked}
            deleteAriaLabel={deleteAriaLabel}
        >
            <AttributeFilterWrapper
                displayAsLabel={displayAsLabel}
                overlayPositionType={overlayPositionType}
            />
        </AutomationAttributeFilterProvider>
    );
};

const AttributeFilterWrapper = ({
    displayAsLabel,
    overlayPositionType,
}: {
    displayAsLabel?: ObjRef;
    overlayPositionType?: OverlayPositionType;
}) => {
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
};

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
    const { isLocked, onDelete, filter, deleteAriaLabel } = useAutomationAttributeFilterContext();
    const label = `${props.title!}: ${props.subtitle!}`;
    const tag = props.selectedItemsCount ? `(${props.selectedItemsCount})` : undefined;
    const attributeFilterTooltipId = useIdPrefixed("attribute-filter-tooltip");

    const tooltipContent = (
        <>
            {label}
            {tag ? ` ${tag}` : null}
        </>
    );

    return (
        <UiTooltip
            id={attributeFilterTooltipId}
            arrowPlacement="top-start"
            width={300}
            content={tooltipContent}
            triggerBy={["hover", "focus"]}
            anchor={
                <UiChip
                    label={label}
                    tag={tag}
                    isLocked={isLocked}
                    isActive={props.isOpen}
                    isDeletable={!isLocked}
                    onClick={props.onClick}
                    onDelete={() => onDelete?.(filter!)}
                    onDeleteKeyDown={(event) => {
                        // Do not propagate event to parent as attribute filter would always open
                        event.stopPropagation();
                    }}
                    accessibilityConfig={{
                        isExpanded: props.isOpen,
                        deleteAriaLabel,
                        ariaDescribedBy: attributeFilterTooltipId,
                    }}
                    buttonRef={props.buttonRef as React.MutableRefObject<HTMLButtonElement>}
                />
            }
        />
    );
}
