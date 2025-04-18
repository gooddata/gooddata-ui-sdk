// (C) 2025 GoodData Corporation

import React, { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { FilterContextItem, IAttributeFilter, IDashboardAttributeFilter, ObjRef } from "@gooddata/sdk-model";
import { AttributeFilterButton, IAttributeFilterButtonProps } from "@gooddata/sdk-ui-filters";
import { Bubble, BubbleHoverTrigger, UiChip, UiSkeleton } from "@gooddata/sdk-ui-kit";
import noop from "lodash/noop.js";
import { DefaultDashboardAttributeFilter } from "../../../presentation/filterBar/index.js";
import { attributeFilterToDashboardAttributeFilter } from "../../../_staging/dashboard/dashboardFilterConverter.js";
import isEqual from "lodash/isEqual.js";

const tooltipAlignPoints = [
    { align: "bl tl", offset: { x: 11, y: 0 } },
    { align: "tl bl", offset: { x: 11, y: 0 } },
];

export const AutomationAttributeFilter: React.FC<{
    filter: IDashboardAttributeFilter;
    onChange: (filter: FilterContextItem, storeFilters?: boolean) => void;
    onDelete: (filter: FilterContextItem) => void;
    isLocked?: boolean;
    displayAsLabel?: ObjRef;
    storeFilters?: boolean;
}> = ({ filter, onChange, onDelete, isLocked, displayAsLabel, storeFilters }) => {
    const localFilter = useRef(filter);
    const [validator, invalidate] = useReducer((x) => x + 1, 0);

    // We only invalidate the component if the filter changes
    // from the outside and not by onChange handler.
    useEffect(() => {
        if (isEqual(localFilter.current, filter)) {
            return;
        }
        localFilter.current = filter;
        invalidate();
    }, [filter, invalidate]);

    const CustomAttributeFilter = useMemo(() => {
        return function AttributeFilter(props: IAttributeFilterButtonProps) {
            const handleOnApply = useCallback((newFilter: IAttributeFilter) => {
                // Store the updated filter locally to prevent the entire component from being reinitialized
                localFilter.current = attributeFilterToDashboardAttributeFilter(
                    newFilter,
                    filter.attributeFilter.localIdentifier,
                    filter.attributeFilter.title,
                );
                onChange(localFilter.current, storeFilters);
            }, []);

            return (
                <AttributeFilterButton
                    {...props}
                    onApply={handleOnApply}
                    LoadingComponent={() => (
                        <UiSkeleton itemWidth={160} itemHeight={27} itemBorderRadius={20} />
                    )}
                    DropdownButtonComponent={(dropdownProps) => {
                        const label = `${dropdownProps.title!}: ${dropdownProps.subtitle!}`;
                        const tag = dropdownProps.selectedItemsCount
                            ? `(${dropdownProps.selectedItemsCount})`
                            : undefined;
                        return (
                            <BubbleHoverTrigger showDelay={200} hideDelay={0}>
                                <UiChip
                                    label={label}
                                    tag={tag}
                                    isLocked={isLocked}
                                    isActive={dropdownProps.isOpen}
                                    isDeletable={!isLocked}
                                    onClick={dropdownProps.onClick}
                                    onDelete={() => onDelete(filter)}
                                    accessibilityConfig={{
                                        isExpanded: dropdownProps.isOpen,
                                    }}
                                />
                                <Bubble alignPoints={tooltipAlignPoints}>
                                    {label}
                                    {tag ? ` ${tag}` : null}
                                </Bubble>
                            </BubbleHoverTrigger>
                        );
                    }}
                />
            );
        };
        // We only want this to be dependent on validator as all other props are already
        // depenendent on changing filter, so the memoization would not work by design.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [validator, storeFilters]);

    return (
        <DefaultDashboardAttributeFilter
            filter={filter}
            onFilterChanged={noop}
            displayAsLabel={displayAsLabel}
            AttributeFilterComponent={CustomAttributeFilter}
        />
    );
};
