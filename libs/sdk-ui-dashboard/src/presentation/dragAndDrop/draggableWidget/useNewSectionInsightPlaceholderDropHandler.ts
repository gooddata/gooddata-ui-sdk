// (C) 2022 GoodData Corporation
import { useCallback } from "react";
import { idRef } from "@gooddata/sdk-model";

import { getInsightPlaceholderSizeInfo } from "../../../_staging/layout/sizing.js";
import {
    selectSettings,
    useDashboardDispatch,
    useDashboardSelector,
    useDashboardCommandProcessing,
    uiActions,
    addLayoutSection,
} from "../../../model/index.js";
import { INSIGHT_PLACEHOLDER_WIDGET_ID, newInsightPlaceholderWidget } from "../../../widgets/index.js";

export function useNewSectionInsightPlaceholderDropHandler(sectionIndex: number) {
    const dispatch = useDashboardDispatch();
    const settings = useDashboardSelector(selectSettings);

    const { run: addNewSectionWithInsightPlaceholder } = useDashboardCommandProcessing({
        commandCreator: addLayoutSection,
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        successEvent: "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_ADDED",
        onSuccess: () => {
            dispatch(uiActions.selectWidget(idRef(INSIGHT_PLACEHOLDER_WIDGET_ID)));
            dispatch(uiActions.setConfigurationPanelOpened(true));
        },
    });

    return useCallback(() => {
        const sizeInfo = getInsightPlaceholderSizeInfo(settings);
        addNewSectionWithInsightPlaceholder(sectionIndex, {}, [
            {
                type: "IDashboardLayoutItem",
                size: {
                    xl: {
                        gridHeight: sizeInfo.height.default!,
                        gridWidth: sizeInfo.width.default!,
                    },
                },
                widget: newInsightPlaceholderWidget(),
            },
        ]);
    }, [addNewSectionWithInsightPlaceholder, sectionIndex, settings]);
}
