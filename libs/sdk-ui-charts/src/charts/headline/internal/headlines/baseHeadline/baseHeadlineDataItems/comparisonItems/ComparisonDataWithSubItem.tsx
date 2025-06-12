// (C) 2023 GoodData Corporation
import React from "react";

import { ResponsiveText } from "@gooddata/sdk-ui-kit";

import {
    IBaseHeadlineDataItemProps,
    IComparisonDataWithSubItem,
} from "../../../../interfaces/BaseHeadlines.js";
import { withTitle } from "../withTitle.js";
import { useComparisonDataItem } from "./useComparisonDataItem.js";
import ComparisonValue from "./ComparisonValue.js";

const ComparisonDataWithSubItem: React.FC<IBaseHeadlineDataItemProps<IComparisonDataWithSubItem>> = ({
    dataItem,
    evaluationType,
}) => {
    const { style, indicator: ComparisonIndicator } = useComparisonDataItem(evaluationType);

    return (
        <div style={style} className="headline-value-wrapper s-headline-value-wrapper">
            <ResponsiveText>
                <div className="comparison-headline-value-wrapper s-comparison-headline-value-wrapper">
                    {ComparisonIndicator ? <ComparisonIndicator /> : null}
                    <ComparisonValue dataItem={dataItem.item} comparisonStyle={style} />
                    <ComparisonValue dataItem={dataItem.subItem} comparisonStyle={style} isSubItem={true} />
                </div>
            </ResponsiveText>
        </div>
    );
};

export default withTitle(ComparisonDataWithSubItem);
