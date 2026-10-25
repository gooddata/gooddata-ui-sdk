// (C) 2022-2026 GoodData Corporation

import { useState } from "react";

import { type IDecoratedDateDataset } from "../../../../models/decorated_date_dataset.js";
import {
    type EmptyDateValuesFilterMode,
    type IAttributeFilter,
    type IOnAttributeFilterApplyProps,
} from "../../../../store/filter_bar/filter_bar_types.js";
import { type IDateDatasetRefWithGranularities } from "../../../../typings/datasets.js";

import { AdditionalDateAttributes } from "./AdditionalDateAttributes.js";

const removeId = (id: string, ids: string[]) => ids.filter((itemId) => itemId !== id);

export interface IAdditionalDateFiltersProps {
    dateDataset: IDecoratedDateDataset;
    dateDatasetRefsWithGranularities: IDateDatasetRefWithGranularities[];
    additionalDateAttributeFilters: IAttributeFilter[];
    migratedAdditionalFilters: string[];
    emptyDateValuesFilterMode?: EmptyDateValuesFilterMode;
    onFiltersUpdate: (filters: IAttributeFilter[]) => void;
    /**
     * Called on every interaction with the section; the warning about the additional filters a date
     * dimension change removed is an acknowledgement, so any edit here dismisses it.
     */
    onMigratedFiltersDismiss: () => void;
    onEmptyDateValuesFilterModeChange: (mode: EmptyDateValuesFilterMode | undefined) => void;
    isDisabled?: boolean;
    isAllTime?: boolean;
    showDateGranularities?: boolean;
    isEmptyDateValuesFilterAvailable?: boolean;
}

export function AdditionalDateFilters({
    dateDataset,
    dateDatasetRefsWithGranularities,
    additionalDateAttributeFilters,
    migratedAdditionalFilters,
    emptyDateValuesFilterMode,
    onFiltersUpdate,
    onMigratedFiltersDismiss,
    onEmptyDateValuesFilterModeChange,
    isDisabled,
    isAllTime,
    showDateGranularities,
    isEmptyDateValuesFilterAvailable,
}: IAdditionalDateFiltersProps) {
    const [autoOpenedFilters, setAutoOpenedFilters] = useState([]);
    const [isEmptyDateValuesFilterOpenOnInit, setIsEmptyDateValuesFilterOpenOnInit] = useState(false);

    const onFilterSelect = (filter: IAttributeFilter) => {
        onFiltersUpdate([...additionalDateAttributeFilters, filter]);
        setAutoOpenedFilters((autOpenedFilters) => [...autOpenedFilters, filter.localIdentifier]);
        onMigratedFiltersDismiss();
    };

    const onFilterRemove = (localIdentifier: string) => {
        onFiltersUpdate(
            additionalDateAttributeFilters.filter((filter) => filter.localIdentifier !== localIdentifier),
        );
        onMigratedFiltersDismiss();
    };

    const onFilterApply = (applyProps: IOnAttributeFilterApplyProps) => {
        const { filterLocalIdentifier, selectedElements, totalElementsCount, isInverted } = applyProps;
        setAutoOpenedFilters((autoOpenedFilters) => removeId(filterLocalIdentifier, autoOpenedFilters));
        onFiltersUpdate(
            additionalDateAttributeFilters.map((filter) =>
                filter.localIdentifier === filterLocalIdentifier
                    ? {
                          ...filter,
                          filterConfig: {
                              ...filter.filterConfig,
                              selectedElements,
                              totalElementsCount,
                              isInverted,
                          },
                      }
                    : filter,
            ),
        );
        onMigratedFiltersDismiss();
    };

    const onFilterClose = (localIdentifier: string) => {
        setAutoOpenedFilters((autoOpenedFilters) => removeId(localIdentifier, autoOpenedFilters));
        onMigratedFiltersDismiss();
    };

    const handleEmptyDateValuesFilterAdd = () => {
        onEmptyDateValuesFilterModeChange("exclude");
        setIsEmptyDateValuesFilterOpenOnInit(true);
        onMigratedFiltersDismiss();
    };

    const handleEmptyDateValuesFilterRemove = () => {
        setIsEmptyDateValuesFilterOpenOnInit(false);
        onEmptyDateValuesFilterModeChange(undefined);
        onMigratedFiltersDismiss();
    };

    const handleEmptyDateValuesFilterModeChange = (mode: EmptyDateValuesFilterMode) => {
        onEmptyDateValuesFilterModeChange(mode);
        onMigratedFiltersDismiss();
    };

    return (
        <AdditionalDateAttributes
            selectedDateDataset={dateDataset}
            dateDatasetRefsWithGranularities={dateDatasetRefsWithGranularities}
            additionalDateAttributeFilters={additionalDateAttributeFilters}
            onSelect={onFilterSelect}
            onApply={onFilterApply}
            onClose={onFilterClose}
            onRemove={onFilterRemove}
            migratedAdditionalFilters={migratedAdditionalFilters}
            autoOpenedFilters={autoOpenedFilters}
            emptyDateValuesFilterMode={emptyDateValuesFilterMode}
            onEmptyDateValuesFilterModeChange={handleEmptyDateValuesFilterModeChange}
            onEmptyDateValuesFilterAdd={handleEmptyDateValuesFilterAdd}
            onEmptyDateValuesFilterRemove={handleEmptyDateValuesFilterRemove}
            isEmptyDateValuesFilterOpenOnInit={isEmptyDateValuesFilterOpenOnInit}
            isDisabled={isDisabled}
            isAllTime={isAllTime}
            showDateGranularities={showDateGranularities}
            isEmptyDateValuesFilterAvailable={isEmptyDateValuesFilterAvailable}
        />
    );
}
