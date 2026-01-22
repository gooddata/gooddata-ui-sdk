// (C) 2022-2026 GoodData Corporation

import { useCallback } from "react";

import { v4 as uuidv4 } from "uuid";

import { idRef } from "@gooddata/sdk-model";

import { useUpdateWidgetDefaultSizeByParent } from "./useUpdateWidgetDefaultSizeByParent.js";
import { type IChangeInsightWidgetFilterSettings } from "../../../../model/commands/insight.js";
import { addNestedLayoutSectionItem } from "../../../../model/commands/layout.js";
import { enableRichTextWidgetDateFilter } from "../../../../model/commands/richText.js";
import { type IDashboardCommandFailed } from "../../../../model/events/general.js";
import { useDashboardDispatch } from "../../../../model/react/DashboardStoreProvider.js";
import { useDashboardCommandProcessing } from "../../../../model/react/useDashboardCommandProcessing.js";
import { uiActions } from "../../../../model/store/ui/index.js";
import { type ILayoutItemPath } from "../../../../types.js";
import { type BaseDraggableLayoutItemSize } from "../../../dragAndDrop/types.js";

export function useRichTextPlaceholderDropHandler(layoutPath: ILayoutItemPath) {
    const dispatch = useDashboardDispatch();
    const updateWidgetDefaultSizeByParent = useUpdateWidgetDefaultSizeByParent(layoutPath);

    const { run: preselectDateDataset } = useDashboardCommandProcessing({
        commandCreator: enableRichTextWidgetDateFilter,
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        successEvent: "GDC.DASH/EVT.RICH_TEXT_WIDGET.FILTER_SETTINGS_CHANGED",
        onSuccess: (event) => {
            dispatch(uiActions.setWidgetLoadingAdditionalDataStopped(event.payload.ref));
        },
        onError: (event: IDashboardCommandFailed<IChangeInsightWidgetFilterSettings>) => {
            dispatch(uiActions.setWidgetLoadingAdditionalDataStopped(event.payload.command.payload.ref));
        },
    });

    const { run: createRichText } = useDashboardCommandProcessing({
        commandCreator: addNestedLayoutSectionItem,
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        successEvent: "GDC.DASH/EVT.FLUID_LAYOUT.ITEMS_ADDED",
        onSuccess: (event) => {
            const ref = event.payload.itemsAdded[0].widget!.ref;
            preselectDateDataset(ref, "default");
            dispatch(uiActions.selectWidget(ref));
        },
    });

    return useCallback(
        (defaultItemSize: BaseDraggableLayoutItemSize) => {
            const itemSize = updateWidgetDefaultSizeByParent(defaultItemSize);
            const id = uuidv4();

            createRichText(layoutPath, {
                type: "IDashboardLayoutItem",
                size: {
                    xl: {
                        gridHeight: itemSize.gridHeight,
                        gridWidth: itemSize.gridWidth,
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
                    uri: `/${id}`,
                },
            });
        },
        [createRichText, layoutPath, updateWidgetDefaultSizeByParent],
    );
}
