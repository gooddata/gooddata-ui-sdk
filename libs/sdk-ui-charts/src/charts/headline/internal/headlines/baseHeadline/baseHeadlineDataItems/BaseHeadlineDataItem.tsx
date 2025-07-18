// (C) 2023-2025 GoodData Corporation
import cx from "classnames";

import { ResponsiveText } from "@gooddata/sdk-ui-kit";

import { withDrillable } from "./withDrillable.js";
import { withTitle } from "./withTitle.js";
import { IBaseHeadlineDataItemProps } from "../../../interfaces/BaseHeadlines.js";
import { useBaseHeadlineDataItem } from "./useBaseHeadlineDataItem.js";
import { useBaseHeadline } from "../BaseHeadlineContext.js";
import { IHeadlineDataItem } from "../../../interfaces/Headlines.js";

function BaseHeadlineDataItem({ dataItem }: IBaseHeadlineDataItemProps<IHeadlineDataItem>) {
    const { config } = useBaseHeadline();
    const { formattedItem } = useBaseHeadlineDataItem(dataItem);

    const valueClassNames = cx(["headline-value", "s-headline-value"], {
        "headline-value--empty s-headline-value--empty": formattedItem.isValueEmpty,
        "headline-link-style-underline s-headline-link-style-underline": !config?.disableDrillUnderline,
    });

    return (
        <div className="headline-value-wrapper s-headline-value-wrapper" style={formattedItem.cssStyle}>
            <ResponsiveText>
                <div className={valueClassNames}>{formattedItem.value}</div>
            </ResponsiveText>
        </div>
    );
}

export default withDrillable(withTitle(BaseHeadlineDataItem));
