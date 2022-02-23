// (C) 2022 GoodData Corporation
import React, { useState, useCallback } from "react";
import { injectIntl, WrappedComponentProps, FormattedMessage } from "react-intl";
import { ISortItem } from "@gooddata/sdk-model";

import { ChartSortingDropdownBody } from "./ChartSortingDropdownBody";
import { ChartSortingDropdown } from "./ChartSortingDropdown";
import { IBucketItemNames, ISortConfig } from "./types";
import { Button } from "../Button";

/**
 * @internal
 */
export interface ChartSortingOwnProps {
    sortConfig: ISortConfig;
    bucketItemNames: IBucketItemNames;
    onApply: (sortItems: ISortItem[]) => void;
    onCancel: () => void;
    onClose?: () => void;

    enableRenamingMeasureToMetric?: boolean;
}

/**
 * @internal
 */
export type ChartSortingProps = ChartSortingOwnProps & WrappedComponentProps;

/**
 * @internal
 */
export const ChartSorting: React.FC<ChartSortingProps> = ({
    sortConfig,
    intl,
    bucketItemNames,
    onCancel,
    onApply,
    onClose,
    enableRenamingMeasureToMetric,
}) => {
    const [currentSort, setCurrentSort] = useState<ISortItem[]>(sortConfig.currentSort);
    const disabledExplanationTooltip = sortConfig.disabledExplanation;

    // Available Sorts - from which will generate dropdowns
    const availableSorts = sortConfig.availableSorts;

    const handleApply = useCallback(() => {
        onApply(currentSort);
    }, [currentSort]);

    const onSelect = (item: ISortItem[]) => {
        setCurrentSort(item);
    };

    return (
        <>
            <ChartSortingDropdownBody onClose={onClose}>
                <div className="gd-sort-charting-dropdown-header s-sort-charting-dropdown-header">
                    <FormattedMessage tagName="div" id="sorting.dropdown.header" />
                </div>
                <div className="section chart-sorting-body gd-sort-charting-dropdown">
                    <ChartSortingDropdown
                        currentSort={currentSort}
                        availableSorts={availableSorts}
                        bucketItemNames={bucketItemNames}
                        disabledExplanationTooltip={disabledExplanationTooltip}
                        intl={intl}
                        onSelect={onSelect}
                        enableRenamingMeasureToMetric={enableRenamingMeasureToMetric}
                    />
                </div>
                <div className="chart-sorting-dropdown-footer">
                    <Button
                        className="gd-button-secondary gd-button-small s-sorting-dropdown-cancel"
                        value={intl.formatMessage({ id: "cancel" })}
                        onClick={onCancel}
                    />
                    <Button
                        className="gd-button-action gd-button-small s-sorting-dropdown-apply"
                        value={intl.formatMessage({ id: "apply" })}
                        onClick={handleApply}
                    />
                </div>
            </ChartSortingDropdownBody>
        </>
    );
};

/**
 * @internal
 */
export const ChartSortingWithIntl = injectIntl(ChartSorting);
