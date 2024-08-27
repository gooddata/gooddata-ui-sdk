// (C) 2020-2024 GoodData Corporation
import React from "react";
import cx from "classnames";

import { DashboardItem, DashboardItemBase } from "../../../presentationComponents/index.js";
import {
    selectIsDashboardSaving,
    useDashboardSelector,
    useWidgetSelection,
} from "../../../../model/index.js";
import { IDefaultDashboardStackWidgetProps } from "./types.js";
import { widgetRef } from "@gooddata/sdk-model";
import { ConfigurationBubble } from "../../common/index.js";

/**
 * @internal
 */
export const EditableDashboardStackWidget: React.FC<IDefaultDashboardStackWidgetProps> = ({
    widget,
    screen,
    dashboardItemClasses,
}) => {
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
                visualizationClassName="gd-stack-widget-wrapper"
            >
                {() => <ConfigurationBubble>Tete</ConfigurationBubble>}
            </DashboardItemBase>
        </DashboardItem>
    );
};
