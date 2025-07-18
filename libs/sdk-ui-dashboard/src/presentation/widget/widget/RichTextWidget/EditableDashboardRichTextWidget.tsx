// (C) 2020-2025 GoodData Corporation
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
import { useIsDraggingWidget } from "../../../dragAndDrop/index.js";
/**
 * @internal
 */
export function EditableDashboardRichTextWidget({
    widget,
    screen,
    dashboardItemClasses,
}: IDefaultDashboardRichTextWidgetProps) {
    const { isSelectable, isSelected, onSelected } = useWidgetSelection(widgetRef(widget));
    const isSaving = useDashboardSelector(selectIsDashboardSaving);
    const isEditable = !isSaving;
    const isDraggingWidget = useIsDraggingWidget();

    return (
        <DashboardItem
            className={cx(
                dashboardItemClasses,
                "type-rich-text",
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
                contentClassName={cx({ "is-editable": isEditable, "is-dragging-widget": isDraggingWidget })}
                visualizationClassName="gd-rich-text-widget-wrapper"
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
}
