// (C) 2020-2026 GoodData Corporation

import { useCallback, useMemo, useState } from "react";

import cx from "classnames";

import { type IInsight, type IInsightWidget, widgetRef } from "@gooddata/sdk-model";
import { type IVisualizationSizeInfo } from "@gooddata/sdk-ui-ext";

import { type IDefaultDashboardVisualizationSwitcherWidgetProps } from "./types.js";
import {
    type IChangeInsightWidgetFilterSettings,
    enableInsightWidgetDateFilter,
} from "../../../../model/commands/insight.js";
import { eagerRemoveSectionItemByWidgetRef } from "../../../../model/commands/layout.js";
import {
    addVisualizationToSwitcherWidgetContent,
    updateVisualizationsFromSwitcherWidgetContent,
} from "../../../../model/commands/visualizationSwitcher.js";
import { type IDashboardCommandFailed } from "../../../../model/events/general.js";
import {
    useDashboardDispatch,
    useDashboardSelector,
} from "../../../../model/react/DashboardStoreProvider.js";
import { useDashboardCommandProcessing } from "../../../../model/react/useDashboardCommandProcessing.js";
import { useWidgetSelection } from "../../../../model/react/useWidgetSelection.js";
import { dispatchAndWaitFor } from "../../../../model/store/_infra/dispatchAndWaitFor.js";
import { selectIsDashboardSaving } from "../../../../model/store/saving/savingSelectors.js";
import { uiActions } from "../../../../model/store/ui/index.js";
import { useDashboardComponentsContext } from "../../../dashboardContexts/DashboardComponentsContext.js";
import { useIsDraggingWidget } from "../../../dragAndDrop/draggableWidget/useIsDraggingWidget.js";
import { DashboardItem } from "../../../presentationComponents/DashboardItems/DashboardItem.js";
import { DashboardItemBase } from "../../../presentationComponents/DashboardItems/DashboardItemBase.js";
import { DashboardVisualizationSwitcher } from "../../visualizationSwitcher/DashboardVisualizationSwitcher.js";

/**
 * @internal
 */
export function EditableDashboardVisualizationSwitcherWidget({
    widget,
    screen,
    dashboardItemClasses,
    onError,
    onExportReady,
    onLoadingChanged,
}: IDefaultDashboardVisualizationSwitcherWidgetProps) {
    const dispatch = useDashboardDispatch();

    const { isSelectable, isSelected, onSelected, closeConfigPanel, hasConfigPanelOpen } = useWidgetSelection(
        widgetRef(widget),
    );
    const isSaving = useDashboardSelector(selectIsDashboardSaving);
    const isEditable = !isSaving;
    const isDraggingWidget = useIsDraggingWidget();

    const [activeVisualizationId, setActiveVisualizationId] = useState<string | undefined>(
        widget.visualizations[0]?.identifier,
    );

    const { VisualizationSwitcherToolbarComponentProvider } = useDashboardComponentsContext();

    const VisualizationSwitcherToolbarComponent = useMemo(
        () => VisualizationSwitcherToolbarComponentProvider(widget),
        [VisualizationSwitcherToolbarComponentProvider, widget],
    );

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

    const addVisualization = useCallback(
        (insightWidget: IInsightWidget, insight: IInsight, sizeInfo: IVisualizationSizeInfo) => {
            void dispatchAndWaitFor(
                dispatch,
                addVisualizationToSwitcherWidgetContent(widget.ref, insightWidget, insight, sizeInfo),
            ).then(() => {
                dispatch(uiActions.setWidgetDateDatasetAutoSelect(true));
                dispatch(uiActions.setWidgetLoadingAdditionalDataStarted(insightWidget.ref));
                preselectDateDataset(insightWidget.ref, "default");
            });
        },
        [widget.ref, dispatch, preselectDateDataset],
    );

    const changedVisualizations = useCallback(
        (visualizations: IInsightWidget[]) => {
            dispatch(updateVisualizationsFromSwitcherWidgetContent(widget.ref, visualizations));
        },
        [widget.ref, dispatch],
    );

    return (
        <>
            <DashboardItem
                className={cx(
                    dashboardItemClasses,
                    "type-visualization",
                    "gd-dashboard-view-widget",
                    "is-edit-mode",
                    { "is-selected": isSelected },
                )}
                screen={screen}
            >
                <DashboardItemBase
                    isSelectable={isSelectable}
                    isSelected={isSelected}
                    onSelected={onSelected}
                    contentClassName={cx({
                        "is-editable": isEditable,
                        "is-dragging-widget": isDraggingWidget,
                    })}
                    visualizationClassName="gd-visualization-switcher-widget-wrapper"
                    renderAfterContent={() => {
                        return (
                            <>
                                {!!hasConfigPanelOpen && (
                                    <VisualizationSwitcherToolbarComponent
                                        widget={widget}
                                        onWidgetDelete={() =>
                                            dispatch(eagerRemoveSectionItemByWidgetRef(widget.ref))
                                        }
                                        onVisualizationsChanged={changedVisualizations}
                                        onSelectedVisualizationChanged={setActiveVisualizationId}
                                        onVisualizationAdded={addVisualization}
                                        onClose={closeConfigPanel}
                                    />
                                )}
                            </>
                        );
                    }}
                >
                    {({ clientWidth, clientHeight }) => (
                        <DashboardVisualizationSwitcher
                            widget={widget}
                            clientHeight={clientHeight}
                            clientWidth={clientWidth}
                            activeVisualizationId={activeVisualizationId}
                            onError={onError}
                            onExportReady={onExportReady}
                            onLoadingChanged={onLoadingChanged}
                            screen={screen}
                        />
                    )}
                </DashboardItemBase>
            </DashboardItem>
        </>
    );
}
