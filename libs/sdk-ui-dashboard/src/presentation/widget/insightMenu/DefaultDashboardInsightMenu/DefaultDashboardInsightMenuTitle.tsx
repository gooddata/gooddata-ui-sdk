// (C) 2021-2022 GoodData Corporation
import React from "react";
import { Typography } from "@gooddata/sdk-ui-kit";
import { CustomDashboardInsightMenuTitleComponent } from "../types";
import { widgetTitle } from "@gooddata/sdk-model";

/**
 * @internal
 */
export const DefaultDashboardInsightMenuTitle: CustomDashboardInsightMenuTitleComponent = (props) => {
    const { widget } = props;

    const title = widgetTitle(widget);

    const renderedTitle = title ? (
        <span title={props.widget.title} className="insight-title s-insight-title s-insight-title-simple">
            {props.widget.title}
        </span>
    ) : null;

    return (
        <Typography tagName="h3" className="widget-title s-widget-title">
            {renderedTitle}
        </Typography>
    );
};
