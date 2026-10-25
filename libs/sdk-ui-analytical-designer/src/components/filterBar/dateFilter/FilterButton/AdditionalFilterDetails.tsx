// (C) 2022-2026 GoodData Corporation

import { useIntl } from "react-intl";

import { type IAdditionalDateFilterLabel } from "../../../../selectors/additional_date_filter_selector.js";
import { type IOverTimeComparisonSummary } from "../../../../typings/over_time_comparison.js";

import { getAdditionalDateFiltersValues } from "./AdditionalDateFilters.js";
import { TimeComparison, isTimeComparisonConfigured } from "./TimeComparison.js";

function Delimiter() {
    return <span>,&nbsp;</span>;
}

export interface IAdditionalFilterDetailsProps {
    timeComparisonSummary: IOverTimeComparisonSummary;
    additionalDateFilterLabels: IAdditionalDateFilterLabel[];
}

export function AdditionalFilterDetails({
    timeComparisonSummary,
    additionalDateFilterLabels,
}: IAdditionalFilterDetailsProps) {
    const intl = useIntl();

    const hasTimeComparisonConfigured = isTimeComparisonConfigured(timeComparisonSummary);
    const comparisonLabels = hasTimeComparisonConfigured
        ? [<TimeComparison key="timeComparison" timeComparisonSummary={timeComparisonSummary} />]
        : [];
    const additionalFilterValues = getAdditionalDateFiltersValues(
        additionalDateFilterLabels,
        hasTimeComparisonConfigured,
        intl,
    );
    const filterLabels = [...additionalFilterValues, ...comparisonLabels];

    return (
        <span className="adi-filter-selection-shortened s-date-filter-bottom-line">
            {filterLabels.reduce(
                (elements, label, index) =>
                    elements.length === 0
                        ? [label]
                        : [...elements, <Delimiter key={`delimiter_${index}`} />, label],
                [],
            )}
        </span>
    );
}
