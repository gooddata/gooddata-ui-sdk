// (C) 2022 GoodData Corporation
import React from "react";
import { useWidgetSelection } from "../../../model/index.js";
import { CreationPanel } from "./CreationPanel.js";
import { ISidebarProps } from "./types.js";

/**
 * @internal
 */
export const SidebarConfigurationPanel: React.FC<Omit<ISidebarProps, "DefaultSidebar">> = (
    props,
): JSX.Element => {
    const {
        configurationPanelClassName,
        WrapCreatePanelItemWithDragComponent,
        WrapInsightListItemWithDragComponent,
        KpiWidgetComponentSet,
        AttributeFilterComponentSet,
        InsightWidgetComponentSet,
    } = props;
    const { deselectWidgets } = useWidgetSelection();
    const DeleteDropZoneComponent = props.DeleteDropZoneComponent!;

    return (
        <div className="col gd-flex-item gd-sidebar-container" onClick={deselectWidgets}>
            <div className="flex-panel-full-height">
                <CreationPanel
                    className={configurationPanelClassName}
                    WrapCreatePanelItemWithDragComponent={WrapCreatePanelItemWithDragComponent}
                    WrapInsightListItemWithDragComponent={WrapInsightListItemWithDragComponent}
                    KpiWidgetComponentSet={KpiWidgetComponentSet}
                    AttributeFilterComponentSet={AttributeFilterComponentSet}
                    InsightWidgetComponentSet={InsightWidgetComponentSet}
                />
            </div>
            <DeleteDropZoneComponent />
        </div>
    );
};
