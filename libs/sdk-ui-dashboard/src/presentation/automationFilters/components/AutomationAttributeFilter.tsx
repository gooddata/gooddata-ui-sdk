// (C) 2025 GoodData Corporation

import React, { useCallback, useMemo } from "react";
import { FilterContextItem, IAttributeFilter, IDashboardAttributeFilter, ObjRef } from "@gooddata/sdk-model";
import {
    AttributeFilterButton,
    IAttributeFilterButtonProps,
    IAttributeFilterDropdownButtonProps,
} from "@gooddata/sdk-ui-filters";
import { UiChip, UiSkeleton } from "@gooddata/sdk-ui-kit";
import noop from "lodash/noop.js";
import { DefaultDashboardAttributeFilter } from "../../../presentation/filterBar/index.js";
import { attributeFilterToDashboardAttributeFilter } from "../../../_staging/dashboard/dashboardFilterConverter.js";

export const AutomationAttributeFilter: React.FC<{
    filter: IDashboardAttributeFilter;
    onChange: (filter: FilterContextItem) => void;
    onDelete: (filter: FilterContextItem) => void;
    isLocked?: boolean;
    displayAsLabel?: ObjRef;
}> = ({ filter, onChange, onDelete, isLocked, displayAsLabel }) => {
    const CustomAttributeFilter = useMemo(() => {
        return function AttributeFilter(props: IAttributeFilterButtonProps) {
            const CustomLoadingComponent = useMemo(() => {
                return function LoadingComponent() {
                    return <UiSkeleton itemWidth={160} itemHeight={27} itemBorderRadius={20} />;
                };
            }, []);

            const CustomDropdownButtonComponent = useMemo(() => {
                return function DropdownButton(props: IAttributeFilterDropdownButtonProps) {
                    return (
                        <UiChip
                            label={props.title! + ": " + props.subtitle!}
                            tag={props.selectedItemsCount ? `(${props.selectedItemsCount})` : undefined}
                            isLocked={isLocked}
                            isActive={props.isOpen}
                            isDeletable={!isLocked}
                            onClick={props.onClick}
                            onDelete={() => onDelete(filter)}
                        />
                    );
                };
            }, []);

            const handleOnApply = useCallback((newFilter: IAttributeFilter) => {
                onChange(
                    attributeFilterToDashboardAttributeFilter(
                        newFilter,
                        filter.attributeFilter.localIdentifier,
                        filter.attributeFilter.title,
                    ),
                );
            }, []);

            return (
                <AttributeFilterButton
                    {...props}
                    onApply={handleOnApply}
                    LoadingComponent={CustomLoadingComponent}
                    DropdownButtonComponent={CustomDropdownButtonComponent}
                />
            );
        };
    }, [isLocked, onDelete, filter, onChange]);

    return (
        <DefaultDashboardAttributeFilter
            filter={filter}
            onFilterChanged={noop}
            displayAsLabel={displayAsLabel}
            AttributeFilterComponent={CustomAttributeFilter}
        />
    );
};
