// (C) 2024 GoodData Corporation

import { useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { idRef } from "@gooddata/sdk-model";

import {
    useDashboardDispatch,
    useDashboardCommandProcessing,
    uiActions,
    addNestedLayoutSection,
} from "../../../../model/index.js";
import { ILayoutSectionPath } from "../../../../types.js";
import { BaseDraggableLayoutItemSize } from "../../../dragAndDrop/index.js";

export function useNewSectionVisualizationSwitcherPlaceholderDropHandler(sectionIndex: ILayoutSectionPath) {
    const dispatch = useDashboardDispatch();

    const { run: addNewSectionWithVisualizationSwitcherPlaceholder } = useDashboardCommandProcessing({
        commandCreator: addNestedLayoutSection,
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        successEvent: "GDC.DASH/EVT.FLUID_LAYOUT.SECTION_ADDED",
        onSuccess: (event) => {
            const ref = event.payload.section.items[0].widget!.ref;
            dispatch(uiActions.selectWidget(ref));
            dispatch(uiActions.setConfigurationPanelOpened(true));
        },
    });

    return useCallback(
        (itemSize: BaseDraggableLayoutItemSize) => {
            const id = uuidv4();

            addNewSectionWithVisualizationSwitcherPlaceholder(sectionIndex, {}, [
                {
                    type: "IDashboardLayoutItem",
                    size: {
                        xl: {
                            gridHeight: itemSize.gridHeight,
                            gridWidth: itemSize.gridWidth,
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
        },
        [addNewSectionWithVisualizationSwitcherPlaceholder, sectionIndex],
    );
}
