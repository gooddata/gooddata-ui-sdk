// (C) 2026 GoodData Corporation

import { useCallback } from "react";

import { type IInsight, insightRef, insightTitle } from "@gooddata/sdk-model";
import { INSIGHT_WIDGET_SIZE_INFO_DEFAULT } from "@gooddata/sdk-ui-ext";

import { getSizeInfo } from "../../../_staging/layout/sizing.js";
import {
    type IChangeInsightWidgetFilterSettings,
    enableInsightWidgetDateFilter,
} from "../../../model/commands/insight.js";
import {
    type IAddLayoutSection,
    type IAddSectionItems,
    addLayoutSection,
    addSectionItem,
    replaceSectionItem,
} from "../../../model/commands/layout.js";
import { type IDashboardCommandFailed } from "../../../model/events/general.js";
import {
    type IDashboardLayoutSectionAdded,
    type IDashboardLayoutSectionItemsAdded,
} from "../../../model/events/layout.js";
import { useDashboardDispatch, useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import { useDashboardCommandProcessing } from "../../../model/react/useDashboardCommandProcessing.js";
import { dispatchAndWaitFor } from "../../../model/store/_infra/dispatchAndWaitFor.js";
import { selectSettings } from "../../../model/store/config/configSelectors.js";
import { selectLayout } from "../../../model/store/tabs/layout/layoutSelectors.js";
import { uiActions } from "../../../model/store/ui/index.js";
import { newLoadingPlaceholderWidget } from "../../../widgets/placeholders/types.js";

/**
 * Hook that inserts an insight to the end of the last layout section using the same
 * two-step flow as drag-and-drop:
 *   1. Insert a loading placeholder immediately (instant visual feedback)
 *   2. Replace it with the real insight widget
 *   3. Select the widget, open config panel, and preselect date dataset
 *
 * @internal
 */
export function useInsertInsightToLayout() {
    const dispatch = useDashboardDispatch();
    const settings = useDashboardSelector(selectSettings);
    const layout = useDashboardSelector(selectLayout);

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

    const { run: runReplace } = useDashboardCommandProcessing({
        commandCreator: replaceSectionItem,
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
        async (insight: IInsight) => {
            const sizeInfo = getSizeInfo(settings, "insight", insight);
            const gridHeight = sizeInfo.height.default || INSIGHT_WIDGET_SIZE_INFO_DEFAULT.height.default;
            const gridWidth = sizeInfo.width.default || INSIGHT_WIDGET_SIZE_INFO_DEFAULT.width.default;
            const size = { xl: { gridHeight, gridWidth } };

            // Step 1: Insert loading placeholder (and new section if layout is empty).
            const placeholderItem = {
                type: "IDashboardLayoutItem" as const,
                size,
                widget: newLoadingPlaceholderWidget(),
            };

            // Read the actual insertion position from the success event — using pre-computed
            // indices from the closure would go stale if another dispatch touched the layout
            // between the add and the replace.
            let actualSectionIndex: number;
            let actualItemIndex: number;
            if (layout.sections.length > 0) {
                const result = await dispatchAndWaitFor<IAddSectionItems, IDashboardLayoutSectionItemsAdded>(
                    dispatch,
                    addSectionItem(layout.sections.length - 1, -1, placeholderItem, true),
                );
                actualSectionIndex = result.payload.sectionIndex;
                actualItemIndex = result.payload.startIndex;
            } else {
                const result = await dispatchAndWaitFor<IAddLayoutSection, IDashboardLayoutSectionAdded>(
                    dispatch,
                    addLayoutSection(-1, undefined, [placeholderItem], true),
                );
                actualSectionIndex = result.payload.index;
                actualItemIndex = 0;
            }

            // Step 2: Replace placeholder with real widget.
            runReplace(
                actualSectionIndex,
                actualItemIndex,
                {
                    type: "IDashboardLayoutItem",
                    size,
                    widget: {
                        type: "insight",
                        insight: insightRef(insight),
                        ignoreDashboardFilters: [],
                        drills: [],
                        title: insightTitle(insight),
                        description: "",
                    },
                },
                undefined,
                true,
            );
        },
        [dispatch, layout, settings, runReplace],
    );
}
