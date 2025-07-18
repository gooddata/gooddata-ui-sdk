// (C) 2021-2025 GoodData Corporation
import { Typography } from "@gooddata/sdk-ui-kit";
import { IDashboardInsightMenuTitleProps } from "../types.js";
import { insightTitle, widgetTitle } from "@gooddata/sdk-model";

function OriginalInsightTitle({ title }: { title: string }) {
    return (
        <Typography tagName="p" className="insight-title s-insight-title ">
            <span className="original-insight-title">{title}</span>
        </Typography>
    );
}

/**
 * @internal
 */
export function DefaultDashboardInsightMenuTitle({
    widget,
    insight,
    renderMode,
    titleId,
}: IDashboardInsightMenuTitleProps) {
    const title = widgetTitle(widget);
    const originalTitle = insight ? insightTitle(insight) : title;

    const titlesDiffer = title !== originalTitle;

    const renderedTitle = title ? (
        <span className="insight-title s-insight-title s-insight-title-simple">{widget.title}</span>
    ) : null;

    return (
        <div id={titleId} className="insight-menu-title-wrapper">
            <Typography tagName="h3" className="widget-title s-widget-title">
                {renderedTitle}
            </Typography>
            {renderMode === "edit" && titlesDiffer ? <OriginalInsightTitle title={originalTitle} /> : null}
        </div>
    );
}
