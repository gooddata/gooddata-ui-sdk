// (C) 2020-2025 GoodData Corporation
import React, { useMemo, useRef } from "react";
import LinesEllipsis from "react-lines-ellipsis";
import responsiveHOC from "react-lines-ellipsis/lib/responsiveHOC.js";

const ResponsiveEllipsis = responsiveHOC()(LinesEllipsis);

import { DashboardItemHeadlineContainer } from "./DashboardItemHeadlineContainer.js";
import { CommonExportDataAttributes } from "../../export/index.js";

interface IDashboardItemHeadlineProps {
    title: string;
    titleId?: string;
    clientHeight?: number;
    exportData?: CommonExportDataAttributes;
}

export const DashboardItemHeadline: React.FC<IDashboardItemHeadlineProps> = ({
    title,
    titleId,
    clientHeight,
    exportData,
}) => {
    // actually reference to instance of LinesEllipsis component, but lib has wrong typings
    const elementRef = useRef<HTMLDivElement>(null);

    /**
     * Component LinesEllipsis is not working properly with css-grid. It uses internally getComputedStyle on measured element,
     * but it does it only once on init and it is before the element is placed and sized by the grid.
     * Manual measurement of the element is needed to get the correct width
     * and to force LinesEllipsis to re-init with the correct width.
     */

    //...target is internal reference to the div created by LinesEllipsis
    // it is not exposed in the typings, so we need to use the type any
    const target: HTMLDivElement = (elementRef.current as any)?.target;
    let elementWidth: number | undefined = undefined;
    if (target) {
        elementWidth = target.getBoundingClientRect?.().width;
    }
    // memoize the Truncate render as it is quite expensive
    const truncatedTitlePart = useMemo(() => {
        return (
            <ResponsiveEllipsis
                key={elementWidth}
                maxLine={2}
                ellipsis="..."
                className="item-headline-inner s-headline"
                text={title}
                innerRef={elementRef}
            />
        );
    }, [title, elementWidth]);

    return (
        <DashboardItemHeadlineContainer clientHeight={clientHeight} exportData={exportData} titleId={titleId}>
            {truncatedTitlePart}
        </DashboardItemHeadlineContainer>
    );
};
