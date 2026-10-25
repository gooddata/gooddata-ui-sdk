// (C) 2022-2026 GoodData Corporation

import { Fragment, type ReactElement } from "react";

import { type IntlShape } from "react-intl";

import { getSelectionTitle } from "../../../../models/decorated_metric_attribute_filter.js";
import { type Granularity, getGranularityLabel } from "../../../../models/granularity.js";
import { type IAdditionalDateFilterLabel } from "../../../../selectors/additional_date_filter_selector.js";

const getAdditionalFiltersSelectionAsList = (
    granularityLabel: string,
    { isAllSelected, isInverted, selectedElements }: IAdditionalDateFilterLabel,
    intl: IntlShape,
) =>
    getSelectionTitle(
        granularityLabel,
        {
            isAllSelected,
            isInverted,
            selectedElements,
        },
        intl,
    );

const getAdditionalFiltersSelectionAsNumber = (
    { selectionSize, isInverted }: IAdditionalDateFilterLabel,
    totalElementsCount: number,
) => `(${isInverted ? totalElementsCount - selectionSize : selectionSize})`;

const getAdditionalFiltersSelection = (
    additionalDateFilterLabels: IAdditionalDateFilterLabel[],
    granularityLabel: string,
    additionalFilterLabel: IAdditionalDateFilterLabel,
    hasTimeComparisonConfigured: boolean,
    intl: IntlShape,
) => {
    const { totalElementsCount } = additionalFilterLabel;
    // the selection size needs the total; without it the values are listed instead
    const isListed =
        totalElementsCount === undefined ||
        (additionalDateFilterLabels.length === 1 && !hasTimeComparisonConfigured);
    return isListed
        ? getAdditionalFiltersSelectionAsList(granularityLabel, additionalFilterLabel, intl)
        : getAdditionalFiltersSelectionAsNumber(additionalFilterLabel, totalElementsCount);
};

export interface IAdditionalDateFilterEntry {
    granularity: Granularity;
    /** the date attribute's granularity label, e.g. "Month of Year" */
    name: string;
    /** the selection: listed values for a lone filter, otherwise the selection size */
    value: string;
}

/**
 * The additional date filters as name/value text, the way the date filter button shows them: a lone
 * filter (with no comparison) lists its values, otherwise each shows its selection size.
 */
export const getAdditionalDateFilterEntries = (
    additionalDateFilterLabels: IAdditionalDateFilterLabel[],
    hasTimeComparisonConfigured: boolean,
    intl: IntlShape,
): IAdditionalDateFilterEntry[] =>
    additionalDateFilterLabels.map((additionalFilterLabel) => {
        const { granularity } = additionalFilterLabel;
        const name = getGranularityLabel(granularity, intl);
        const value = getAdditionalFiltersSelection(
            additionalDateFilterLabels,
            name,
            additionalFilterLabel,
            hasTimeComparisonConfigured,
            intl,
        );
        return { granularity, name, value };
    });

export const getAdditionalDateFiltersValues = (
    additionalDateFilterLabels: IAdditionalDateFilterLabel[],
    hasTimeComparisonConfigured: boolean,
    intl: IntlShape,
): ReactElement[] =>
    getAdditionalDateFilterEntries(additionalDateFilterLabels, hasTimeComparisonConfigured, intl).map(
        ({ granularity, name, value }) => (
            <Fragment key={granularity}>
                <span className="s-additional-filter-name">{name}</span>
                <span>:&nbsp;</span>
                <span className="adi-additional-filter-value s-additional-filter-value">{value}</span>
            </Fragment>
        ),
    );
