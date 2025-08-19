// (C) 2023-2025 GoodData Corporation
import { useMemo } from "react";

import { IBaseHeadlineValueItem } from "../../../interfaces/BaseHeadlines.js";
import { formatItemValue } from "../../../utils/HeadlineDataItemUtils.js";
import { useBaseHeadline } from "../BaseHeadlineContext.js";

export const useBaseHeadlineDataItem = <T extends IBaseHeadlineValueItem>(dataItem: T) => {
    const { config } = useBaseHeadline();
    const formattedItem = useMemo(() => formatItemValue(dataItem, config), [dataItem, config]);

    return {
        formattedItem,
    };
};
