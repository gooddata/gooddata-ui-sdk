// (C) 2020-2024 GoodData Corporation
/* eslint-disable no-console */

import React, { useMemo } from "react";
import cx from "classnames";
import { widgetRef } from "@gooddata/sdk-model";

import { DashboardItem, DashboardItemBase } from "../../../presentationComponents/index.js";
import {
    selectIsDashboardSaving,
    useDashboardSelector,
    useWidgetSelection,
} from "../../../../model/index.js";
import { IDefaultDashboardVisualizationSwitcherWidgetProps } from "./types.js";
import { DashboardVisualizationSwitcher } from "../../visualizationSwitcher/DashboardVisualizationSwitcher.js";
import { useDashboardComponentsContext } from "../../../dashboardContexts/index.js";

/**
 * @internal
 */
export const EditableDashboardVisualizationSwitcherWidget: React.FC<
    IDefaultDashboardVisualizationSwitcherWidgetProps
> = ({ widget, screen, dashboardItemClasses }) => {
    const { isSelectable, isSelected, onSelected, hasConfigPanelOpen } = useWidgetSelection(
        widgetRef(widget),
    );
    const isSaving = useDashboardSelector(selectIsDashboardSaving);
    const isEditable = !isSaving;

    const { VisualizationSwitcherToolbarComponentProvider } = useDashboardComponentsContext();

    const VisualizationSwitcherToolbarComponent = useMemo(
        () => VisualizationSwitcherToolbarComponentProvider(widget),
        [VisualizationSwitcherToolbarComponentProvider, widget],
    );

    return (
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
                                    onWidgetDelete={() => console.log("onWidgetDeleted")}
                                    // TODO INE add handler implementation
                                    onVisualizationsChanged={() => console.log("onVisualizationsChanged")}
                                    onVisualizationAdded={() => console.log("onVisualizationAdded")}
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
    );
};
