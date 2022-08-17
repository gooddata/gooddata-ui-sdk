// (C) 2020-2022 GoodData Corporation
import React, { useMemo } from "react";
import cx from "classnames";
import { IInsight, insightVisualizationUrl, widgetRef } from "@gooddata/sdk-model";
import { VisType } from "@gooddata/sdk-ui";

import {
    DashboardItem,
    DashboardItemHeadline,
    DashboardItemVisualization,
    getVisTypeCssClass,
} from "../../../presentationComponents";
import { DashboardInsight } from "../../insight";
import { useDashboardComponentsContext } from "../../../dashboardContexts";
import { selectIsDashboardSaving, useDashboardSelector, useWidgetSelection } from "../../../../model";
import { useEditableInsightMenu } from "./useEditableInsightMenu";
import { IDefaultDashboardInsightWidgetProps } from "./types";
import { DashboardWidgetInsightGuard } from "./DashboardWidgetInsightGuard";

export const EditableDashboardInsightWidget: React.FC<
    Omit<IDefaultDashboardInsightWidgetProps, "insight">
> = (props) => {
    return <DashboardWidgetInsightGuard {...props} Component={EditableDashboardInsightWidgetCore} />;
};

/**
 * @internal
 */
const EditableDashboardInsightWidgetCore: React.FC<
    IDefaultDashboardInsightWidgetProps & { insight: IInsight }
> = ({ widget, insight, screen, onError, onExportReady, onLoadingChanged, dashboardItemClasses }) => {
    const visType = insightVisualizationUrl(insight).split(":")[1] as VisType;

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
                        <DashboardItemHeadline title={widget.title} clientHeight={clientHeight} />
                    )
                }
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
                contentClassName={cx({ "is-editable": isEditable })}
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
