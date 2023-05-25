// (C) 2022 GoodData Corporation
import React, { useCallback } from "react";
import cx from "classnames";
import { FormattedMessage } from "react-intl";
import { ICatalogDateDataset, isInsightWidget, IWidget, ObjRef } from "@gooddata/sdk-model";
import { getUnrelatedDateDataset } from "./utils.js";

interface IDateFilterCheckboxProps {
    widget: IWidget;
    relatedDateDatasets: readonly ICatalogDateDataset[] | undefined;
    isDropdownLoading?: boolean;
    isFilterLoading?: boolean;
    selectedDateDataset?: ICatalogDateDataset;
    dateFilterEnabled?: boolean;
    selectedDateDatasetHidden?: boolean;
    dateFilterCheckboxDisabled?: boolean;
    onDateDatasetFilterEnabled: (enabled: boolean, dateDatasetRef: ObjRef | undefined) => void;
}

export const DateFilterCheckbox: React.FC<IDateFilterCheckboxProps> = (props) => {
    const {
        isDropdownLoading,
        isFilterLoading,
        dateFilterEnabled,
        selectedDateDataset,
        selectedDateDatasetHidden,
        dateFilterCheckboxDisabled,
        relatedDateDatasets,
        widget,
        onDateDatasetFilterEnabled,
    } = props;

    const unrelatedDateDataset =
        relatedDateDatasets &&
        getUnrelatedDateDataset(relatedDateDatasets, selectedDateDataset, selectedDateDatasetHidden);

    const hasRelatedDateDataSets = !!relatedDateDatasets?.length;

    const showNoRelatedDate =
        !hasRelatedDateDataSets &&
        !selectedDateDatasetHidden &&
        dateFilterEnabled &&
        !isDropdownLoading &&
        !dateFilterCheckboxDisabled;

    const showError =
        (!!unrelatedDateDataset || showNoRelatedDate) &&
        !isDropdownLoading &&
        !isFilterLoading &&
        dateFilterEnabled &&
        !selectedDateDatasetHidden &&
        !dateFilterCheckboxDisabled;

    const classes = cx("s-date-filter-by-item", "input-checkbox-label", "filter-by-item", {
        "date-filter-error": showError,
    });

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const { checked } = e.target;
            const dateDataSetRef = selectedDateDataset ? selectedDateDataset.dataSet.ref : undefined;
            // convert to non-immutable
            onDateDatasetFilterEnabled(checked, dateDataSetRef);
        },
        [onDateDatasetFilterEnabled, selectedDateDataset],
    );

    return (
        <div>
            <label className={classes} htmlFor="configurationPanel.date.input">
                <input
                    className="input-checkbox s-date-filter-checkbox"
                    id="configurationPanel.date.input"
                    type="checkbox"
                    checked={!dateFilterCheckboxDisabled && dateFilterEnabled}
                    disabled={dateFilterCheckboxDisabled}
                    onChange={handleChange}
                />
                <span className="input-label-text title">
                    <FormattedMessage id="configurationPanel.date" />
                </span>
                {isFilterLoading ? <div className="gd-spinner small" /> : null}
            </label>
            {!isFilterLoading && showNoRelatedDate ? (
                <div className="gd-message error s-no-related-date">
                    {isInsightWidget(widget) ? (
                        <FormattedMessage id="configurationPanel.vizCantBeFilteredByDate" />
                    ) : (
                        <FormattedMessage id="configurationPanel.kpiCantBeFilteredByDate" />
                    )}
                </div>
            ) : null}
        </div>
    );
};
