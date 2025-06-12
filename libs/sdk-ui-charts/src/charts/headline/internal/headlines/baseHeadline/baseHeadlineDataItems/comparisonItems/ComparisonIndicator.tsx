// (C) 2023 GoodData Corporation
import React from "react";
import { EvaluationType } from "../../../../interfaces/BaseHeadlines.js";

const ComparisonIndicatorUp: React.FC = () => {
    return <i className="gd-icon-trend-up s-indicator-up" />;
};

const ComparisonIndicatorDown: React.FC = () => {
    return <i className="gd-icon-trend-down s-indicator-down" />;
};

const ComparisonIndicators: Record<EvaluationType, React.ComponentType> = {
    [EvaluationType.POSITIVE_VALUE]: ComparisonIndicatorUp,
    [EvaluationType.NEGATIVE_VALUE]: ComparisonIndicatorDown,
    [EvaluationType.EQUALS_VALUE]: null,
};

export default ComparisonIndicators;
