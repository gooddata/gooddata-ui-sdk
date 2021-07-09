// (C) 2020 GoodData Corporation
import React from "react";

interface IDashboardItemHeadlineContainerProps {
    children: React.ReactNode;
    clientHeight?: number;
}

const SMALLEST_WIDGET_HEIGHT = 120;
const SMALL_WIDGET_HEIGHT = 140;
const SMALL_HEIGHT = 38;
const SMALL_LINE_HEIGHT = 36;

export const DashboardItemHeadlineContainer: React.FC<IDashboardItemHeadlineContainerProps> = ({
    children,
    clientHeight = 0,
}) => {
    const isSmallCustomHeight = () => clientHeight < SMALLEST_WIDGET_HEIGHT;
    const customMargin = clientHeight <= SMALL_WIDGET_HEIGHT ? { marginTop: 0 } : undefined;

    const customStyle = isSmallCustomHeight()
        ? { height: `${SMALL_HEIGHT}px`, lineHeight: `${SMALL_LINE_HEIGHT}px` }
        : undefined;

    return (
        <div className={"item-headline-outer"} style={{ ...customStyle, ...customMargin }}>
            <div className="item-headline" style={isSmallCustomHeight() ? { fontSize: "15px" } : undefined}>
                {children}
            </div>
        </div>
    );
};
