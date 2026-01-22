// (C) 2020-2026 GoodData Corporation

import { useMemo, useRef } from "react";

import OriginalLinesEllipsis from "react-lines-ellipsis";
import responsiveHOC from "react-lines-ellipsis/lib/responsiveHOC.js";

import { DashboardItemHeadlineContainer } from "./DashboardItemHeadlineContainer.js";
import { type CommonExportDataAttributes } from "../../export/types.js";

// This fixes the infinite render loop with 0.15.x version,
// we cannot upgrade to 0.16.0 which has solved the infinite loop
// as it has yet another error, see https://github.com/xiaody/react-lines-ellipsis/issues/140
class LinesEllipsis extends OriginalLinesEllipsis {
    override componentDidUpdate(
        prevProps: Record<string, unknown>,
        prevState: Record<string, unknown>,
        shapshot: unknown,
    ) {
        if (JSON.stringify(prevProps) === JSON.stringify(this.props)) {
            prevProps = this.props;
        }

        super.componentDidUpdate?.(prevProps, prevState, shapshot);
    }
}
const ResponsiveEllipsis = responsiveHOC()(LinesEllipsis);

interface IDashboardItemHeadlineProps {
    title: string;
    titleId?: string;
    clientHeight?: number;
    exportData?: CommonExportDataAttributes;
}

export function DashboardItemHeadline({
    title,
    titleId,
    clientHeight,
    exportData,
}: IDashboardItemHeadlineProps) {
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
                component={"h3"}
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
}
