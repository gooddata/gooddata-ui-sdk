// (C) 2021 GoodData Corporation
import React from "react";
import { IInsightWidget, widgetTitle } from "@gooddata/sdk-backend-spi";
import { Button, ItemsWrapper } from "@gooddata/sdk-ui-kit";

import { DashboardInsightMenuHeader } from "./DashboardInsightMenuHeader";

interface IDashboardInsightMenuContainerProps {
    children: React.ReactNode;
    widget: IInsightWidget;
    onClose: () => void;
}

const itemsWrapperStyle: React.CSSProperties = { width: "100%" };

export const DashboardInsightMenuContainer: React.FC<IDashboardInsightMenuContainerProps> = (props) => {
    return (
        <div className="insight-configuration">
            <div className="insight-configuration-panel-header">
                <DashboardInsightMenuHeader widget={props.widget} title={widgetTitle(props.widget)} />
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
