// (C) 2020-2024 GoodData Corporation
import React from "react";
import cx from "classnames";

import { DashboardItem, DashboardItemBase } from "../../../presentationComponents/index.js";
import {
    selectIsDashboardSaving,
    useDashboardSelector,
    useWidgetSelection,
} from "../../../../model/index.js";
import { IDefaultDashboardRichTextWidgetProps } from "./types.js";
import { widgetRef } from "@gooddata/sdk-model";
import { DashboardRichText } from "../../richText/DashboardRichText.js";

/**
 * @internal
 */
export const EditableDashboardRichTextWidget: React.FC<IDefaultDashboardRichTextWidgetProps> = ({
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
                visualizationClassName="gd-rich-text-wrapper"
            >
                {({ clientWidth, clientHeight }) => (
                    <DashboardRichText
                        widget={widget}
                        clientWidth={clientWidth}
                        clientHeight={clientHeight}
                    />
                )}
            </DashboardItemBase>
        </DashboardItem>
    );
};
