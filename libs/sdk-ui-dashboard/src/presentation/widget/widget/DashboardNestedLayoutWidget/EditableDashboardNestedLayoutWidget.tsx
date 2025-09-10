// (C) 2020-2025 GoodData Corporation

import React from "react";

import cx from "classnames";
import { FormattedMessage } from "react-intl";

import { IDashboardLayoutContainerDirection } from "@gooddata/sdk-model";
import { Icon } from "@gooddata/sdk-ui-kit";

import { Toolbar } from "./Toolbar.js";
import {
    eagerRemoveSectionItemByWidgetRef,
    selectIsDashboardSaving,
    toggleLayoutDirection,
    toggleLayoutSectionHeaders,
    useDashboardDispatch,
    useDashboardSelector,
    useWidgetSelection,
} from "../../../../model/index.js";
import { useScreenSize } from "../../../dashboard/components/DashboardScreenSizeContext.js";
import { useIsDraggingWidget } from "../../../dragAndDrop/index.js";
import { DashboardItem, DashboardItemBase } from "../../../presentationComponents/index.js";
import { DashboardLayout } from "../../dashboardLayout/DashboardLayout.js";
import { IDashboardLayoutProps } from "../../dashboardLayout/types.js";

const { SmallDragHandle: SmallDragHandleIcon } = Icon;

/**
 * @internal
 */
export function EditableDashboardNestedLayoutWidget({
    widget,
    layout,
    parentLayoutItemSize,
    parentLayoutPath,
    dashboardItemClasses,
}: IDashboardLayoutProps) {
    const screen = useScreenSize();
    const dispatch = useDashboardDispatch();

    const { isSelectable, isSelected, onSelected, closeConfigPanel, hasConfigPanelOpen } = useWidgetSelection(
        widget?.ref,
    );
    const isSaving = useDashboardSelector(selectIsDashboardSaving);
    const isEditable = !isSaving;
    const isDraggingWidget = useIsDraggingWidget();

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
                                        onWidgetDelete={() =>
                                            dispatch(eagerRemoveSectionItemByWidgetRef(widget!.ref))
                                        }
                                        onToggleHeaders={(areSectionHeadersEnabled: boolean) => {
                                            dispatch(
                                                toggleLayoutSectionHeaders(
                                                    parentLayoutPath,
                                                    areSectionHeadersEnabled,
                                                ),
                                            );
                                        }}
                                        onWidgetDirectionChanged={(
                                            direction: IDashboardLayoutContainerDirection,
                                        ) => {
                                            dispatch(toggleLayoutDirection(parentLayoutPath, direction));
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
                                <SmallDragHandleIcon className="gd-dashboard-nested-layout-tab__icon" />
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
        </>
    );
}
