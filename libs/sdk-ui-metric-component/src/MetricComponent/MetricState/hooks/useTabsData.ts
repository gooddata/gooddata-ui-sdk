// (C) 2021-2026 GoodData Corporation

import { type Dispatch, type SetStateAction, useEffect, useState } from "react";

import { type IMeasureMetadataObject } from "@gooddata/sdk-model";

import { type ITab, TabState } from "../../../shared/Tabs/Tab.js";
import { type IMeasureSetting } from "../../metric/metricHelpers.js";
import { type IMetricInfo } from "../metricState.data.js";

export const createTabFromMetricInfo = (item: IMetricInfo): ITab<IMetricInfo> => ({
    id: item.identifier,
    title: item.initial.title || "",
    data: item,
    options: { closeable: true },
    states: { dirty: false },
});

export const updateTabFromMetric = (
    tab: ITab<IMetricInfo>,
    metric: IMeasureMetadataObject,
    isChanged: boolean,
    isInvalid: boolean,
): Partial<ITab<IMetricInfo>> => {
    return {
        data: updateTabDataFromMetric(tab.data, metric, isChanged),
        title: metric.title,
        states: {
            ...tab.states,
            [TabState.Dirty]: isChanged,
            [TabState.Invalid]: isInvalid,
        },
    };
};

export const revertTabFromMetricInfo = (data: IMetricInfo): ITab<IMetricInfo> => {
    data.current = { ...data.initial };
    return createTabFromMetricInfo(data);
};

export const updateTabDataFromMetric = (
    data: IMetricInfo,
    metric: IMeasureMetadataObject,
    isChanged: boolean,
): IMetricInfo => {
    return {
        ...data,
        current: metric,
        ...(isChanged
            ? {
                  focusedField: undefined,
                  generateNewId: undefined,
              }
            : {}),
    };
};

export const updateTabDataFromSetting = (
    data: IMetricInfo,
    setting: Partial<IMeasureSetting>,
): IMetricInfo => {
    return {
        ...data,
        ...setting,
    };
};

export type TabsData = {
    metrics: ITab<IMetricInfo>[];
    active: number;
};

export const useTabsData = (
    metricsProps: IMetricInfo[],
    activeProp: number,
): [data: TabsData, setData: Dispatch<SetStateAction<TabsData>>] => {
    const [data, setData] = useState<TabsData>({
        metrics: processMetrics(metricsProps, []),
        active: activeProp,
    });

    useEffect(() => {
        setData({
            metrics: processMetrics(metricsProps, data.metrics),
            active: activeProp,
        });
        // oxlint-disable-next-line react-hooks/exhaustive-deps
    }, [activeProp, metricsProps, metricsProps.length]);

    return [data, setData];
};

function processMetrics(metricsProps: IMetricInfo[], metrics: ITab<IMetricInfo>[]) {
    return metricsProps.map((item) => {
        return metrics.find((row) => row.id == item.identifier) ?? createTabFromMetricInfo(item);
    });
}
