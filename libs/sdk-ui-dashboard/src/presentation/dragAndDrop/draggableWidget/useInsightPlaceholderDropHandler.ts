// (C) 2022 GoodData Corporation
import { useCallback } from "react";
import { idRef } from "@gooddata/sdk-model";

import { useDashboardDispatch, uiActions } from "../../../model";
import { INSIGHT_PLACEHOLDER_WIDGET_ID } from "../../../widgets/placeholders/types";

export function useInsightPlaceholderDropHandler() {
    const dispatch = useDashboardDispatch();

    return useCallback(
        (sectionIndex: number, itemIndex: number) => {
            dispatch(uiActions.selectWidget(idRef(INSIGHT_PLACEHOLDER_WIDGET_ID)));
            dispatch(uiActions.setConfigurationPanelOpened(true));
            dispatch(uiActions.setKpiDateDatasetAutoOpen(true));
            dispatch(
                uiActions.setWidgetPlaceholder({
                    itemIndex,
                    sectionIndex,
                    size: {
                        height: 22,
                        width: 6,
                    },
                    type: "insight",
                }),
            );
        },
        [dispatch],
    );
}
