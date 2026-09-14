// (C) 2026 GoodData Corporation

import cx from "classnames";

import { widgetRef } from "@gooddata/sdk-model";

import { useWidgetSelection } from "../../../../model/react/useWidgetSelection.js";
import { useDashboardComponentsContext } from "../../../dashboardContexts/DashboardComponentsContext.js";
import { DashboardItem } from "../../../presentationComponents/DashboardItems/DashboardItem.js";
import { DashboardItemVisualization } from "../../../presentationComponents/DashboardItems/DashboardItemVisualization.js";
import { DashboardInsightEditMenuBubble } from "../../insightMenu/DefaultDashboardInsightMenu/DashboardInsightMenu/DashboardInsightEditMenuBubble.js";
import { DashboardInsightMenuBody } from "../../insightMenu/DefaultDashboardInsightMenu/DashboardInsightMenu/index.js";

import { type IDefaultDashboardInsightWidgetProps } from "./types.js";
import { useEditableInsightMenu } from "./useEditableInsightMenu.js";

/**
 * Stands in for an insight widget the editor is not allowed to see. It keeps the selection and the
 * context menu of an ordinary widget, because the editor may still want the widget gone; the menu is
 * built by the standard builder for a widget with no readable insight, which leaves removal alone.
 *
 * It renders the standard menu body — keyboard handling, focus management and item rendering come
 * with it — with its title suppressed, because the widget title can name the object the editor may
 * not see. It does not go through `InsightMenuComponentProvider`: a replacement menu would have no
 * reason to honour that.
 */
export function EditableRestrictedInsightWidget({
    widget,
    screen,
    dashboardItemClasses,
}: Omit<IDefaultDashboardInsightWidgetProps, "insight">) {
    const { isSelectable, isSelected, onSelected, closeConfigPanel, hasConfigPanelOpen } = useWidgetSelection(
        widgetRef(widget),
    );
    const { RestrictedPlaceholderComponentProvider } = useDashboardComponentsContext();
    const Content = RestrictedPlaceholderComponentProvider(widget);
    const { menuItems } = useEditableInsightMenu({
        closeMenu: closeConfigPanel,
        insight: undefined,
        widget,
    });

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
            <DashboardItemVisualization
                isSelectable={isSelectable}
                isSelected={isSelected}
                onSelected={onSelected}
                renderAfterContent={() =>
                    hasConfigPanelOpen ? (
                        <DashboardInsightEditMenuBubble onClose={closeConfigPanel}>
                            <DashboardInsightMenuBody
                                items={menuItems}
                                widget={widget}
                                isOpen={hasConfigPanelOpen}
                                onClose={closeConfigPanel}
                                renderMode="edit"
                                showTitle={false}
                            />
                        </DashboardInsightEditMenuBubble>
                    ) : null
                }
            >
                {({ clientHeight, clientWidth }) => (
                    <div className="visualization-content">
                        <Content width={clientWidth} height={clientHeight} />
                    </div>
                )}
            </DashboardItemVisualization>
        </DashboardItem>
    );
}
