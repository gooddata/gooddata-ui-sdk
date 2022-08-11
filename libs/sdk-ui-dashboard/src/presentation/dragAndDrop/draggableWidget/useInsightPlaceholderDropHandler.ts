// (C) 2022 GoodData Corporation
import { useCallback } from "react";
import { idRef } from "@gooddata/sdk-model";

import {
    useDashboardDispatch,
    uiActions,
    useDashboardSelector,
    selectSettings,
    addSectionItem,
} from "../../../model";
import { INSIGHT_PLACEHOLDER_WIDGET_ID, newInsightPlaceholderWidget } from "../../../widgets";
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
                addSectionItem(sectionIndex, sectionIndex, {
                    type: "IDashboardLayoutItem",
                    size: {
                        xl: {
                            gridHeight: sizeInfo.height.default!,
                            gridWidth: sizeInfo.width.default!,
                        },
                    },
                    widget: newInsightPlaceholderWidget(
                        sectionIndex, // TODO get rid of this, get the coords using widget ref
                        itemIndex,
                        false, // TODO how to get this? should WidgetDropZone get this instead?
                    ),
                }),
            );
        },
        [dispatch, settings],
    );
}
