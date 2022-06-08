// (C) 2022 GoodData Corporation
import React from "react";
import { DeleteDropZone } from "../../dragAndDrop";
import { CreationPanel } from "./CreationPanel";

export const SidebarConfigurationPanel = (): JSX.Element => {
    return (
        <div className="col gd-flex-item gd-sidebar-container">
            <div className="flex-panel-full-vh-height">
                <CreationPanel isSticky={false} />
            </div>
            <DeleteDropZone />
        </div>
    );
};
