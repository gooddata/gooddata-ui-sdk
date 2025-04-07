// (C) 2025 GoodData Corporation

import React from "react";
import { FilterContextItem, IDashboardAttributeFilter, ObjRef } from "@gooddata/sdk-model";
import { AttributeFilterButton } from "@gooddata/sdk-ui-filters";
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
    return (
        <DefaultDashboardAttributeFilter
            filter={filter}
            onFilterChanged={noop}
            displayAsLabel={displayAsLabel}
            AttributeFilterComponent={(props) => (
                <AttributeFilterButton
                    {...props}
                    LoadingComponent={() => (
                        <UiSkeleton itemWidth={160} itemHeight={27} itemBorderRadius={20} />
                    )}
                    onApply={(newFilter) =>
                        onChange(
                            attributeFilterToDashboardAttributeFilter(
                                newFilter,
                                filter.attributeFilter.localIdentifier,
                                filter.attributeFilter.title,
                            ),
                        )
                    }
                    DropdownButtonComponent={(innerProps) => (
                        <UiChip
                            label={innerProps.title! + ": " + innerProps.subtitle!}
                            tag={
                                innerProps.selectedItemsCount
                                    ? `(${innerProps.selectedItemsCount})`
                                    : undefined
                            }
                            isLocked={isLocked}
                            isActive={innerProps.isOpen}
                            isDeletable={!isLocked}
                            onClick={innerProps.onClick}
                            onDelete={() => onDelete(filter)}
                        />
                    )}
                />
            )}
        />
    );
};
