// (C) 2020-2024 GoodData Corporation
/* eslint-disable no-console */

import React, { useMemo, useState, useCallback } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import cx from "classnames";
import { IInsight, IInsightWidget, widgetRef } from "@gooddata/sdk-model";
import { IVisualizationSizeInfo } from "@gooddata/sdk-ui-ext";
import { ConfirmDialog, OverlayController, OverlayControllerProvider } from "@gooddata/sdk-ui-kit";

import { DashboardItem, DashboardItemBase } from "../../../presentationComponents/index.js";
import {
    addVisualizationToSwitcherWidgetContent,
    updateVisualizationsFromSwitcherWidgetContent,
    eagerRemoveSectionItemByWidgetRef,
    selectIsDashboardSaving,
    useDashboardDispatch,
    useDashboardSelector,
    useWidgetSelection,
    useDashboardCommandProcessing,
    ChangeInsightWidgetFilterSettings,
    DashboardCommandFailed,
    enableInsightWidgetDateFilter,
    uiActions,
    dispatchAndWaitFor,
} from "../../../../model/index.js";
import { IDefaultDashboardVisualizationSwitcherWidgetProps } from "./types.js";
import { DashboardVisualizationSwitcher } from "../../visualizationSwitcher/DashboardVisualizationSwitcher.js";
import { useDashboardComponentsContext } from "../../../dashboardContexts/index.js";
import { DASHBOARD_OVERLAYS_FILTER_Z_INDEX } from "../../../constants/index.js";
import { useIsDraggingWidget } from "../../../dragAndDrop/index.js";
const overlayController = OverlayController.getInstance(DASHBOARD_OVERLAYS_FILTER_Z_INDEX);

/**
 * @internal
 */
export const EditableDashboardVisualizationSwitcherWidget: React.FC<
    IDefaultDashboardVisualizationSwitcherWidgetProps
> = ({ widget, screen, dashboardItemClasses, onError, onExportReady, onLoadingChanged }) => {
    const dispatch = useDashboardDispatch();
    const intl = useIntl();

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

    const [isConfirmDeleteDialogVisible, setIsConfirmDeleteDialogVisible] = useState<boolean>(false);

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
        onError: (event: DashboardCommandFailed<ChangeInsightWidgetFilterSettings>) => {
            dispatch(uiActions.setWidgetLoadingAdditionalDataStopped(event.payload.command.payload.ref));
        },
    });

    const addVisualization = useCallback(
        (insightWidget: IInsightWidget, insight: IInsight, sizeInfo: IVisualizationSizeInfo) => {
            dispatchAndWaitFor(
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
                                {!!isSelected && (
                                    <div
                                        className="dash-item-action dash-item-action-lw-options"
                                        onClick={onSelected}
                                    />
                                )}
                                {!!hasConfigPanelOpen && (
                                    <VisualizationSwitcherToolbarComponent
                                        widget={widget}
                                        onWidgetDelete={() => setIsConfirmDeleteDialogVisible(true)}
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
            {isConfirmDeleteDialogVisible ? (
                <OverlayControllerProvider overlayController={overlayController}>
                    <ConfirmDialog
                        className="s-visualization-switcher-remove-confirm-dialog"
                        onSubmit={() => dispatch(eagerRemoveSectionItemByWidgetRef(widget.ref))}
                        onCancel={() => setIsConfirmDeleteDialogVisible(false)}
                        headline={intl.formatMessage({ id: "visualizationSwitcher.deleteDialog.header" })}
                        submitButtonText={intl.formatMessage({ id: "delete" })}
                        cancelButtonText={intl.formatMessage({ id: "cancel" })}
                    >
                        <FormattedMessage id="visualizationSwitcher.deleteDialog.message" />
                    </ConfirmDialog>
                </OverlayControllerProvider>
            ) : null}
        </>
    );
};
