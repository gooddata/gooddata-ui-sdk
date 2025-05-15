// (C) 2021-2025 GoodData Corporation
import React from "react";
import { IInsight, IInsightWidget } from "@gooddata/sdk-model";
import { ItemsWrapper } from "@gooddata/sdk-ui-kit";

import { RenderMode } from "../../../../../types.js";

interface IDashboardInsightMenuContainerProps {
    children: React.ReactNode;
    widget: IInsightWidget;
    insight?: IInsight;
    onClose: () => void;
    renderMode: RenderMode;
    titleId: string;
    isSubmenu: boolean;
}

const itemsWrapperStyle: React.CSSProperties = { width: "100%" };

export const DashboardInsightMenuContainer: React.FC<IDashboardInsightMenuContainerProps> = (props) => {
    return (
        <div className="insight-configuration">
            <ItemsWrapper smallItemsSpacing style={itemsWrapperStyle}>
                {props.children}
            </ItemsWrapper>
        </div>
    );
};
