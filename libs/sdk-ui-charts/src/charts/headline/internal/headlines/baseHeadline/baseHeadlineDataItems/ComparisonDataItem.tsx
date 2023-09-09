// (C) 2023 GoodData Corporation
import React, { CSSProperties } from "react";
import cx from "classnames";

import { ResponsiveText } from "@gooddata/sdk-ui-kit";

import {
    IBaseHeadlineDataItemProps,
    EvaluationType,
    IComparisonDataItem,
} from "../../../interfaces/BaseHeadlines.js";
import { useBaseHeadlineDataItem } from "./useBaseHeadlineDataItem.js";
import { withTitle } from "./withTitle.js";
import { useBaseHeadline } from "../BaseHeadlineContext.js";
import { getComparisonColor } from "../../../utils/ComparisonDataItemUtils.js";

const ComparisonDataItem: React.FC<IBaseHeadlineDataItemProps<IComparisonDataItem>> = ({
    dataItem,
    evaluationType,
}) => {
    const { config } = useBaseHeadline();
    const { formattedItem } = useBaseHeadlineDataItem(dataItem);

    const { colorConfig, isArrowEnabled } = config.comparison;

    const color = getComparisonColor(colorConfig, evaluationType, config.colorPalette);
    const cssStyle: CSSProperties = {
        ...(formattedItem.cssStyle ?? {}),
        ...(color ? { color } : {}),
    };

    const valueClassNames = cx(
        ["comparison-headline-value", "s-comparison-headline-value", "headline-value", "s-headline-value"],
        {
            "headline-value--empty s-headline-value--empty": formattedItem.isValueEmpty && !color,
            "gd-icon-trend-up s-indicator-up":
                isArrowEnabled && evaluationType === EvaluationType.POSITIVE_VALUE,
            "gd-icon-trend-down s-indicator-down":
                isArrowEnabled && evaluationType === EvaluationType.NEGATIVE_VALUE,
        },
    );

    return (
        <div
            className="comparison-headline-value-wrapper s-comparison-headline-value-wrapper headline-value-wrapper s-headline-value-wrapper"
            style={cssStyle}
        >
            <ResponsiveText>
                <div className={valueClassNames}>{formattedItem.value}</div>
            </ResponsiveText>
        </div>
    );
};

export default withTitle(ComparisonDataItem);
