// (C) 2023-2025 GoodData Corporation

import { ResponsiveText } from "@gooddata/sdk-ui-kit";

import { IBaseHeadlineDataItemProps, IComparisonDataItem } from "../../../../interfaces/BaseHeadlines.js";
import { useComparisonDataItem } from "./useComparisonDataItem.js";
import { withTitle } from "../withTitle.js";
import ComparisonValue from "./ComparisonValue.js";

function ComparisonDataItem({ dataItem, evaluationType }: IBaseHeadlineDataItemProps<IComparisonDataItem>) {
    const { style, indicator: ComparisonIndicator } = useComparisonDataItem(evaluationType);

    return (
        <div style={style} className="headline-value-wrapper s-headline-value-wrapper">
            <ResponsiveText>
                <div className="comparison-headline-value-wrapper s-comparison-headline-value-wrapper">
                    {ComparisonIndicator ? <ComparisonIndicator /> : null}
                    <ComparisonValue dataItem={dataItem} comparisonStyle={style} />
                </div>
            </ResponsiveText>
        </div>
    );
}

export default withTitle(ComparisonDataItem);
