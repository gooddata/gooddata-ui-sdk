// (C) 2020 GoodData Corporation
import React from "react";

interface IDashboardItemHeadlineContainerProps {
    children: React.ReactNode;
    clientHeight?: number;
}

const SMALL_WIDGET_HEIGHT = 120;
const SMALL_HEIGHT = 38;
const SMALL_LINE_HEIGHT = 36;

export const DashboardItemHeadlineContainer: React.FC<IDashboardItemHeadlineContainerProps> = ({
    children,
    clientHeight,
}) => {
    const isSmallCustomHeight = () => clientHeight <= SMALL_WIDGET_HEIGHT;

    return (
        <div
            className={"item-headline-outer"}
            style={
                isSmallCustomHeight()
                    ? { height: `${SMALL_HEIGHT}px`, lineHeight: `${SMALL_LINE_HEIGHT}px` }
                    : undefined
            }
        >
            <div className="item-headline" style={isSmallCustomHeight() ? { fontSize: "15px" } : undefined}>
                {children}
            </div>
        </div>
    );
};
