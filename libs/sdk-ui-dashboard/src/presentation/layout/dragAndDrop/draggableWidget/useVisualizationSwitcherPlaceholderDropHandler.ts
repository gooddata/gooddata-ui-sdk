// (C) 2024-2025 GoodData Corporation

import { useCallback } from "react";

import { v4 as uuidv4 } from "uuid";

import { idRef } from "@gooddata/sdk-model";
import { VISUALIZATION_SWITCHER_WIDGET_SIZE_INFO_DEFAULT } from "@gooddata/sdk-ui-ext";

import {
    addSectionItem,
    uiActions,
    useDashboardCommandProcessing,
    useDashboardDispatch,
} from "../../../../model/index.js";

export function useVisualizationSwitcherPlaceholderDropHandler(sectionIndex: number, itemIndex: number) {
    const dispatch = useDashboardDispatch();

    const { run: createVisualizationSwitcher } = useDashboardCommandProcessing({
        commandCreator: addSectionItem,
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        successEvent: "GDC.DASH/EVT.FLUID_LAYOUT.ITEMS_ADDED",
        onSuccess: (event) => {
            const ref = event.payload.itemsAdded[0].widget!.ref;
            dispatch(uiActions.selectWidget(ref));
            dispatch(uiActions.setConfigurationPanelOpened(true));
        },
    });

    return useCallback(() => {
        const id = uuidv4();
        createVisualizationSwitcher(sectionIndex, itemIndex, {
            type: "IDashboardLayoutItem",
            size: {
                xl: {
                    gridHeight: VISUALIZATION_SWITCHER_WIDGET_SIZE_INFO_DEFAULT.height.default!,
                    gridWidth: VISUALIZATION_SWITCHER_WIDGET_SIZE_INFO_DEFAULT.width.default!,
                },
            },
            widget: {
                type: "visualizationSwitcher",
                visualizations: [],
                description: "",
                drills: [],
                ignoreDashboardFilters: [],
                title: "",
                identifier: id,
                ref: idRef(id),
                uri: `/${id}`,
            },
        });
    }, [createVisualizationSwitcher, itemIndex, sectionIndex]);
}
