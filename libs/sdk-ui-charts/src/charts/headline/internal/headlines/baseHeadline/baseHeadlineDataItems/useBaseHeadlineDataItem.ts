// (C) 2023 GoodData Corporation
import { useMemo } from "react";

import { formatItemValue } from "../../../utils/HeadlineDataItemUtils.js";
import { useBaseHeadline } from "../BaseHeadlineContext.js";
import { IHeadlineDataItem } from "../../../interfaces/Headlines.js";

export const useBaseHeadlineDataItem = (dataItem: IHeadlineDataItem) => {
    const { config } = useBaseHeadline();
    const formattedItem = useMemo(() => formatItemValue(dataItem, config), [dataItem, config]);

    return {
        formattedItem,
    };
};
