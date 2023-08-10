// (C) 2023 GoodData Corporation
import { useMemo } from "react";
import cx from "classnames";

import { formatItemValue } from "../../../utils/HeadlineDataItemUtils.js";
import { useBaseHeadline } from "../BaseHeadlineContext.js";
import { IHeadlineDataItem } from "../../../interfaces/Headlines.js";

export const useBaseHeadlineDataItem = (dataItem: IHeadlineDataItem) => {
    const { config } = useBaseHeadline();
    const disableDrillUnderline = config?.disableDrillUnderline;

    const formattedItem = useMemo(() => formatItemValue(dataItem, config), [dataItem, config]);

    const valueClassNames = useMemo(
        () =>
            cx(["headline-value", "s-headline-value"], {
                "headline-value--empty": formattedItem.isValueEmpty,
                "s-headline-value--empty": formattedItem.isValueEmpty,
                "headline-link-style-underline": !disableDrillUnderline,
                "s-headline-link-style-underline": !disableDrillUnderline,
            }),
        [formattedItem, disableDrillUnderline],
    );

    return {
        formattedItem,
        valueClassNames,
    };
};
