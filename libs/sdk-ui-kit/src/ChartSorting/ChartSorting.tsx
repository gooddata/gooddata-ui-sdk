// (C) 2022-2023 GoodData Corporation
import React, { useState, useCallback, useMemo } from "react";
import { injectIntl, WrappedComponentProps, FormattedMessage } from "react-intl";
import { ISortItem } from "@gooddata/sdk-model";
import { IntlWrapper } from "@gooddata/sdk-ui";
import isEqual from "lodash/isEqual.js";

import { ChartSortingDropdownBody } from "./ChartSortingDropdownBody.js";
import { ChartSortingDropdown } from "./ChartSortingDropdown.js";
import { IBucketItemDescriptors, IAvailableSortsGroup } from "./types.js";
import { Button } from "../Button/index.js";

/**
 * @internal
 */
export interface ChartSortingOwnProps {
    currentSort: ISortItem[];
    availableSorts: IAvailableSortsGroup[];
    bucketItems: IBucketItemDescriptors;
    onApply: (sortItems: ISortItem[]) => void;
    onCancel: () => void;
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
    bucketItems,
    buttonNode,
    onCancel,
    onApply,
    enableRenamingMeasureToMetric,
}) => {
    const [currentSelectedSort, setCurrentSort] = useState<ISortItem[]>(currentSort);

    const handleApply = useCallback(() => {
        onApply(currentSelectedSort);
    }, [onApply, currentSelectedSort]);

    const onSelect = (item: ISortItem[]) => {
        setCurrentSort(item);
    };
    const isApplyEnabled = useMemo(
        () => !isEqual(currentSort, currentSelectedSort),
        [currentSort, currentSelectedSort],
    );
    return (
        <ChartSortingDropdownBody buttonNode={buttonNode} onClose={onCancel}>
            <div className="gd-sort-charting-dropdown-header s-sort-charting-dropdown-header">
                <FormattedMessage id="sorting.dropdown.header" />
            </div>
            <div className="gd-sort-charting-body gd-sort-charting-dropdown">
                <ChartSortingDropdown
                    currentSort={currentSelectedSort}
                    availableSorts={availableSorts}
                    bucketItems={bucketItems}
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
                    disabled={!isApplyEnabled}
                />
            </div>
        </ChartSortingDropdownBody>
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
