// (C) 2023-2025 GoodData Corporation
import React, { CSSProperties } from "react";

import cx from "classnames";

import { IBaseHeadlineValueItem } from "../../../../interfaces/BaseHeadlines.js";
import { useBaseHeadlineDataItem } from "../useBaseHeadlineDataItem.js";

interface IComparisonValueProps {
    dataItem: IBaseHeadlineValueItem;
    comparisonStyle: CSSProperties;
    isSubItem?: boolean;
}

export const ComparisonValue: React.FC<IComparisonValueProps> = ({
    dataItem,
    comparisonStyle,
    isSubItem,
}) => {
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
        <div style={style} className={valueClassNames}>
            {isSubItem ? `(${formattedItem?.value})` : formattedItem?.value}
        </div>
    );
};
