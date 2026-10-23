// (C) 2021-2026 GoodData Corporation

import { useCallback } from "react";

import { type ITab } from "../../../shared/Tabs/Tab.js";
import { type IMetricInfo } from "../metricState.data.js";

import { type TabsData } from "./useTabsData.js";

export const useUpdateMetricData = (
    data: TabsData,
): ((tab: ITab<IMetricInfo>, newProps: Partial<IMetricInfo>) => void) => {
    return useCallback(
        (tab: ITab<IMetricInfo>, dataUpdate: Partial<IMetricInfo>) => {
            const foundTab = data.metrics.find((item) => item.id == tab.id);
            if (foundTab?.data) {
                foundTab.data = { ...foundTab.data, ...dataUpdate };
            }
        },
        [data],
    );
};
