// (C) 2021-2022 GoodData Corporation
import React from "react";
import { IInsight, IInsightWidget } from "@gooddata/sdk-model";
import { Button, ItemsWrapper } from "@gooddata/sdk-ui-kit";

import { DashboardInsightMenuTitle } from "../../DashboardInsightMenuTitle.js";
import { RenderMode } from "../../../../../types.js";

interface IDashboardInsightMenuContainerProps {
    children: React.ReactNode;
    widget: IInsightWidget;
    insight: IInsight;
    onClose: () => void;
    renderMode: RenderMode;
}

const itemsWrapperStyle: React.CSSProperties = { width: "100%" };

export const DashboardInsightMenuContainer: React.FC<IDashboardInsightMenuContainerProps> = (props) => {
    return (
        <div className="insight-configuration">
            <div className="insight-configuration-panel-header">
                <DashboardInsightMenuTitle
                    widget={props.widget}
                    insight={props.insight}
                    renderMode={props.renderMode}
                />
                <Button
                    className="gd-button-link gd-button-icon-only gd-icon-cross configuration-panel-header-close-button s-configuration-panel-header-close-button"
                    onClick={props.onClose}
                />
            </div>
            <ItemsWrapper smallItemsSpacing style={itemsWrapperStyle}>
                {props.children}
            </ItemsWrapper>
        </div>
    );
};
