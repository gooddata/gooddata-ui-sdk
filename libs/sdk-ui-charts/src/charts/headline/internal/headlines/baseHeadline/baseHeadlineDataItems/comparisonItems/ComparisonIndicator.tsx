// (C) 2023-2025 GoodData Corporation

import { ComponentType } from "react";

import { MessageDescriptor, defineMessages } from "react-intl";

import { EvaluationType } from "../../../../interfaces/BaseHeadlines.js";

const messages = defineMessages({
    singleValuePositiveChange: {
        id: "visualizations.headline.comparison.ariaLabel.singleValuePositiveChange",
    },
    singleValueNegativeChange: {
        id: "visualizations.headline.comparison.ariaLabel.singleValueNegativeChange",
    },
    twoValuesPositiveChange: {
        id: "visualizations.headline.comparison.ariaLabel.twoValuesPositiveChange",
    },
    twoValuesNegativeChange: {
        id: "visualizations.headline.comparison.ariaLabel.twoValuesNegativeChange",
    },
    twoValues: {
        id: "visualizations.headline.comparison.ariaLabel.twoValues",
    },
});

function ComparisonIndicatorUp() {
    return (
        <>
            <i className="gd-icon-trend-up s-indicator-up" aria-hidden="true" />
        </>
    );
}

function ComparisonIndicatorDown() {
    return (
        <>
            <i className="gd-icon-trend-down s-indicator-down" aria-hidden="true" />
        </>
    );
}

export const ComparisonIndicators: Record<EvaluationType, ComponentType> = {
    [EvaluationType.POSITIVE_VALUE]: ComparisonIndicatorUp,
    [EvaluationType.NEGATIVE_VALUE]: ComparisonIndicatorDown,
    [EvaluationType.EQUALS_VALUE]: null,
};

export const getComparisonAriaLabelMessage = (
    evaluationType: EvaluationType | undefined,
    hasSecondaryValue: boolean,
): MessageDescriptor | null => {
    if (evaluationType === undefined && hasSecondaryValue) {
        return messages.twoValues;
    }
    if (evaluationType === EvaluationType.POSITIVE_VALUE) {
        return hasSecondaryValue ? messages.twoValuesPositiveChange : messages.singleValuePositiveChange;
    }
    if (evaluationType === EvaluationType.NEGATIVE_VALUE) {
        return hasSecondaryValue ? messages.twoValuesNegativeChange : messages.singleValueNegativeChange;
    }
    return null;
};
