// (C) 2021-2026 GoodData Corporation

import { type Dispatch, type SetStateAction, useCallback } from "react";

import { type ITab } from "../../../shared/Tabs/Tab.js";
import { type IMetricInfo } from "../metricState.data.js";

import { type TabsData } from "./useTabsData.js";

export const useUpdateMetricTab = (
    setData: Dispatch<SetStateAction<TabsData>>,
): ((tab: ITab<IMetricInfo>, newProps: Partial<ITab<IMetricInfo>>) => void) => {
    return useCallback(
        (tab: ITab<IMetricInfo>, newProps: Partial<ITab<IMetricInfo>>) => {
            setData((data) => {
                const { metrics, active } = data;
                const foundTabIndex = metrics.findIndex((item) => item.id == tab.id);
                if (foundTabIndex >= 0) {
                    const foundTab = metrics[foundTabIndex];
                    const newTabs = metrics.slice();
                    newTabs.splice(foundTabIndex, 1, { ...foundTab, ...newProps });
                    return { metrics: newTabs, active };
                }
                return data;
            });
        },
        [setData],
    );
};
