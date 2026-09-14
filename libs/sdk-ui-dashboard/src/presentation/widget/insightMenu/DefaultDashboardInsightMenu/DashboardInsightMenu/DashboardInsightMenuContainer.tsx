// (C) 2021-2026 GoodData Corporation

import { type CSSProperties, type ReactNode } from "react";

import { ItemsWrapper } from "@gooddata/sdk-ui-kit";

interface IDashboardInsightMenuContainerProps {
    children: ReactNode;
    ariaLabelledBy?: string;

    /** Name for a menu that has no title to point at, which is how a restricted widget's menu is named. */
    ariaLabel?: string;
}

const itemsWrapperStyle: CSSProperties = { width: "100%" };

export function DashboardInsightMenuContainer(props: IDashboardInsightMenuContainerProps) {
    return (
        <div
            className="insight-configuration"
            role="dialog"
            aria-labelledby={props.ariaLabelledBy}
            aria-label={props.ariaLabel}
        >
            <ItemsWrapper smallItemsSpacing style={itemsWrapperStyle}>
                {props.children}
            </ItemsWrapper>
        </div>
    );
}
