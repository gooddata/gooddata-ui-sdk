// (C) 2022 GoodData Corporation
import { useCallback } from "react";
import { IVisualizationSizeInfo } from "@gooddata/sdk-ui-ext";

import {
    useDashboardSelector,
    useDashboardDispatch,
    selectIsLayoutEmpty,
    addLayoutSection,
    selectSettings,
} from "../../../model/index.js";
import {
    DraggableItem,
    isInsightDraggableListItem,
    isInsightPlaceholderDraggableItem,
    isKpiPlaceholderDraggableItem,
} from "../types.js";
import { newInitialPlaceholderWidget } from "../../../widgets/index.js";
import { getInsightPlaceholderSizeInfo, getSizeInfo } from "../../../_staging/layout/sizing.js";

export function useAddInitialSectionHandler() {
    const dispatch = useDashboardDispatch();
    const settings = useDashboardSelector(selectSettings);
    const isLayoutEmpty = useDashboardSelector(selectIsLayoutEmpty);

    return useCallback(
        (item: DraggableItem) => {
            if (isLayoutEmpty) {
                let sizeInfo: IVisualizationSizeInfo | undefined;
                if (isInsightDraggableListItem(item)) {
                    sizeInfo = getSizeInfo(settings, "insight", item.insight);
                }
                if (isInsightPlaceholderDraggableItem(item)) {
                    sizeInfo = getInsightPlaceholderSizeInfo(settings);
                }
                if (isKpiPlaceholderDraggableItem(item)) {
                    sizeInfo = getSizeInfo(settings, "kpi");
                }

                if (sizeInfo) {
                    dispatch(
                        addLayoutSection(0, {}, [
                            {
                                type: "IDashboardLayoutItem",
                                size: {
                                    xl: {
                                        gridHeight: sizeInfo.height.default!,
                                        gridWidth: sizeInfo.width.default!,
                                    },
                                },
                                widget: newInitialPlaceholderWidget(),
                            },
                        ]),
                    );
                }
            }
        },
        [dispatch, isLayoutEmpty, settings],
    );
}
