// (C) 2023-2025 GoodData Corporation
import React from "react";

import { ResponsiveText } from "@gooddata/sdk-ui-kit";

import { IBaseHeadlineDataItemProps, IComparisonDataItem } from "../../../../interfaces/BaseHeadlines.js";
import { useComparisonDataItem } from "./useComparisonDataItem.js";
import { withTitle } from "../withTitle.js";
import { ComparisonValue } from "./ComparisonValue.js";
import { useOutOfBoundsDetection } from "../useOutOfBoundsDetection.js";

const ComparisonDataItemComponent: React.FC<IBaseHeadlineDataItemProps<IComparisonDataItem>> = ({
    dataItem,
    evaluationType,
    onValueOverflow,
    measurementTrigger,
}) => {
    const {
        style,
        indicator: ComparisonIndicator,
        indicatorAriaLabelFactory,
    } = useComparisonDataItem(evaluationType);
    const { containerRef } = useOutOfBoundsDetection(onValueOverflow, measurementTrigger);
    return (
        <div ref={containerRef} style={style} className="headline-value-wrapper s-headline-value-wrapper">
            <ResponsiveText minFontSize={10}>
                <div className="comparison-headline-value-wrapper s-comparison-headline-value-wrapper">
                    {ComparisonIndicator ? <ComparisonIndicator /> : null}
                    <ComparisonValue
                        dataItem={dataItem}
                        comparisonStyle={style}
                        indicatorAriaLabelFactory={indicatorAriaLabelFactory}
                    />
                </div>
            </ResponsiveText>
        </div>
    );
};

export const ComparisonDataItem = withTitle(ComparisonDataItemComponent);
