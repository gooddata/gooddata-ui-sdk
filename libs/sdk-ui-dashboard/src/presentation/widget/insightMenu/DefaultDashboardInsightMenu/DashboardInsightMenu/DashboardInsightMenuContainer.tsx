// (C) 2021-2025 GoodData Corporation
import React from "react";

import { ItemsWrapper } from "@gooddata/sdk-ui-kit";

interface IDashboardInsightMenuContainerProps {
    children: React.ReactNode;
}

const itemsWrapperStyle: React.CSSProperties = { width: "100%" };

export function DashboardInsightMenuContainer(props: IDashboardInsightMenuContainerProps) {
    return (
        <div className="insight-configuration">
            <ItemsWrapper smallItemsSpacing style={itemsWrapperStyle}>
                {props.children}
            </ItemsWrapper>
        </div>
    );
}
