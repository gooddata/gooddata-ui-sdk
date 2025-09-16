// (C) 2021-2025 GoodData Corporation

import { CSSProperties, ReactNode } from "react";

import { ItemsWrapper } from "@gooddata/sdk-ui-kit";

interface IDashboardInsightMenuContainerProps {
    children: ReactNode;
}

const itemsWrapperStyle: CSSProperties = { width: "100%" };

export function DashboardInsightMenuContainer(props: IDashboardInsightMenuContainerProps) {
    return (
        <div className="insight-configuration">
            <ItemsWrapper smallItemsSpacing style={itemsWrapperStyle}>
                {props.children}
            </ItemsWrapper>
        </div>
    );
}
