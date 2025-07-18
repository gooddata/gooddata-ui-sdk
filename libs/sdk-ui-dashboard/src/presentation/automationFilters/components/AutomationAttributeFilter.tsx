// (C) 2025 GoodData Corporation

import { MutableRefObject, useCallback } from "react";
import { FilterContextItem, IDashboardAttributeFilter, ObjRef } from "@gooddata/sdk-model";
import {
    AttributeFilterButton,
    IAttributeFilterButtonProps,
    IAttributeFilterDropdownButtonProps,
} from "@gooddata/sdk-ui-filters";
import { Bubble, BubbleHoverTrigger, OverlayPositionType, UiChip, UiSkeleton } from "@gooddata/sdk-ui-kit";
import { DefaultDashboardAttributeFilter } from "../../../presentation/filterBar/index.js";
import {
    AutomationAttributeFilterProvider,
    useAutomationAttributeFilterContext,
} from "./AutomationAttributeFilterContext.js";
import { useIntl } from "react-intl";

const tooltipAlignPoints = [
    { align: "bl tl", offset: { x: 11, y: 0 } },
    { align: "tl bl", offset: { x: 11, y: 0 } },
];

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
    const { isLocked, onDelete, filter, deleteAriaLabel } = useAutomationAttributeFilterContext();
    const label = `${props.title!}: ${props.subtitle!}`;
    const tag = props.selectedItemsCount ? `(${props.selectedItemsCount})` : undefined;
    return (
        <BubbleHoverTrigger showDelay={200} hideDelay={0}>
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
                }}
                buttonRef={props.buttonRef as MutableRefObject<HTMLButtonElement>}
            />
            <Bubble alignPoints={tooltipAlignPoints}>
                {label}
                {tag ? ` ${tag}` : null}
            </Bubble>
        </BubbleHoverTrigger>
    );
}
