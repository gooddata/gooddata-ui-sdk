// (C) 2021-2025 GoodData Corporation
import React from "react";
import { Typography } from "@gooddata/sdk-ui-kit";
import { CustomDashboardInsightMenuTitleComponent } from "../types.js";
import { insightTitle, widgetTitle } from "@gooddata/sdk-model";

const OriginalInsightTitle: React.FC<{ title: string }> = (props) => {
    const { title } = props;
    return (
        <Typography tagName="p" className="insight-title s-insight-title ">
            <span className="original-insight-title">{title}</span>
        </Typography>
    );
};

/**
 * @internal
 */
export const DefaultDashboardInsightMenuTitle: CustomDashboardInsightMenuTitleComponent = (props) => {
    const { widget, insight, renderMode } = props;

    const title = widgetTitle(widget);
    const originalTitle = insight ? insightTitle(insight) : title;

    const titlesDiffer = title !== originalTitle;

    const renderedTitle = title ? (
        <span className="insight-title s-insight-title s-insight-title-simple">{props.widget.title}</span>
    ) : null;

    return (
        <div id={props.titleId} className="insight-menu-title-wrapper">
            <Typography tagName="h3" className="widget-title s-widget-title">
                {renderedTitle}
            </Typography>
            {renderMode === "edit" && titlesDiffer ? <OriginalInsightTitle title={originalTitle} /> : null}
        </div>
    );
};
