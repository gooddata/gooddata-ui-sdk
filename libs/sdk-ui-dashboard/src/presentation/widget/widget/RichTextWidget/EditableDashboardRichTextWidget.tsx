// (C) 2020-2026 GoodData Corporation

import cx from "classnames";

import { widgetRef } from "@gooddata/sdk-model";

import { type IDefaultDashboardRichTextWidgetProps } from "./types.js";
import { useDashboardSelector } from "../../../../model/react/DashboardStoreProvider.js";
import { useWidgetSelection } from "../../../../model/react/useWidgetSelection.js";
import { selectIsDashboardSaving } from "../../../../model/store/saving/savingSelectors.js";
import { useIsDraggingWidget } from "../../../dragAndDrop/draggableWidget/useIsDraggingWidget.js";
import { DashboardItem } from "../../../presentationComponents/DashboardItems/DashboardItem.js";
import { DashboardItemBase } from "../../../presentationComponents/DashboardItems/DashboardItemBase.js";
import { DashboardRichText } from "../../richText/DashboardRichText.js";
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
