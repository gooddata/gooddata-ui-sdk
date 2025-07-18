// (C) 2023-2025 GoodData Corporation
import { ComponentType } from "react";
import { EvaluationType } from "../../../../interfaces/BaseHeadlines.js";

export function ComparisonIndicatorUp() {
    return <i className="gd-icon-trend-up s-indicator-up" />;
}

export function ComparisonIndicatorDown() {
    return <i className="gd-icon-trend-down s-indicator-down" />;
}

const ComparisonIndicators: Record<EvaluationType, ComponentType> = {
    [EvaluationType.POSITIVE_VALUE]: ComparisonIndicatorUp,
    [EvaluationType.NEGATIVE_VALUE]: ComparisonIndicatorDown,
    [EvaluationType.EQUALS_VALUE]: null,
};

export default ComparisonIndicators;
