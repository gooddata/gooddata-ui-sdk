// (C) 2022 GoodData Corporation
import { useCallback } from "react";
import { idRef } from "@gooddata/sdk-model";

import { useDashboardDispatch, uiActions, useDashboardSelector, selectSettings } from "../../../model";
import { INSIGHT_PLACEHOLDER_WIDGET_ID } from "../../../widgets";
import { getInsightPlaceholderSizeInfo } from "../../../_staging/layout/sizing";

export function useInsightPlaceholderDropHandler() {
    const dispatch = useDashboardDispatch();
    const settings = useDashboardSelector(selectSettings);

    return useCallback(
        (sectionIndex: number, itemIndex: number) => {
            const sizeInfo = getInsightPlaceholderSizeInfo(settings);
            dispatch(uiActions.selectWidget(idRef(INSIGHT_PLACEHOLDER_WIDGET_ID)));
            dispatch(uiActions.setConfigurationPanelOpened(true));
            dispatch(
                uiActions.setWidgetPlaceholder({
                    itemIndex,
                    sectionIndex,
                    size: {
                        height: sizeInfo.height.default!,
                        width: sizeInfo.width.default!,
                    },
                    type: "insight",
                }),
            );
        },
        [dispatch, settings],
    );
}
