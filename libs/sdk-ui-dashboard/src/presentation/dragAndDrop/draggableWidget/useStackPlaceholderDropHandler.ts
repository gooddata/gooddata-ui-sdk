// (C) 2022-2024 GoodData Corporation
import { idRef } from "@gooddata/sdk-model";
import { useCallback } from "react";

import {
    addSectionItem,
    selectSettings,
    uiActions,
    useDashboardCommandProcessing,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../model/index.js";
import { KPI_PLACEHOLDER_WIDGET_ID } from "../../../widgets/index.js";
import { v4 as uuidv4 } from "uuid";
import { STACK_WIDGET_SIZE_INFO_DEFAULT } from "@gooddata/sdk-ui-ext";

export function useStackPlaceholderDropHandler(sectionIndex: number, itemIndex: number) {
    const dispatch = useDashboardDispatch();
    const settings = useDashboardSelector(selectSettings);

    const { run: createStack } = useDashboardCommandProcessing({
        commandCreator: addSectionItem,
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        successEvent: "GDC.DASH/EVT.FLUID_LAYOUT.ITEMS_ADDED",
        onSuccess: (event) => {
            const ref = event.payload.itemsAdded[0].widget!.ref;
            dispatch(uiActions.selectWidget(idRef(KPI_PLACEHOLDER_WIDGET_ID)));
            dispatch(uiActions.setConfigurationPanelOpened(true));
            dispatch(uiActions.setWidgetDateDatasetAutoSelect(true));
            dispatch(uiActions.setWidgetLoadingAdditionalDataStarted(ref));
        },
    });

    return useCallback(() => {
        const id = uuidv4();
        createStack(sectionIndex, itemIndex, {
            type: "IDashboardLayoutItem",
            size: {
                xl: {
                    gridHeight: STACK_WIDGET_SIZE_INFO_DEFAULT.height.default!,
                    gridWidth: STACK_WIDGET_SIZE_INFO_DEFAULT.width.default!,
                },
            },
            widget: {
                type: "stack",
                widgets: [],
                insights: [],
                description: "",
                drills: [],
                ignoreDashboardFilters: [],
                title: "",
                identifier: id,
                ref: idRef(id),
                uri: `/${id}`,
            },
        });
    }, [createStack, itemIndex, sectionIndex, settings]);
}
