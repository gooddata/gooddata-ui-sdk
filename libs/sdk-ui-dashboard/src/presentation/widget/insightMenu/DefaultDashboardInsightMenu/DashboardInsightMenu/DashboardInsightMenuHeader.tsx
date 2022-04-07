// (C) 2021-2022 GoodData Corporation
import React from "react";

import { IInsightWidget } from "@gooddata/sdk-model";
import { Typography } from "@gooddata/sdk-ui-kit";

interface IDashboardInsightMenuHeaderProps {
    widget: IInsightWidget;
    title?: React.ReactNode;
}

export const DashboardInsightMenuHeader: React.FC<IDashboardInsightMenuHeaderProps> = (props) => {
    const renderedTitle = props.title ? (
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
