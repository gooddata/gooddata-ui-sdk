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
} from "../../../../model/index.js";
import { IDefaultDashboardVisualizationSwitcherWidgetProps } from "./types.js";
import { DashboardVisualizationSwitcher } from "../../visualizationSwitcher/DashboardVisualizationSwitcher.js";
import { useDashboardComponentsContext } from "../../../dashboardContexts/index.js";
import { DASHBOARD_OVERLAYS_FILTER_Z_INDEX } from "../../../../presentation/constants/index.js";

const overlayController = OverlayController.getInstance(DASHBOARD_OVERLAYS_FILTER_Z_INDEX);

/**
 * @internal
 */
export const EditableDashboardVisualizationSwitcherWidget: React.FC<
    IDefaultDashboardVisualizationSwitcherWidgetProps
> = ({ widget, screen, dashboardItemClasses }) => {
    const dispatch = useDashboardDispatch();
    const intl = useIntl();

    const { isSelectable, isSelected, onSelected, hasConfigPanelOpen } = useWidgetSelection(
        widgetRef(widget),
    );
    const isSaving = useDashboardSelector(selectIsDashboardSaving);
    const isEditable = !isSaving;

    const { VisualizationSwitcherToolbarComponentProvider } = useDashboardComponentsContext();

    const [isConfirmDeleteDialogVisible, setIsConfirmDeleteDialogVisible] = useState<boolean>(false);

    const VisualizationSwitcherToolbarComponent = useMemo(
        () => VisualizationSwitcherToolbarComponentProvider(widget),
        [VisualizationSwitcherToolbarComponentProvider, widget],
    );

    const addVisualization = useCallback(
        (insightWidget: IInsightWidget, insight: IInsight, sizeInfo: IVisualizationSizeInfo) => {
            dispatch(addVisualizationToSwitcherWidgetContent(widget.ref, insightWidget, insight, sizeInfo));
        },
        [widget.ref],
    );

    const changedVisualizations = useCallback(
        (visualizations: IInsightWidget[]) => {
            dispatch(updateVisualizationsFromSwitcherWidgetContent(widget.ref, visualizations));
        },
        [widget.ref],
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
                    contentClassName={cx({ "is-editable": isEditable })}
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
                                        onVisualizationAdded={addVisualization}
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
