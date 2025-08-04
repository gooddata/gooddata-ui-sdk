// (C) 2023-2025 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";
import { EvaluationType } from "../../../../interfaces/BaseHeadlines.js";

const ComparisonIndicatorUp: React.FC = () => {
    return (
        <>
            <i className="gd-icon-trend-up s-indicator-up" aria-hidden="true" />
            <span className="sr-only">
                <FormattedMessage id="visualizations.headline.comparison.indicator.up" />
            </span>
        </>
    );
};

const ComparisonIndicatorDown: React.FC = () => {
    return (
        <>
            <i className="gd-icon-trend-down s-indicator-down" aria-hidden="true" />
            <span className="sr-only">
                <FormattedMessage id="visualizations.headline.comparison.indicator.down" />
            </span>
        </>
    );
};

const ComparisonIndicators: Record<EvaluationType, React.ComponentType> = {
    [EvaluationType.POSITIVE_VALUE]: ComparisonIndicatorUp,
    [EvaluationType.NEGATIVE_VALUE]: ComparisonIndicatorDown,
    [EvaluationType.EQUALS_VALUE]: null,
};

export default ComparisonIndicators;
