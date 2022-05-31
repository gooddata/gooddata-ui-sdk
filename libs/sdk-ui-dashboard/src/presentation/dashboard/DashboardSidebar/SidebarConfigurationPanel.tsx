// (C) 2022 GoodData Corporation
import React from "react";
import { DeleteDropZone } from "../../dragAndDrop";

export const SidebarConfigurationPanel = (): JSX.Element => {
    return (
        <div className="col gd-flex-item gd-sidebar-container">
            <div className="configuration-panel">
                <div className="flex-panel-full-vh-height"></div>
            </div>
            <DeleteDropZone />
        </div>
    );
};
