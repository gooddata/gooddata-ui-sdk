// (C) 2022-2024 GoodData Corporation
import { IInsight, insightRef, insightTitle } from "@gooddata/sdk-model";
import { useCallback } from "react";
import { ILayoutItemPath } from "../../../../types.js";
import {
    useDashboardDispatch,
    useDashboardSelector,
    selectSettings,
    useDashboardCommandProcessing,
    enableInsightWidgetDateFilter,
    uiActions,
    DashboardCommandFailed,
    ChangeInsightWidgetFilterSettings,
    replaceNestedLayoutSectionItem,
    dispatchAndWaitFor,
    addNestedLayoutSectionItem,
} from "../../../../model/index.js";
import { serializeLayoutItemPath } from "../../../../_staging/layout/coordinates.js";
import { getSizeInfo } from "../../../../_staging/layout/sizing.js";
import { newLoadingPlaceholderWidget } from "../../../../widgets/index.js";

export function useInsightListItemDropHandler(layoutPath: ILayoutItemPath) {
    const dispatch = useDashboardDispatch();
    const settings = useDashboardSelector(selectSettings);

    const { run: preselectDateDataset } = useDashboardCommandProcessing({
        commandCreator: enableInsightWidgetDateFilter,
        errorEvent: "GDC.DASH/EVT.COMMAND.FAILED",
        successEvent: "GDC.DASH/EVT.INSIGHT_WIDGET.FILTER_SETTINGS_CHANGED",
        onSuccess: (event) => {
            dispatch(uiActions.setWidgetLoadingAdditionalDataStopped(event.payload.ref));
        },
        onError: (event: DashboardCommandFailed<ChangeInsightWidgetFilterSettings>) => {
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

            const sizeInfo = getSizeInfo(settings, "insight", insight);

            dispatchAndWaitFor(
                dispatch,
                addNestedLayoutSectionItem(
                    layoutPath,
                    {
                        type: "IDashboardLayoutItem",
                        size: {
                            xl: {
                                gridHeight: sizeInfo.height.default,
                                gridWidth: sizeInfo.width.default!,
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
                                gridHeight: sizeInfo.height.default,
                                gridWidth: sizeInfo.width.default!,
                            },
                        },
                    },
                    undefined,
                    false,
                    correlationId,
                );
            });
        },
        [replaceSectionItemLoader, dispatch, layoutPath, settings],
    );
}
