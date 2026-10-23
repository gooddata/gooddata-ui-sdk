// (C) 2021-2026 GoodData Corporation

import { useCallback } from "react";

import { isEqual } from "lodash-es";

import { type IMeasureMetadataObject } from "@gooddata/sdk-model";
import { type IObjectShareDraft } from "@gooddata/sdk-ui-ext";

import { type ITab, TabState } from "../../../shared/Tabs/Tab.js";
import { emptyMetricWithId } from "../../metric/emptyMetric.js";
import { type IMeasureDef, type IMeasureSetting } from "../../metric/metricHelpers.js";
import { type IMetricInfo } from "../metricState.data.js";

import { updateTabDataFromMetric, updateTabDataFromSetting, updateTabFromMetric } from "./useTabsData.js";

interface IUseOnChangeCallbackParams {
    tab: ITab<IMetricInfo>;
    updateTab: (tab: ITab<IMetricInfo>, props: Partial<ITab<IMetricInfo>>) => void;
    updateData: (tab: ITab<IMetricInfo>, data: IMetricInfo) => void;
    onValueChange?: (metric: IMeasureDef, valid: boolean) => void;
}

export const useOnChangeCallback = ({
    tab,
    updateTab,
    updateData,
    onValueChange,
}: IUseOnChangeCallbackParams): {
    onChangeMetric: (metric: IMeasureDef, valid: boolean) => void;
    onChangeSetting: (setting: Partial<IMeasureSetting>) => void;
    onChangeDraftAccess: (draftAccess: IObjectShareDraft | undefined) => void;
} => {
    const onChangeMetric = useCallback(
        (metric: IMeasureDef, valid: boolean) => {
            const states = tab.states || {};
            const { initial, current } = tab.data;

            const isChanged = !isEqual(metric, initial);
            const isUpdate = !isEqual(metric, current);
            const isEmpty = isEqual(metric, emptyMetricWithId);
            const isInvalid = !valid && !isEmpty;

            updateTab(tab, updateTabFromMetric(tab, metric as IMeasureMetadataObject, isChanged, isInvalid));

            if (states[TabState.Dirty] !== isChanged || states[TabState.Invalid] !== isInvalid) {
                if (onValueChange) {
                    onValueChange(metric, valid);
                }
            } else if (isUpdate) {
                updateData(tab, updateTabDataFromMetric(tab.data, metric as IMeasureMetadataObject, true));
                if (onValueChange) {
                    onValueChange(metric, valid);
                }
            }
        },
        [updateTab, tab, updateData, onValueChange],
    );

    const onChangeSetting = useCallback(
        (setting: Partial<IMeasureSetting>) => {
            updateData(tab, updateTabDataFromSetting(tab.data, setting));
        },
        [tab, updateData],
    );

    // `updateTab`, not `updateData`: the latter mutates in place with no state update, so a
    // reopened dialog would be handed the draft from before the change.
    const onChangeDraftAccess = useCallback(
        (draftAccess: IObjectShareDraft | undefined) => {
            updateTab(tab, { data: { ...tab.data, draftAccess } });
        },
        [tab, updateTab],
    );

    return {
        onChangeMetric,
        onChangeSetting,
        onChangeDraftAccess,
    };
};
