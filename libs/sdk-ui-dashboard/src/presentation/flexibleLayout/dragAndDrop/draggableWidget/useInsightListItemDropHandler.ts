// (C) 2022-2026 GoodData Corporation

import { useCallback } from "react";

import { type IInsight, insightRef, insightTitle } from "@gooddata/sdk-model";

import { useUpdateWidgetDefaultSizeByParent } from "./useUpdateWidgetDefaultSizeByParent.js";
import { serializeLayoutItemPath } from "../../../../_staging/layout/coordinates.js";
import { getSizeInfo } from "../../../../_staging/layout/sizing.js";
import {
    type IChangeInsightWidgetFilterSettings,
    type IDashboardCommandFailed,
    addNestedLayoutSectionItem,
    dispatchAndWaitFor,
    enableInsightWidgetDateFilter,
    replaceNestedLayoutSectionItem,
    selectSettings,
    uiActions,
    useDashboardCommandProcessing,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../../model/index.js";
import { type ILayoutItemPath } from "../../../../types.js";
import { newLoadingPlaceholderWidget } from "../../../../widgets/index.js";

export function useInsightListItemDropHandler(layoutPath: ILayoutItemPath) {
    const dispatch = useDashboardDispatch();
    const settings = useDashboardSelector(selectSettings);
    const updateWidgetDefaultSizeByParent = useUpdateWidgetDefaultSizeByParent(layoutPath);

    const { run: preselectDateDataset } = useDashboardCommandProcessing({
        commandCreator: enableInsightWidgetDateFilter,
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        successEvent: "GDC.DASH/EVT.INSIGHT_WIDGET.FILTER_SETTINGS_CHANGED",
        onSuccess: (event) => {
            dispatch(uiActions.setWidgetLoadingAdditionalDataStopped(event.payload.ref));
        },
        onError: (event: IDashboardCommandFailed<IChangeInsightWidgetFilterSettings>) => {
            dispatch(uiActions.setWidgetLoadingAdditionalDataStopped(event.payload.command.payload.ref));
        },
    });

    const { run: replaceSectionItemLoader } = useDashboardCommandProcessing({
        commandCreator: replaceNestedLayoutSectionItem,
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        successEvent: "GDC.DASH/EVT.FLUID_LAYOUT.ITEM_REPLACED",
        onSuccess: (event) => {
            const ref = event.payload.items[0].widget!.ref;
            dispatch(uiActions.selectWidget(ref));
            dispatch(uiActions.setConfigurationPanelOpened(true));
            dispatch(uiActions.setWidgetDateDatasetAutoSelect(true));
            dispatch(uiActions.setWidgetLoadingAdditionalDataStarted(ref));
            preselectDateDataset(ref, "default");
        },
    });

    return useCallback(
        (insight: IInsight) => {
            const correlationId = `insert-insight-list-item-${serializeLayoutItemPath(layoutPath)}`;
            const defaultItemSize = getSizeInfo(settings, "insight", insight);
            const itemSize = updateWidgetDefaultSizeByParent(defaultItemSize);

            void dispatchAndWaitFor(
                dispatch,
                addNestedLayoutSectionItem(
                    layoutPath,
                    {
                        type: "IDashboardLayoutItem",
                        size: {
                            xl: {
                                gridHeight: itemSize.height.default,
                                gridWidth: itemSize.width.default!,
                            },
                        },
                        widget: newLoadingPlaceholderWidget(),
                    },
                    false,
                    correlationId,
                ),
            ).then(() => {
                replaceSectionItemLoader(
                    layoutPath,
                    {
                        type: "IDashboardLayoutItem",
                        widget: {
                            type: "insight",
                            insight: insightRef(insight),
                            ignoreDashboardFilters: [],
                            drills: [],
                            title: insightTitle(insight),
                            description: "",
                        },
                        size: {
                            xl: {
                                gridHeight: itemSize.height.default,
                                gridWidth: itemSize.width.default!,
                            },
                        },
                    },
                    undefined,
                    false,
                    correlationId,
                );
            });
        },
        [replaceSectionItemLoader, dispatch, layoutPath, settings, updateWidgetDefaultSizeByParent],
    );
}
