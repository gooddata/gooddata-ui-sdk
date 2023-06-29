// (C) 2021-2022 GoodData Corporation
import React from "react";
import { Typography } from "@gooddata/sdk-ui-kit";
import { CustomDashboardInsightMenuTitleComponent } from "../types.js";
import { insightTitle, widgetTitle } from "@gooddata/sdk-model";

const OriginalInsightTitle: React.FC<{ title: string }> = (props) => {
    const { title } = props;
    return (
        <Typography tagName="p" className="insight-title s-insight-title ">
            <span title={title} className="original-insight-title">
                {title}
            </span>
        </Typography>
    );
};

/**
 * @internal
 */
export const DefaultDashboardInsightMenuTitle: CustomDashboardInsightMenuTitleComponent = (props) => {
    const { widget, insight, renderMode } = props;

    const title = widgetTitle(widget);
    const originalTitle = insightTitle(insight);

    const titlesDiffer = title !== originalTitle;

    const renderedTitle = title ? (
        <span title={props.widget.title} className="insight-title s-insight-title s-insight-title-simple">
            {props.widget.title}
        </span>
    ) : null;

    return (
        <>
            <Typography tagName="h3" className="widget-title s-widget-title">
                {renderedTitle}
            </Typography>
            {renderMode === "edit" && titlesDiffer ? <OriginalInsightTitle title={originalTitle} /> : null}
        </>
    );
};
