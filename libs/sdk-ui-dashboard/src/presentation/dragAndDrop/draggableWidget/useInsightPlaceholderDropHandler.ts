// (C) 2022 GoodData Corporation
import { useCallback } from "react";
import { IInsight, insightRef, insightTitle } from "@gooddata/sdk-model";

import {
    selectSettings,
    useDashboardDispatch,
    useDashboardSelector,
    placeholdersActions,
    addSectionItem,
    useDashboardCommandProcessing,
    uiActions,
} from "../../../model";
import { getSizeInfo } from "../../../model/layout";

export function useInsightPlaceholderDropHandler() {
    const dispatch = useDashboardDispatch();
    const settings = useDashboardSelector(selectSettings);

    const { run: addInsightAndClearPlaceholder } = useDashboardCommandProcessing({
        commandCreator: addSectionItem,
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        successEvent: "GDC.DASH/EVT.FLUID_LAYOUT.ITEMS_ADDED",
        onSuccess: (event) => {
            const ref = event.payload.itemsAdded[0].widget!.ref;
            dispatch(placeholdersActions.clearWidgetPlaceholder());
            dispatch(uiActions.selectWidget(ref));
            dispatch(uiActions.setConfigurationPanelOpened(true));
        },
        onError: () => {
            dispatch(placeholdersActions.clearWidgetPlaceholder());
        },
    });

    return useCallback(
        (sectionIndex: number, itemIndex: number, insight: IInsight) => {
            const sizeInfo = getSizeInfo(settings, "insight", insight);
            addInsightAndClearPlaceholder(sectionIndex, itemIndex, {
                type: "IDashboardLayoutItem",
                widget: {
                    type: "insight",
                    insight: insightRef(insight),
                    ignoreDashboardFilters: [],
                    drills: [],
                    title: insightTitle(insight),
                    description: "",
                    configuration: { hideTitle: false },
                    properties: {},
                },
                size: {
                    xl: {
                        gridHeight: sizeInfo.height.default,
                        gridWidth: sizeInfo.width.default!,
                    },
                },
            });
        },
        [addInsightAndClearPlaceholder, settings],
    );
}
