// (C) 2022-2025 GoodData Corporation
import { useCallback, useMemo } from "react";

import { type IInsight, insightRef, insightTitle } from "@gooddata/sdk-model";

import { useUpdateWidgetDefaultSizeByParent } from "./useUpdateWidgetDefaultSizeByParent.js";
import { asLayoutItemPath, serializeLayoutSectionPath } from "../../../../_staging/layout/coordinates.js";
import { getSizeInfo } from "../../../../_staging/layout/sizing.js";
import {
    type ChangeInsightWidgetFilterSettings,
    type DashboardCommandFailed,
    addNestedLayoutSection,
    dispatchAndWaitFor,
    enableInsightWidgetDateFilter,
    replaceNestedLayoutSectionItem,
    selectSettings,
    uiActions,
    useDashboardCommandProcessing,
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../../model/index.js";
import { type ILayoutSectionPath } from "../../../../types.js";
import { newLoadingPlaceholderWidget } from "../../../../widgets/index.js";

export function useNewSectionInsightListItemDropHandler(sectionIndex: ILayoutSectionPath) {
    const dispatch = useDashboardDispatch();
    const settings = useDashboardSelector(selectSettings);
    const layoutPath = useMemo(() => asLayoutItemPath(sectionIndex, 0), [sectionIndex]);
    const updateWidgetDefaultSizeByParent = useUpdateWidgetDefaultSizeByParent(layoutPath);

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
            const correlationId = `insert-insight-list-item-${serializeLayoutSectionPath(sectionIndex)}`;
            const defaultItemSize = getSizeInfo(settings, "insight", insight);
            const itemSize = updateWidgetDefaultSizeByParent(defaultItemSize);

            dispatchAndWaitFor(
                dispatch,
                addNestedLayoutSection(
                    sectionIndex,
                    {},
                    [
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
                    ],
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
        [
            dispatch,
            replaceSectionItemLoader,
            sectionIndex,
            settings,
            layoutPath,
            updateWidgetDefaultSizeByParent,
        ],
    );
}
