// (C) 2025 GoodData Corporation

import React, { useCallback, useMemo } from "react";
import {
    FilterContextItem,
    IAttributeFilter,
    IDashboardAttributeFilter,
    isNegativeAttributeFilter,
    ObjRef,
} from "@gooddata/sdk-model";
import {
    AttributeFilterButton,
    IAttributeFilterButtonProps,
    IAttributeFilterDropdownButtonProps,
} from "@gooddata/sdk-ui-filters";
import { Bubble, BubbleHoverTrigger, OverlayPositionType, UiChip, UiSkeleton } from "@gooddata/sdk-ui-kit";
import noop from "lodash/noop.js";
import { DefaultDashboardAttributeFilter } from "../../../presentation/filterBar/index.js";
import { attributeFilterToDashboardAttributeFilter } from "../../../_staging/dashboard/dashboardFilterConverter.js";
import {
    AutomationAttributeFilterProvider,
    useAutomationAttributeFilterContext,
} from "./AutomationAttributeFilterContext.js";
import { useIntl } from "react-intl";

const tooltipAlignPoints = [
    { align: "bl tl", offset: { x: 11, y: 0 } },
    { align: "tl bl", offset: { x: 11, y: 0 } },
];

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
            <DefaultDashboardAttributeFilter
                filter={filter}
                onFilterChanged={noop}
                displayAsLabel={displayAsLabel}
                AttributeFilterComponent={AttributeFilter}
                overlayPositionType={overlayPositionType}
            />
        </AutomationAttributeFilterProvider>
    );
};

function AttributeFilter(props: IAttributeFilterButtonProps) {
    const { onChange, filter } = useAutomationAttributeFilterContext();

    const filterTitle = useMemo(() => {
        return filter?.attributeFilter.title;
    }, [filter]);

    const filterLocalIdentifier = useMemo(() => {
        return filter?.attributeFilter.localIdentifier;
    }, [filter]);

    const filterSelectionMode = useMemo(() => {
        return filter?.attributeFilter.selectionMode;
    }, [filter]);

    const handleOnApply = useCallback(
        (newFilter: IAttributeFilter) => {
            onChange?.(
                attributeFilterToDashboardAttributeFilter(
                    newFilter,
                    filterLocalIdentifier,
                    filterTitle,
                    undefined,
                    isNegativeAttributeFilter(newFilter),
                    filterSelectionMode,
                ),
            );
        },
        [filterLocalIdentifier, filterSelectionMode, filterTitle, onChange],
    );

    return (
        <AttributeFilterButton
            {...props}
            onApply={handleOnApply}
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
                buttonRef={props.buttonRef as React.MutableRefObject<HTMLButtonElement>}
            />
            <Bubble alignPoints={tooltipAlignPoints}>
                {label}
                {tag ? ` ${tag}` : null}
            </Bubble>
        </BubbleHoverTrigger>
    );
}
