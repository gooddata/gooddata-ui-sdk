// (C) 2022 GoodData Corporation
import React from "react";

import { DescriptionPanel } from "@gooddata/sdk-ui-kit";
import { IInsightWidgetDescriptionTriggerProps } from "./types";

export const InsightWidgetDescriptionTrigger: React.FC<IInsightWidgetDescriptionTriggerProps> = (props) => {
    const { widget, insight } = props;
    const visible = widget.configuration?.description?.visible;
    const description =
        widget.configuration?.description?.source === "widget" ? widget.description : insight.insight.summary;

    if (visible && description && description !== "") {
        return (
            <div className="dash-item-action-description">
                <DescriptionPanel description={description} />
            </div>
        );
    }
    return null;
};
