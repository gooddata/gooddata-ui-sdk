// (C) 2023-2025 GoodData Corporation
import { CSSProperties } from "react";

import { useBaseHeadline } from "../../BaseHeadlineContext.js";
import { EvaluationType } from "../../../../interfaces/BaseHeadlines.js";
import { getComparisonColor } from "../../../../utils/ComparisonDataItemUtils.js";

import { ComparisonIndicators, ComparisonIndicatorsAriaLabels } from "./ComparisonIndicator.js";

export const useComparisonDataItem = (evaluationType: EvaluationType) => {
    const { config } = useBaseHeadline();
    const { colorConfig, isArrowEnabled } = config.comparison;

    const color = getComparisonColor(colorConfig, evaluationType, config.colorPalette);
    const indicator = isArrowEnabled ? ComparisonIndicators[evaluationType] : null;
    const indicatorAriaLabelFactory = isArrowEnabled
        ? ComparisonIndicatorsAriaLabels[evaluationType]
        : undefined;
    const style: CSSProperties = {
        ...(color ? { color } : {}),
    };
    return {
        style,
        indicator,
        indicatorAriaLabelFactory,
    };
};
