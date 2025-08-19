// (C) 2020-2025 GoodData Corporation
import React, { useMemo } from "react";

import cx from "classnames";

import { IInsight, insightVisualizationType, widgetRef } from "@gooddata/sdk-model";
import { VisType } from "@gooddata/sdk-ui";

import { DashboardWidgetInsightGuard } from "./DashboardWidgetInsightGuard.js";
import { EditableDashboardInsightWidgetHeader } from "./EditableDashboardInsightWidgetHeader.js";
import { IDefaultDashboardInsightWidgetProps } from "./types.js";
import { useEditableInsightMenu } from "./useEditableInsightMenu.js";
import {
    selectIsDashboardSaving,
    useDashboardSelector,
    useWidgetSelection,
} from "../../../../model/index.js";
import { useDashboardComponentsContext } from "../../../dashboardContexts/index.js";
import { useIsDraggingWidget } from "../../../dragAndDrop/index.js";
import {
    DashboardItem,
    DashboardItemVisualization,
    getVisTypeCssClass,
} from "../../../presentationComponents/index.js";
import { DashboardInsight } from "../../insight/index.js";

export const EditableDashboardInsightWidget: React.FC<
    Omit<IDefaultDashboardInsightWidgetProps, "insight">
> = (props) => {
    return <DashboardWidgetInsightGuard {...props} Component={EditableDashboardInsightWidgetCore} />;
};

/**
 * @internal
 */
const EditableDashboardInsightWidgetCore: React.FC<
    IDefaultDashboardInsightWidgetProps & { insight?: IInsight }
> = ({ widget, insight, screen, onError, onExportReady, onLoadingChanged, dashboardItemClasses }) => {
    const visType = insight ? (insightVisualizationType(insight) as VisType) : undefined;

    const { isSelectable, isSelected, onSelected, closeConfigPanel, hasConfigPanelOpen } = useWidgetSelection(
        widgetRef(widget),
    );

    const { menuItems } = useEditableInsightMenu({ closeMenu: closeConfigPanel, insight, widget });

    const { InsightMenuComponentProvider, ErrorComponent, LoadingComponent } =
        useDashboardComponentsContext();

    const InsightMenuComponent = useMemo(
        () => InsightMenuComponentProvider(insight, widget),
        [InsightMenuComponentProvider, insight, widget],
    );

    const isSaving = useDashboardSelector(selectIsDashboardSaving);
    const isEditable = !isSaving;
    const isDraggingWidget = useIsDraggingWidget();

    return (
        <DashboardItem
            className={cx(
                dashboardItemClasses,
                "type-visualization",
                "gd-dashboard-view-widget",
                "is-edit-mode",
                getVisTypeCssClass(widget.type, visType),
                { "is-selected": isSelected },
            )}
            screen={screen}
        >
            <DashboardItemVisualization
                isSelectable={isSelectable}
                isSelected={isSelected}
                onSelected={onSelected}
                renderHeadline={(clientHeight) =>
                    !widget.configuration?.hideTitle && (
                        <EditableDashboardInsightWidgetHeader
                            clientHeight={clientHeight}
                            widget={widget}
                            insight={insight}
                        />
                    )
                }
                renderAfterContent={() => {
                    return (
                        <>
                            {!!hasConfigPanelOpen && (
                                <InsightMenuComponent
                                    insight={insight}
                                    widget={widget}
                                    isOpen={hasConfigPanelOpen}
                                    onClose={closeConfigPanel}
                                    items={menuItems}
                                />
                            )}
                        </>
                    );
                }}
                contentClassName={cx({ "is-editable": isEditable, "is-dragging-widget": isDraggingWidget })}
                visualizationClassName={cx({ "is-editable": isEditable })}
            >
                {({ clientHeight, clientWidth }) => (
                    <DashboardInsight
                        clientHeight={clientHeight}
                        clientWidth={clientWidth}
                        insight={insight}
                        widget={widget}
                        onExportReady={onExportReady}
                        onLoadingChanged={onLoadingChanged}
                        onError={onError}
                        ErrorComponent={ErrorComponent}
                        LoadingComponent={LoadingComponent}
                    />
                )}
            </DashboardItemVisualization>
        </DashboardItem>
    );
};
