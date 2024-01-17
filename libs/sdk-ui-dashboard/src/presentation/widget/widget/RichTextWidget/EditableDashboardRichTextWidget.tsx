// (C) 2020-2024 GoodData Corporation
import React, { useEffect, useState } from "react";
import cx from "classnames";
// import { IInsight } from "@gooddata/sdk-model";
// import { VisType } from "@gooddata/sdk-ui";

import {
    DashboardItem,
    // DashboardItemVisualization,
    // getVisTypeCssClass,
} from "../../../presentationComponents/index.js";
// import { DashboardInsight } from "../../insight/index.js";
// import { useDashboardComponentsContext } from "../../../dashboardContexts/index.js";
import {
    selectIsDashboardSaving,
    useDashboardSelector,
    //     selectIsDashboardSaving,
    //     useDashboardSelector,
    useWidgetSelection,
} from "../../../../model/index.js";
// import { useEditableInsightMenu } from "./useEditableInsightMenu.js";
import { IDefaultDashboardRichTextWidgetProps } from "./types.js";
import { widgetRef } from "@gooddata/sdk-model";
import { RichText } from "./RichText.js";
import { DashboardItemBase } from "../../../presentationComponents/DashboardItems/DashboardItemBase.js";
// import { EditableDashboardRichTextWidgetHeader } from "./EditableDashboardRichTextWidgetHeader.js";

export const EditableDashboardRichTextWidget: React.FC<IDefaultDashboardRichTextWidgetProps> = (props) => {
    return <EditableDashboardRichTextWidgetCore {...props} />;
};

/**
 * @internal
 */
const EditableDashboardRichTextWidgetCore: React.FC<IDefaultDashboardRichTextWidgetProps> = ({
    widget,
    screen,
    // onError, onLoadingChanged,
    dashboardItemClasses,
}) => {
    // const visType = insightVisualizationType(insight) as VisType;

    const {
        isSelectable,
        isSelected,
        onSelected,
        //closeConfigPanel, hasConfigPanelOpen
    } = useWidgetSelection(widgetRef(widget));

    // const { menuItems } = useEditableInsightMenu({ closeMenu: closeConfigPanel, insight, widget });

    // const { InsightMenuComponentProvider, ErrorComponent, LoadingComponent } =
    //     useDashboardComponentsContext();

    // const InsightMenuComponent = useMemo(
    //     () => InsightMenuComponentProvider(insight, widget),
    //     [InsightMenuComponentProvider, insight, widget],
    // );

    const isSaving = useDashboardSelector(selectIsDashboardSaving);
    const isEditable = !isSaving;

    const [isRichTextEditing, setIsRichTextEditing] = useState(true);
    const [richText, setRichText] = useState<string>("");

    useEffect(() => {
        onSelected();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        isSelected ? setIsRichTextEditing(true) : setIsRichTextEditing(false);
    }, [isSelected]);

    return (
        <DashboardItem
            className={cx(
                dashboardItemClasses,
                "type-visualization",
                "gd-dashboard-view-widget",
                "is-edit-mode",
                // getVisTypeCssClass(widget.type, visType),
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
                {() => <RichText text={richText} onChange={setRichText} editMode={isRichTextEditing} />}
            </DashboardItemBase>
            {/* <DashboardItemVisualization
                isSelectable={isSelectable}
                isSelected={isSelected}
                onSelected={onSelected}
                renderHeadline={(clientHeight) =>
                    !widget.configuration?.hideTitle && (
                        <EditableDashboardRichTextWidgetHeader
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
            </DashboardItemVisualization> */}
        </DashboardItem>
    );
};
