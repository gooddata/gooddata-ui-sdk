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
import { DashboardStack } from "../../stack/DashboardStack.js";
import { EditableDashboardInsightWidgetCore } from "../InsightWidget/EditableDashboardInsightWidget.js";

/**
 * @internal
 */
export const EditableDashboardStackWidget: React.FC<IDefaultDashboardStackWidgetProps> = ({
    stack,
    screen,
    dashboardItemClasses,
}) => {
    const { isSelectable, isSelected, onSelected } = useWidgetSelection(widgetRef(stack));
    const isSaving = useDashboardSelector(selectIsDashboardSaving);
    const isEditable = !isSaving;

    return (
        <>
            {stack.widgets && stack.widgets.length > 0 ? (
                <>
                    <DashboardStack stack={stack} />
                    <EditableDashboardInsightWidgetCore
                        screen={screen}
                        dashboardItemClasses={dashboardItemClasses}
                        widget={stack.widgets[0]}
                        insight={stack.insights[0]}
                    />
                </>
            ) : (
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
                        {({ clientWidth, clientHeight }) => (
                            <DashboardStack
                                stack={stack}
                                clientWidth={clientWidth}
                                clientHeight={clientHeight}
                            />
                        )}
                    </DashboardItemBase>
                </DashboardItem>
            )}
        </>
    );
};
