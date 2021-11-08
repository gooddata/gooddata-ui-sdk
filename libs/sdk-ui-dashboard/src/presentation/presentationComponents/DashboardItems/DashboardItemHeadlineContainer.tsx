// (C) 2020 GoodData Corporation
import React, { useMemo } from "react";

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
    clientHeight,
}) => {
    const isSmallCustomHeight = clientHeight !== undefined ? clientHeight < SMALLEST_WIDGET_HEIGHT : false;

    const outerStyle = useMemo(() => {
        const hasCustomMargin = clientHeight !== undefined ? clientHeight <= SMALL_WIDGET_HEIGHT : false;
        const customMargin = hasCustomMargin ? { marginTop: 0 } : undefined;

        const customStyle = isSmallCustomHeight
            ? { height: `${SMALL_HEIGHT}px`, lineHeight: `${SMALL_LINE_HEIGHT}px` }
            : undefined;

        return { ...customStyle, ...customMargin };
    }, [isSmallCustomHeight, clientHeight]);

    const innerStyle = useMemo(() => {
        return isSmallCustomHeight ? { fontSize: "15px" } : undefined;
    }, [isSmallCustomHeight]);

    return (
        <div className={"item-headline-outer"} style={outerStyle}>
            <div className="item-headline" style={innerStyle}>
                {children}
            </div>
        </div>
    );
};
