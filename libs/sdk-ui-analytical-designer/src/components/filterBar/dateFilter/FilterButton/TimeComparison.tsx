// (C) 2022-2026 GoodData Corporation

import { Fragment } from "react";

import { defineMessage, useIntl } from "react-intl";

import { type OverTimeComparisonType, OverTimeComparisonTypes } from "@gooddata/sdk-ui";

import { type IOverTimeComparisonSummary } from "../../../../typings/over_time_comparison.js";

const supportedComparisonTypes: OverTimeComparisonType[] = [
    OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR,
    OverTimeComparisonTypes.PREVIOUS_PERIOD,
];

export const isTimeComparisonConfigured = (overTimeComparisonSummary: IOverTimeComparisonSummary) =>
    overTimeComparisonSummary && supportedComparisonTypes.includes(overTimeComparisonSummary.type);

const getComparisonTypeLocalizationKey = ({ type }: IOverTimeComparisonSummary): string => {
    switch (type) {
        case OverTimeComparisonTypes.SAME_PERIOD_PREVIOUS_YEAR:
            return defineMessage({ id: "filter.compare.type.label.same_period_previous_year" }).id;
        case OverTimeComparisonTypes.PREVIOUS_PERIOD:
            return defineMessage({ id: "filter.compare.type.label.previous_period" }).id;
        default:
            throw Error(`The comparison type ${type} is not supported!`);
    }
};

export interface ITimeComparisonValueProps {
    timeComparisonSummary: IOverTimeComparisonSummary;
}

export function TimeComparison({ timeComparisonSummary }: ITimeComparisonValueProps) {
    const intl = useIntl();

    const { compatibleMeasuresCount, selectedMeasuresCount } = timeComparisonSummary;

    const numberOfSelectedMeasures =
        compatibleMeasuresCount === selectedMeasuresCount
            ? intl.formatMessage({ id: "filter.compare.all_measures" })
            : selectedMeasuresCount;

    const summaryText = intl.formatMessage(
        { id: "filter.compare.summary" },
        { number_of_measures: numberOfSelectedMeasures },
    );

    const type = intl.formatMessage({ id: getComparisonTypeLocalizationKey(timeComparisonSummary) });

    return (
        <Fragment key="time-over-time-comparison">
            <span className="adi-compare-name s-date-filter-compare-name">{summaryText}&nbsp;</span>
            <span className="adi-compare-value s-date-filter-compare-value">{type}</span>
        </Fragment>
    );
}
