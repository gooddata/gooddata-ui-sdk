// (C) 2020-2025 GoodData Corporation
import React, { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import cx from "classnames";
import { ConfirmDialog, Icon, OverlayController, OverlayControllerProvider } from "@gooddata/sdk-ui-kit";

import { DashboardItem, DashboardItemBase } from "../../../presentationComponents/index.js";
import {
    eagerRemoveSectionItemByWidgetRef,
    selectIsDashboardSaving,
    useDashboardDispatch,
    useDashboardSelector,
    useWidgetSelection,
    toggleLayoutSectionHeaders,
} from "../../../../model/index.js";

import { DASHBOARD_OVERLAYS_FILTER_Z_INDEX } from "../../../constants/index.js";
import { DashboardLayout } from "../../dashboardLayout/DashboardLayout.js";
import { Toolbar } from "./Toolbar.js";
import { IDashboardLayoutProps } from "../../dashboardLayout/types.js";
import { useScreenSize } from "../../../dashboard/components/DashboardScreenSizeContext.js";
import { useIsDraggingWidget } from "../../../dragAndDrop/index.js";

const overlayController = OverlayController.getInstance(DASHBOARD_OVERLAYS_FILTER_Z_INDEX);

/**
 * @internal
 */
export const EditableDashboardNestedLayoutWidget: React.FC<IDashboardLayoutProps> = ({
    widget,
    layout,
    parentLayoutItemSize,
    parentLayoutPath,
    dashboardItemClasses,
}) => {
    const screen = useScreenSize();
    const dispatch = useDashboardDispatch();
    const intl = useIntl();

    const { isSelectable, isSelected, onSelected, closeConfigPanel, hasConfigPanelOpen } = useWidgetSelection(
        widget?.ref,
    );
    const isSaving = useDashboardSelector(selectIsDashboardSaving);
    const isEditable = !isSaving;
    const isDraggingWidget = useIsDraggingWidget();

    const [isConfirmDeleteDialogVisible, setIsConfirmDeleteDialogVisible] = useState<boolean>(false);

    return (
        <>
            <DashboardItem
                className={cx(
                    dashboardItemClasses,
                    "gd-dashboard-nested-layout-widget",
                    "gd-dashboard-view-widget",
                    "is-edit-mode",
                    {
                        "is-selected": isSelected,
                    },
                )}
                screen={screen}
            >
                <DashboardItemBase
                    isSelectable={isSelectable}
                    isSelected={isSelected}
                    onSelected={onSelected}
                    visualizationClassName="gd-dashboard-nested-layout-widget-visualization-content"
                    contentClassName={cx("gd-dashboard-nested-layout-content", {
                        "is-editable": isEditable,
                        "is-dragging-widget": isDraggingWidget,
                    })}
                    renderAfterContent={() => {
                        return (
                            <>
                                {hasConfigPanelOpen ? (
                                    <Toolbar
                                        layout={layout!}
                                        onWidgetDelete={() => setIsConfirmDeleteDialogVisible(true)}
                                        onToggleHeaders={(areSectionHeadersEnabled: boolean) => {
                                            dispatch(
                                                toggleLayoutSectionHeaders(
                                                    parentLayoutPath,
                                                    areSectionHeadersEnabled,
                                                ),
                                            );
                                        }}
                                        onClose={closeConfigPanel}
                                    />
                                ) : null}
                            </>
                        );
                    }}
                >
                    {({ clientWidth, clientHeight }) => (
                        <>
                            <div
                                className={cx("gd-dashboard-nested-layout-tab", {
                                    "is-selected": isSelected,
                                })}
                            >
                                <Icon.SmallDragHandle className="gd-dashboard-nested-layout-tab__icon" />
                                <div className="gd-dashboard-nested-layout-tab__text">
                                    <FormattedMessage id="nestedLayout.tab.title" />
                                </div>
                            </div>
                            <DashboardLayout
                                widget={widget}
                                layout={layout}
                                clientHeight={clientHeight}
                                clientWidth={clientWidth}
                                parentLayoutItemSize={parentLayoutItemSize}
                                parentLayoutPath={parentLayoutPath}
                            />
                        </>
                    )}
                </DashboardItemBase>
            </DashboardItem>
            {isConfirmDeleteDialogVisible ? (
                <OverlayControllerProvider overlayController={overlayController}>
                    <ConfirmDialog
                        className="s-dashboard-nested-layout-remove-confirm-dialog"
                        onSubmit={() => {
                            dispatch(eagerRemoveSectionItemByWidgetRef(widget!.ref));
                            setIsConfirmDeleteDialogVisible(false);
                        }}
                        onCancel={() => setIsConfirmDeleteDialogVisible(false)}
                        headline={intl.formatMessage({ id: "nestedLayout.deleteDialog.header" })}
                        submitButtonText={intl.formatMessage({ id: "delete" })}
                        cancelButtonText={intl.formatMessage({ id: "cancel" })}
                    >
                        <FormattedMessage id="nestedLayout.deleteDialog.message" />
                    </ConfirmDialog>
                </OverlayControllerProvider>
            ) : null}
        </>
    );
};
