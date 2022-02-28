// (C) 2022 GoodData Corporation
import React, { useState, useCallback } from "react";
import { injectIntl, WrappedComponentProps, FormattedMessage } from "react-intl";
import { ISortItem } from "@gooddata/sdk-model";
import { IntlWrapper } from "@gooddata/sdk-ui";

import { ChartSortingDropdownBody } from "./ChartSortingDropdownBody";
import { ChartSortingDropdown } from "./ChartSortingDropdown";
import { IBucketItemNames, IAvailableSortsGroup } from "./types";
import { Button } from "../Button";

/**
 * @internal
 */
export interface ChartSortingOwnProps {
    currentSort: ISortItem[];
    // Available Sorts - from which will generate dropdowns
    availableSorts: IAvailableSortsGroup[];
    bucketItemNames: IBucketItemNames;
    onApply: (sortItems: ISortItem[]) => void;
    onCancel: () => void;
    onClose?: () => void;

    buttonNode?: HTMLElement | string;
    locale?: string;
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
    currentSort,
    availableSorts,
    intl,
    bucketItemNames,
    buttonNode,
    onCancel,
    onApply,
    enableRenamingMeasureToMetric,
}) => {
    const [currentSelectedSort, setCurrentSort] = useState<ISortItem[]>(currentSort);

    const handleApply = useCallback(() => {
        onApply(currentSelectedSort);
    }, [currentSelectedSort]);

    const onSelect = (item: ISortItem[]) => {
        setCurrentSort(item);
    };
    return (
        <>
            <ChartSortingDropdownBody buttonNode={buttonNode} onClose={onCancel}>
                <div className="gd-sort-charting-dropdown-header s-sort-charting-dropdown-header">
                    <FormattedMessage tagName="div" id="sorting.dropdown.header" />
                </div>
                <div className="gd-sort-charting-body gd-sort-charting-dropdown">
                    <ChartSortingDropdown
                        currentSort={currentSelectedSort}
                        availableSorts={availableSorts}
                        bucketItemNames={bucketItemNames}
                        intl={intl}
                        onSelect={onSelect}
                        enableRenamingMeasureToMetric={enableRenamingMeasureToMetric}
                    />
                </div>
                <div className="gd-chart-sorting-dropdown-footer">
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

/**
 * @internal
 */
export const ChartSortingDialog: React.FC<ChartSortingOwnProps> = (props) => (
    <IntlWrapper locale={props.locale}>
        <ChartSortingWithIntl {...props} />
    </IntlWrapper>
);
