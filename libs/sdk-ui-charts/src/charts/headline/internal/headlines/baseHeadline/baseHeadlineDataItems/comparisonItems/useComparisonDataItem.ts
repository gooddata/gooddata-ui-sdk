// (C) 2023 GoodData Corporation
import { CSSProperties } from "react";
import { useBaseHeadline } from "../../BaseHeadlineContext.js";
import { EvaluationType } from "../../../../interfaces/BaseHeadlines.js";
import { getComparisonColor } from "../../../../utils/ComparisonDataItemUtils.js";
import ComparisonIndicators from "./ComparisonIndicator.js";

export const useComparisonDataItem = (evaluationType: EvaluationType) => {
    const { config } = useBaseHeadline();
    const { colorConfig, isArrowEnabled } = config.comparison;

    const color = getComparisonColor(colorConfig, evaluationType, config.colorPalette);
    const indicator = isArrowEnabled ? ComparisonIndicators[evaluationType] : null;
    const style: CSSProperties = {
        ...(color ? { color } : {}),
    };

    return {
        style,
        indicator,
    };
};
