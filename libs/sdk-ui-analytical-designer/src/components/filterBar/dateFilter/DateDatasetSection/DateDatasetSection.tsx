// (C) 2022-2026 GoodData Corporation

import { FormattedMessage } from "react-intl";

import { type IDecoratedDateDataset } from "../../../../models/decorated_date_dataset.js";
import { type IDecoratedDateDatasets } from "../../../../models/decorated_date_datasets.js";
import { DateDatasetsDropdown } from "../../../buckets/categories/DateDatasetsDropdown.js";
import { DROPDOWN_ITEM_HEIGHT } from "../constants.js";

export interface IDateDatasetSectionProps {
    selectedDateDataset: IDecoratedDateDataset;
    dateDatasets: IDecoratedDateDatasets;
    onChange: (dataset: IDecoratedDateDataset) => void;
    isDateDatasetsDropdownLoaded: boolean;
    loadDateDatasets: (ignoreDateDataset: boolean) => void;
    enableUnavailableItemsVisibility: boolean;
}

export function DateDatasetSection({
    onChange,
    selectedDateDataset,
    dateDatasets,
    loadDateDatasets,
    isDateDatasetsDropdownLoaded,
    enableUnavailableItemsVisibility,
}: IDateDatasetSectionProps) {
    const onDateDatasetDropdownOpenStateChanged = (isOpen: boolean) => {
        if (isOpen) {
            loadDateDatasets(true);
        }
    };

    return (
        <div className="section adi-date-dropdown adi-date-dataset-select">
            <label htmlFor="date-dataset-dropdown">
                <FormattedMessage id="filter.date.calendar" />
            </label>
            <DateDatasetsDropdown
                className="s-filter-date-date-dataset-switch adi-date-dataset-select-dropdown"
                unavailableCount={dateDatasets.unavailable}
                dateDatasets={dateDatasets.items}
                activeDateDataset={selectedDateDataset}
                onDateDatasetChange={onChange}
                itemHeight={DROPDOWN_ITEM_HEIGHT}
                defaultDialogHeight={0}
                isDateDatasetsDropdownLoaded={isDateDatasetsDropdownLoaded}
                onOpenStateChanged={onDateDatasetDropdownOpenStateChanged}
                enableUnavailableItemsVisibility={enableUnavailableItemsVisibility}
            />
        </div>
    );
}
