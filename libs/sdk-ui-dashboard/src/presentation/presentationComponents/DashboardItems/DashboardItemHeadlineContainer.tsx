// (C) 2020-2026 GoodData Corporation

import { type CSSProperties, type FC, type ReactNode, memo } from "react";

import { type CommonExportDataAttributes } from "../../export/types.js";

interface IDashboardItemHeadlineContainerProps {
    children: ReactNode;
    titleId?: string;
    clientHeight?: number;
    exportData?: CommonExportDataAttributes;
}

const SMALLEST_WIDGET_HEIGHT = 120;
const SMALL_WIDGET_HEIGHT = 140;
const SMALL_HEIGHT = 38;
const SMALL_LINE_HEIGHT = 36;

const INNER_STYLE_SMALL: CSSProperties = { fontSize: "15px" };

const CUSTOM_MARGIN_STYLE: CSSProperties = { marginTop: 0 };

const CUSTOM_OUTER_STYLE: CSSProperties = {
    height: `${SMALL_HEIGHT}px`,
    lineHeight: `${SMALL_LINE_HEIGHT}px`,
};

const CUSTOM_OUTER_STYLE_WITH_CUSTOM_MARGIN = { ...CUSTOM_OUTER_STYLE, CUSTOM_MARGIN_STYLE };

function isSmallCustomHeight(clientHeight: number | undefined): boolean {
    return clientHeight === undefined ? false : clientHeight < SMALLEST_WIDGET_HEIGHT;
}

// compose the styles "statically" so that the result's referential equality is retained where possible
function getOuterStyle(hasCustomMargin: boolean, isCustomHeightSmall: boolean): CSSProperties | undefined {
    if (isCustomHeightSmall) {
        return hasCustomMargin ? CUSTOM_OUTER_STYLE_WITH_CUSTOM_MARGIN : CUSTOM_OUTER_STYLE;
    }

    if (hasCustomMargin) {
        return CUSTOM_MARGIN_STYLE;
    }

    return undefined;
}

// inner utility component for better caching: caches according to two booleans, not a clientHeight number
const DashboardItemHeadlineContainerInner: FC<{
    hasCustomMargin: boolean;
    isCustomHeightSmall: boolean;
    titleId?: string;
    exportData?: CommonExportDataAttributes;
    children?: ReactNode;
}> = memo(function DashboardItemHeadlineContainerInner({
    hasCustomMargin,
    isCustomHeightSmall,
    titleId,
    exportData,
    children,
}) {
    return (
        <div
            className={"item-headline-outer"}
            style={getOuterStyle(hasCustomMargin, isCustomHeightSmall)}
            {...exportData}
        >
            <div
                id={titleId}
                className="item-headline"
                style={isCustomHeightSmall ? INNER_STYLE_SMALL : undefined}
            >
                {children}
            </div>
        </div>
    );
});

export function DashboardItemHeadlineContainer({
    children,
    titleId,
    clientHeight,
    exportData,
}: IDashboardItemHeadlineContainerProps) {
    return (
        <DashboardItemHeadlineContainerInner
            hasCustomMargin={clientHeight === undefined ? false : clientHeight <= SMALL_WIDGET_HEIGHT}
            isCustomHeightSmall={isSmallCustomHeight(clientHeight)}
            exportData={exportData}
            titleId={titleId}
        >
            {children}
        </DashboardItemHeadlineContainerInner>
    );
}
