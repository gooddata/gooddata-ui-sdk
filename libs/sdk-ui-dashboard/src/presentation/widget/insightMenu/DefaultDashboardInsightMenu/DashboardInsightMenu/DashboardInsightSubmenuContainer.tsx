// (C) 2021-2022 GoodData Corporation
import React from "react";
import { Button } from "@gooddata/sdk-ui-kit";

import { DashboardInsightSubmenuHeader } from "./DashboardInsightSubmenuHeader.js";

interface IDashboardInsightSubmenuContainerProps {
    children: React.ReactNode;
    title: string;
    onClose: () => void;
    onBack: () => void;
}

const screenWrapperStyle: React.CSSProperties = { width: "100%" };

export const DashboardInsightSubmenuContainer: React.FC<IDashboardInsightSubmenuContainerProps> = (props) => {
    return (
        <div className="configuration-panel">
            <div className="configuration-panel-header">
                <DashboardInsightSubmenuHeader title={props.title} onHeaderClick={props.onBack} />
                <Button
                    className="gd-button-link gd-button-icon-only gd-icon-cross configuration-panel-header-close-button s-configuration-panel-header-close-button"
                    onClick={props.onClose}
                />
            </div>
            <div className="configuration-panel-screen" style={screenWrapperStyle}>
                {props.children}
            </div>
        </div>
    );
};
