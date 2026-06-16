// (C) 2020-2026 GoodData Corporation

import { useMemo } from "react";

import cx from "classnames";

import { type IInsight, insightVisualizationType, widgetRef } from "@gooddata/sdk-model";
import { type VisType } from "@gooddata/sdk-ui";

import { useDashboardSelector } from "../../../../model/react/DashboardStoreProvider.js";
import { useWidgetSelection } from "../../../../model/react/useWidgetSelection.js";
import { selectIsDashboardSaving } from "../../../../model/store/saving/savingSelectors.js";
import { useDashboardComponentsContext } from "../../../dashboardContexts/DashboardComponentsContext.js";
import { useIsDraggingWidget } from "../../../dragAndDrop/draggableWidget/useIsDraggingWidget.js";
import { DashboardItem } from "../../../presentationComponents/DashboardItems/DashboardItem.js";
import { DashboardItemVisualization } from "../../../presentationComponents/DashboardItems/DashboardItemVisualization.js";
import { getVisTypeCssClass } from "../../../presentationComponents/DashboardItems/utils.js";
import { DashboardInsight } from "../../insight/DashboardInsight.js";
import { InsightWidgetWarningPartialResult } from "../warningPartialResult/InsightWidgetWarningPartialResult.js";

import { DashboardWidgetInsightGuard } from "./DashboardWidgetInsightGuard.js";
import { EditableDashboardInsightWidgetHeader } from "./EditableDashboardInsightWidgetHeader.js";
import { type IDefaultDashboardInsightWidgetProps } from "./types.js";
import { useEditableInsightMenu } from "./useEditableInsightMenu.js";
import { useInsightWarning } from "./useInsightWarning.js";

export function EditableDashboardInsightWidget(props: Omit<IDefaultDashboardInsightWidgetProps, "insight">) {
    return <DashboardWidgetInsightGuard {...props} Component={EditableDashboardInsightWidgetCore} />;
}

/**
 * @internal
 */
function EditableDashboardInsightWidgetCore({
    widget,
    insight,
    screen,
    onError,
    onExportReady,
    onLoadingChanged,
    dashboardItemClasses,
}: IDefaultDashboardInsightWidgetProps & { insight?: IInsight }) {
    const visType = insight ? (insightVisualizationType(insight) as VisType) : undefined;
    const ref = widgetRef(widget);

    const { isSelectable, isSelected, onSelected, closeConfigPanel, hasConfigPanelOpen } =
        useWidgetSelection(ref);

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

    const { limitBreaks, executionResult } = useInsightWarning(ref);

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
                renderAfterVisualization={() => {
                    if (limitBreaks.length > 0 && executionResult) {
                        return (
                            <InsightWidgetWarningPartialResult
                                className="gd-warning-partial-result"
                                limitBreaks={limitBreaks}
                                isEditMode
                                executionResult={executionResult}
                                isLoading={executionResult.isLoading}
                            />
                        );
                    }

                    return null;
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
}
