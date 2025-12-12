// (C) 2024-2025 GoodData Corporation

import { useCallback, useMemo } from "react";

import { v4 as uuidv4 } from "uuid";

import { idRef } from "@gooddata/sdk-model";

import { useUpdateWidgetDefaultSizeByParent } from "./useUpdateWidgetDefaultSizeByParent.js";
import { asLayoutItemPath } from "../../../../_staging/layout/coordinates.js";
import {
    addNestedLayoutSection,
    uiActions,
    useDashboardCommandProcessing,
    useDashboardDispatch,
} from "../../../../model/index.js";
import { type ILayoutSectionPath } from "../../../../types.js";
import { type BaseDraggableLayoutItemSize } from "../../../dragAndDrop/index.js";

export function useNewSectionVisualizationSwitcherPlaceholderDropHandler(sectionIndex: ILayoutSectionPath) {
    const dispatch = useDashboardDispatch();
    const layoutPath = useMemo(() => asLayoutItemPath(sectionIndex, 0), [sectionIndex]);
    const updateWidgetDefaultSizeByParent = useUpdateWidgetDefaultSizeByParent(layoutPath);

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
        (defaultItemSize: BaseDraggableLayoutItemSize) => {
            const itemSize = updateWidgetDefaultSizeByParent(defaultItemSize);
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
        [addNewSectionWithVisualizationSwitcherPlaceholder, sectionIndex, updateWidgetDefaultSizeByParent],
    );
}
