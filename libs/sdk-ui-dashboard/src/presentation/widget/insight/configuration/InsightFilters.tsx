// (C) 2007-2023 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";
import { Typography } from "@gooddata/sdk-ui-kit";
import InsightDateDataSetFilter from "./InsightDateDataSetFilter.js";
import { IInsightWidget, isInsightWidget } from "@gooddata/sdk-model";
import { AttributeFilterConfiguration } from "../../common/configuration/AttributeFilterConfiguration.js";

interface IInsightFiltersProps {
    widget: IInsightWidget;
}

export default function InsightFilters({ widget }: IInsightFiltersProps) {
    return (
        <div className="s-viz-filters-panel configuration-category">
            <Typography tagName="h3" className="s-viz-filters-headline">
                <FormattedMessage id="configurationPanel.filterBy" />
            </Typography>
            {isInsightWidget(widget) ? <InsightDateDataSetFilter widget={widget} /> : null}
            <AttributeFilterConfiguration widget={widget} />
        </div>
    );
}
