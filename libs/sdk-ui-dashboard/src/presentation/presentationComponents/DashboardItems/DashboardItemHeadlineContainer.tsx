// (C) 2020-2026 GoodData Corporation

import { type FC, type ReactNode, memo } from "react";

import cx from "classnames";

import { type CommonExportDataAttributes } from "../../export/types.js";

interface IDashboardItemHeadlineContainerProps {
    children: ReactNode;
    titleId?: string;
    clientHeight?: number;
    exportData?: CommonExportDataAttributes;
}

export const SMALLEST_WIDGET_HEIGHT = 120;
export const SMALL_WIDGET_HEIGHT = 140;

function isSmallCustomHeight(clientHeight: number | undefined): boolean {
    return clientHeight === undefined ? false : clientHeight < SMALLEST_WIDGET_HEIGHT;
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
            className={cx("item-headline-outer", {
                "item-headline-outer--small": isCustomHeightSmall,
                "item-headline-outer--no-top-margin": hasCustomMargin && !isCustomHeightSmall,
            })}
            {...exportData}
        >
            <div id={titleId} className="item-headline">
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
