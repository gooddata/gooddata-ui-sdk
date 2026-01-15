// (C) 2022-2026 GoodData Corporation

import { useCallback, useMemo, useState } from "react";

import { isEqual } from "lodash-es";
import { FormattedMessage, type WrappedComponentProps, injectIntl } from "react-intl";

import { type ISortItem } from "@gooddata/sdk-model";
import { IntlWrapper } from "@gooddata/sdk-ui";

import { ChartSortingDropdown } from "./ChartSortingDropdown.js";
import { ChartSortingDropdownBody } from "./ChartSortingDropdownBody.js";
import { type IAvailableSortsGroup, type IBucketItemDescriptors } from "./types.js";
import { Button } from "../Button/index.js";

/**
 * @internal
 */
export interface IChartSortingOwnProps {
    currentSort: ISortItem[];
    availableSorts: IAvailableSortsGroup[];
    bucketItems: IBucketItemDescriptors;
    onApply: (sortItems: ISortItem[]) => void;
    onCancel: () => void;
    buttonNode?: HTMLElement | string;
    locale?: string;
}

/**
 * @internal
 */
export interface IChartSortingProps extends IChartSortingOwnProps, WrappedComponentProps {}

function ChartSorting({
    currentSort,
    availableSorts,
    intl,
    bucketItems,
    buttonNode,
    onCancel,
    onApply,
}: IChartSortingProps) {
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
}

/**
 * @internal
 */
export const ChartSortingWithIntl = injectIntl(ChartSorting);

/**
 * @internal
 */
export function ChartSortingDialog(props: IChartSortingOwnProps) {
    return (
        <IntlWrapper locale={props.locale}>
            <ChartSortingWithIntl {...props} />
        </IntlWrapper>
    );
}
