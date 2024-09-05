// (C) 2020-2024 GoodData Corporation

import React from "react";
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

/**
 * @internal
 */
export const EditableDashboardVisualizationSwitcherWidget: React.FC<
    IDefaultDashboardVisualizationSwitcherWidgetProps
> = ({ widget, screen, dashboardItemClasses }) => {
    const { isSelectable, isSelected, onSelected } = useWidgetSelection(widgetRef(widget));
    const isSaving = useDashboardSelector(selectIsDashboardSaving);
    const isEditable = !isSaving;

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
