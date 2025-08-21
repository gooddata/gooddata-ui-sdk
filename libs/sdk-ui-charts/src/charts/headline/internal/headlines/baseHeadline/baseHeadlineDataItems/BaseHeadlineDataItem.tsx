// (C) 2023-2025 GoodData Corporation
import React from "react";

import cx from "classnames";

import { ResponsiveText } from "@gooddata/sdk-ui-kit";

import { useBaseHeadlineDataItem } from "./useBaseHeadlineDataItem.js";
import { useOutOfBoundsDetection } from "./useOutOfBoundsDetection.js";
import { withDrillable } from "./withDrillable.js";
import { withTitle } from "./withTitle.js";
import { IBaseHeadlineDataItemProps } from "../../../interfaces/BaseHeadlines.js";
import { IHeadlineDataItem } from "../../../interfaces/Headlines.js";
import { useBaseHeadline } from "../BaseHeadlineContext.js";

function BaseHeadlineDataItemComponent({
    dataItem,
    onValueOverflow,
    measurementTrigger,
}: IBaseHeadlineDataItemProps<IHeadlineDataItem>) {
    const { config } = useBaseHeadline();
    const { formattedItem } = useBaseHeadlineDataItem(dataItem);

    const valueClassNames = cx(["headline-value", "s-headline-value"], {
        "headline-value--empty s-headline-value--empty": formattedItem.isValueEmpty,
        "headline-link-style-underline s-headline-link-style-underline": !config?.disableDrillUnderline,
    });

    const { containerRef } = useOutOfBoundsDetection(onValueOverflow, measurementTrigger);

    return (
        <div
            ref={containerRef}
            className="headline-value-wrapper s-headline-value-wrapper"
            style={formattedItem.cssStyle}
        >
            <ResponsiveText minFontSize={10}>
                <div className={valueClassNames}>{formattedItem.value}</div>
            </ResponsiveText>
        </div>
    );
}

export const BaseHeadlineDataItem = withDrillable(withTitle(BaseHeadlineDataItemComponent));
