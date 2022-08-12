// (C) 2022 GoodData Corporation
import React from "react";
import { DeleteDropZone } from "../../dragAndDrop";
import { useWidgetSelection } from "../../../model";
import { CreationPanel } from "./CreationPanel";

/**
 * @internal
 */
export const SidebarConfigurationPanel = (): JSX.Element => {
    const { deselectWidgets } = useWidgetSelection();
    return (
        <div className="col gd-flex-item gd-sidebar-container" onClick={deselectWidgets}>
            <div className="flex-panel-full-vh-height">
                <CreationPanel isSticky={false} />
            </div>
            <DeleteDropZone />
        </div>
    );
};
