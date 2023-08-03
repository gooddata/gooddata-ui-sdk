// (C) 2023 GoodData Corporation
import React from "react";

import { ResponsiveText } from "@gooddata/sdk-ui-kit";

import { withDrillable } from "./withDrillable.js";
import { withTitle } from "./withTitle.js";
import { IBaseHeadlineDataItemProps } from "../../../interfaces/BaseHeadlines.js";
import { useBaseHeadlineDataItem } from "./useBaseHeadlineDataItem.js";

const BaseHeadlineDataItem: React.FC<IBaseHeadlineDataItemProps> = ({ dataItem }) => {
    const { formattedItem, valueClassNames } = useBaseHeadlineDataItem(dataItem);

    return (
        <div className="headline-value-wrapper s-headline-value-wrapper" style={formattedItem.cssStyle}>
            <ResponsiveText>
                <div className={valueClassNames}>{formattedItem.value}</div>
            </ResponsiveText>
        </div>
    );
};

export default withDrillable(withTitle(BaseHeadlineDataItem));
