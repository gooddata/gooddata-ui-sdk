// (C) 2022-2026 GoodData Corporation

import { type ChangeEvent, useCallback } from "react";

import cx from "classnames";
import { FormattedMessage, useIntl } from "react-intl";

import { type ICatalogDateDataset, type IWidget, type ObjRef, isInsightWidget } from "@gooddata/sdk-model";
import { type IAlignPoint, ShortenedText } from "@gooddata/sdk-ui-kit";

import { useCurrentDateFilterConfig } from "../../../dragAndDrop/useCurrentDateFilterConfig.js";

import { getUnrelatedDateDataset } from "./utils.js";

const tooltipAlignPoints: IAlignPoint[] = [{ align: "cl cr", offset: { x: -20, y: 0 } }];

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
    enableUnrelatedItemsVisibility?: boolean;
    /**
     * When the related date datasets query failed, the empty result must not be presented
     * as "cannot be filtered by date" - the related date datasets are unknown, not absent.
     */
    datasetsLoadFailed?: boolean;
}

export function DateFilterCheckbox({
    isDropdownLoading,
    isFilterLoading,
    dateFilterEnabled,
    selectedDateDataset,
    selectedDateDatasetHidden,
    dateFilterCheckboxDisabled,
    relatedDateDatasets,
    widget,
    onDateDatasetFilterEnabled,
    enableUnrelatedItemsVisibility,
    datasetsLoadFailed,
}: IDateFilterCheckboxProps) {
    const unrelatedDateDataset =
        relatedDateDatasets &&
        getUnrelatedDateDataset(relatedDateDatasets, selectedDateDataset, selectedDateDatasetHidden);

    const hasRelatedDateDataSets = !!relatedDateDatasets?.length;

    const showNoRelatedDate =
        !hasRelatedDateDataSets &&
        !datasetsLoadFailed &&
        !selectedDateDatasetHidden &&
        dateFilterEnabled &&
        !isDropdownLoading &&
        !dateFilterCheckboxDisabled &&
        !enableUnrelatedItemsVisibility;

    const showLoadFailed =
        !!datasetsLoadFailed &&
        !hasRelatedDateDataSets &&
        !selectedDateDatasetHidden &&
        dateFilterEnabled &&
        !isDropdownLoading &&
        !dateFilterCheckboxDisabled;

    const showError =
        (!!unrelatedDateDataset || showNoRelatedDate || showLoadFailed) &&
        !isDropdownLoading &&
        !isFilterLoading &&
        dateFilterEnabled &&
        !selectedDateDatasetHidden &&
        !dateFilterCheckboxDisabled;

    const classes = cx("s-date-filter-by-item", "input-checkbox-label", "filter-by-item", {
        "date-filter-error": showError,
    });

    const handleChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            const { checked } = e.target;
            const dateDataSetRef = selectedDateDataset ? selectedDateDataset.dataSet.ref : undefined;
            // convert to non-immutable
            onDateDatasetFilterEnabled(checked, dateDataSetRef);
        },
        [onDateDatasetFilterEnabled, selectedDateDataset],
    );

    const intl = useIntl();
    const defaultDateFilterName = intl.formatMessage({ id: "dateFilterDropdown.title" });

    const { title } = useCurrentDateFilterConfig(undefined, defaultDateFilterName);

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
                    <ShortenedText tooltipAlignPoints={tooltipAlignPoints} tagName="span" className="title">
                        {title}
                    </ShortenedText>
                </span>
                {isFilterLoading ? <div className="gd-spinner small" /> : null}
            </label>
            {!isFilterLoading && showLoadFailed ? (
                <div className="gd-message error s-date-datasets-load-failed">
                    <FormattedMessage id="configurationPanel.dateDatasetsLoadFailed" />
                </div>
            ) : null}
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
}
