// (C) 2023-2025 GoodData Corporation
import React, { CSSProperties } from "react";
import cx from "classnames";
import { useIntl } from "react-intl";

import { IBaseHeadlineValueItem } from "../../../../interfaces/BaseHeadlines.js";
import { useBaseHeadlineDataItem } from "../useBaseHeadlineDataItem.js";
import { ComparisonIndicatorAriaLabelFactory } from "./ComparisonIndicator.js";

interface IComparisonValueProps {
    dataItem: IBaseHeadlineValueItem;
    comparisonStyle: CSSProperties;
    isSubItem?: boolean;
    indicatorAriaLabelFactory?: ComparisonIndicatorAriaLabelFactory;
}

export const ComparisonValue: React.FC<IComparisonValueProps> = ({
    dataItem,
    comparisonStyle,
    isSubItem,
    indicatorAriaLabelFactory,
}) => {
    const intl = useIntl();
    const { formattedItem } = useBaseHeadlineDataItem(dataItem);
    const style: CSSProperties = {
        ...(formattedItem?.cssStyle || {}),
        ...(comparisonStyle || {}),
    };

    const valueClassNames = cx(
        ["comparison-headline-value", "s-comparison-headline-value", "headline-value", "s-headline-value"],
        {
            "headline-value--empty s-headline-value--empty":
                formattedItem?.isValueEmpty && !comparisonStyle?.color,
        },
    );

    return (
        <div
            style={style}
            className={valueClassNames}
            aria-label={indicatorAriaLabelFactory?.(intl, formattedItem?.value)}
        >
            {isSubItem ? `(${formattedItem?.value})` : formattedItem?.value}
        </div>
    );
};
