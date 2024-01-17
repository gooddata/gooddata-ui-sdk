// (C) 2022-2024 GoodData Corporation
// import { idRef } from "@gooddata/sdk-model";
import { useCallback } from "react";

import {
    addSectionItem,
    selectSettings,
    // uiActions,
    useDashboardCommandProcessing,
    // useDashboardDispatch,
    useDashboardSelector,
} from "../../../model/index.js";
// import {
//     KPI_PLACEHOLDER_WIDGET_ID,
//     newKpiPlaceholderWidget
// } from "../../../widgets/index.js";
import { getSizeInfo } from "../../../_staging/layout/sizing.js";
import { idRef } from "@gooddata/sdk-model";
import { v4 as uuidv4 } from "uuid";

// TODO: RICH TEXT

export function useRichTextPlaceholderDropHandler(sectionIndex: number, itemIndex: number) {
    // const dispatch = useDashboardDispatch();
    const settings = useDashboardSelector(selectSettings);

    const { run: createKpi } = useDashboardCommandProcessing({
        commandCreator: addSectionItem,
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        successEvent: "GDC.DASH/EVT.FLUID_LAYOUT.ITEMS_ADDED",
        // onSuccess: (event) => {
        //     const ref = event.payload.itemsAdded[0].widget!.ref;
        //     dispatch(uiActions.selectWidget(idRef(KPI_PLACEHOLDER_WIDGET_ID)));
        //     dispatch(uiActions.setConfigurationPanelOpened(true));
        //     dispatch(uiActions.setWidgetDateDatasetAutoSelect(true));
        //     dispatch(uiActions.setWidgetLoadingAdditionalDataStarted(ref));
        // },
    });

    return useCallback(() => {
        const id = uuidv4();
        const sizeInfo = getSizeInfo(settings, "kpi");
        createKpi(sectionIndex, itemIndex, {
            type: "IDashboardLayoutItem",
            size: {
                xl: {
                    gridHeight: sizeInfo.height.default!,
                    gridWidth: sizeInfo.width.default!,
                },
            },
            widget: {
                type: "richText",
                description: "",
                content: "",
                drills: [],
                ignoreDashboardFilters: [],
                title: "",
                identifier: id,
                ref: idRef(id),
                uri: `/${id}}`,
            },
        });
    }, [createKpi, itemIndex, sectionIndex, settings]);
}
