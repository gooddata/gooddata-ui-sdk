// (C) 2023-2025 GoodData Corporation

import React from "react";
import { IntlShape } from "react-intl";

import { EvaluationType } from "../../../../interfaces/BaseHeadlines.js";
import { DataValue } from "@gooddata/sdk-model";

const ComparisonIndicatorUp: React.FC = () => {
    return (
        <>
            <i className="gd-icon-trend-up s-indicator-up" aria-hidden="true" />
        </>
    );
};

const ComparisonIndicatorDown: React.FC = () => {
    return (
        <>
            <i className="gd-icon-trend-down s-indicator-down" aria-hidden="true" />
        </>
    );
};

export const ComparisonIndicators: Record<EvaluationType, React.ComponentType> = {
    [EvaluationType.POSITIVE_VALUE]: ComparisonIndicatorUp,
    [EvaluationType.NEGATIVE_VALUE]: ComparisonIndicatorDown,
    [EvaluationType.EQUALS_VALUE]: null,
};

export type ComparisonIndicatorAriaLabelFactory = (intl: IntlShape, value: DataValue) => string;

export const ComparisonIndicatorsAriaLabels: Record<EvaluationType, ComparisonIndicatorAriaLabelFactory> = {
    [EvaluationType.POSITIVE_VALUE]: (intl: IntlShape, value: DataValue) =>
        intl.formatMessage(
            {
                id: "visualizations.headline.comparison.indicator.up",
            },
            { value },
        ),
    [EvaluationType.NEGATIVE_VALUE]: (intl: IntlShape, value: DataValue) =>
        intl.formatMessage(
            {
                id: "visualizations.headline.comparison.indicator.down",
            },
            { value },
        ),
    [EvaluationType.EQUALS_VALUE]: () => null,
};
