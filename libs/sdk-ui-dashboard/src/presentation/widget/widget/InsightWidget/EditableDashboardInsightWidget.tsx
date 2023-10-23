// (C) 2020-2022 GoodData Corporation
import React, { useCallback, useEffect, useMemo } from "react";
import cx from "classnames";
import { IdentifierRef, IInsight, insightVisualizationType, widgetRef } from "@gooddata/sdk-model";
import { VisType } from "@gooddata/sdk-ui";

import {
    DashboardItem,
    DashboardItemVisualization,
    getVisTypeCssClass,
} from "../../../presentationComponents/index.js";
import { DashboardInsight } from "../../insight/index.js";
import { useDashboardComponentsContext } from "../../../dashboardContexts/index.js";
import {
    changeInsightWidgetDescription,
    selectIsDashboardSaving,
    useDashboardDispatch,
    useDashboardSelector,
    useWidgetSelection,
} from "../../../../model/index.js";
import { useEditableInsightMenu } from "./useEditableInsightMenu.js";
import { IDefaultDashboardInsightWidgetProps } from "./types.js";
import { DashboardWidgetInsightGuard } from "./DashboardWidgetInsightGuard.js";
import { EditableDashboardInsightWidgetHeader } from "./EditableDashboardInsightWidgetHeader.js";
import { useToastMessage } from "@gooddata/sdk-ui-kit";
import { messages } from "../../../../locales.js";

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
    const visType = insightVisualizationType(insight) as VisType;

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

    const dashboardDispatch = useDashboardDispatch();
    const { addSuccess } = useToastMessage();
    const applyWidgetDescription = useCallback(
        (e: { detail: { insightId: string; description: string } }) => {
            const { insightId, description } = e.detail;
            // Ensure given widget is the one we want
            if ((widget.insight as IdentifierRef).identifier === insightId) {
                dashboardDispatch(changeInsightWidgetDescription(widgetRef(widget), { description }));
                document.dispatchEvent(new CustomEvent("gdc-llm-chat-clear"));
                document.dispatchEvent(new CustomEvent("gdc-llm-chat-close"));
                addSuccess(messages.widgetDescriptionApplied);
            }
        },
        [addSuccess],
    );
    useEffect(() => {
        document.addEventListener("gdc-llm-chat-apply-insight-description", applyWidgetDescription);

        return () => {
            document.removeEventListener("gdc-llm-chat-apply-insight-description", applyWidgetDescription);
        };
    }, []);

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
