// (C) 2024-2025 GoodData Corporation

import { useCallback } from "react";

import { v4 as uuidv4 } from "uuid";

import { idRef } from "@gooddata/sdk-model";
import { VISUALIZATION_SWITCHER_WIDGET_SIZE_INFO_DEFAULT } from "@gooddata/sdk-ui-ext";

import {
    addLayoutSection,
    uiActions,
    useDashboardCommandProcessing,
    useDashboardDispatch,
} from "../../../../model/index.js";

export function useNewSectionVisualizationSwitcherPlaceholderDropHandler(sectionIndex: number) {
    const dispatch = useDashboardDispatch();

    const { run: addNewSectionWithVisualizationSwitcherPlaceholder } = useDashboardCommandProcessing({
        commandCreator: addLayoutSection,
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        successEvent: "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_ADDED",
        onSuccess: (event) => {
            const ref = event.payload.section.items[0].widget!.ref;
            dispatch(uiActions.selectWidget(ref));
            dispatch(uiActions.setConfigurationPanelOpened(true));
        },
    });

    return useCallback(() => {
        const id = uuidv4();
        addNewSectionWithVisualizationSwitcherPlaceholder(sectionIndex, {}, [
            {
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
            },
        ]);
    }, [addNewSectionWithVisualizationSwitcherPlaceholder, sectionIndex]);
}
