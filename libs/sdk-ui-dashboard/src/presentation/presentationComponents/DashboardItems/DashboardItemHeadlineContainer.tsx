// (C) 2020 GoodData Corporation
import React, { memo } from "react";

interface IDashboardItemHeadlineContainerProps {
    children: React.ReactNode;
    clientHeight?: number;
}

const SMALLEST_WIDGET_HEIGHT = 120;
const SMALL_WIDGET_HEIGHT = 140;
const SMALL_HEIGHT = 38;
const SMALL_LINE_HEIGHT = 36;

const INNER_STYLE_SMALL: React.CSSProperties = { fontSize: "15px" };

const CUSTOM_MARGIN_STYLE: React.CSSProperties = { marginTop: 0 };

const CUSTOM_OUTER_STYLE: React.CSSProperties = {
    height: `${SMALL_HEIGHT}px`,
    lineHeight: `${SMALL_LINE_HEIGHT}px`,
};

const CUSTOM_OUTER_STYLE_WITH_CUSTOM_MARGIN = { ...CUSTOM_OUTER_STYLE, CUSTOM_MARGIN_STYLE };

function isSmallCustomHeight(clientHeight: number | undefined): boolean {
    return clientHeight !== undefined ? clientHeight < SMALLEST_WIDGET_HEIGHT : false;
}

// compose the styles "statically" so that the result's referential equality is retained where possible
function getOuterStyle(
    hasCustomMargin: boolean,
    isCustomHeightSmall: boolean,
): React.CSSProperties | undefined {
    if (isCustomHeightSmall) {
        return hasCustomMargin ? CUSTOM_OUTER_STYLE_WITH_CUSTOM_MARGIN : CUSTOM_OUTER_STYLE;
    }

    if (hasCustomMargin) {
        return CUSTOM_MARGIN_STYLE;
    }

    return undefined;
}

// inner utility component for better caching: caches according to two booleans, not a clientHeight number
const DashboardItemHeadlineContainerInner: React.FC<{
    hasCustomMargin: boolean;
    isCustomHeightSmall: boolean;
    children?: React.ReactNode;
}> = memo(function DashboardItemHeadlineContainerInner({ hasCustomMargin, isCustomHeightSmall, children }) {
    return (
        <div className={"item-headline-outer"} style={getOuterStyle(hasCustomMargin, isCustomHeightSmall)}>
            <div className="item-headline" style={isCustomHeightSmall ? INNER_STYLE_SMALL : undefined}>
                {children}
            </div>
        </div>
    );
});

export const DashboardItemHeadlineContainer: React.FC<IDashboardItemHeadlineContainerProps> = ({
    children,
    clientHeight,
}) => {
    return (
        <DashboardItemHeadlineContainerInner
            hasCustomMargin={clientHeight !== undefined ? clientHeight <= SMALL_WIDGET_HEIGHT : false}
            isCustomHeightSmall={isSmallCustomHeight(clientHeight)}
        >
            {children}
        </DashboardItemHeadlineContainerInner>
    );
};
