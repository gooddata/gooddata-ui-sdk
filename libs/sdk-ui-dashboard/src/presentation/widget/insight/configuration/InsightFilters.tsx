// (C) 2007-2022 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";
import { Typography } from "@gooddata/sdk-ui-kit";
import InsightDateDataSetFilter from "./InsightDateDataSetFilter";
import { IInsightWidget } from "@gooddata/sdk-model";
import { AttributeFilterConfiguration } from "../../common/configuration/AttributeFilterConfiguration";

interface IInsightFiltersProps {
    widget: IInsightWidget;
}

export default function InsightFilters({ widget }: IInsightFiltersProps) {
    return (
        <div className="s-viz-filters-panel configuration-category">
            <Typography tagName="h3" className="s-viz-filters-headline">
                <FormattedMessage id="configurationPanel.filterBy" />
            </Typography>
            <InsightDateDataSetFilter widget={widget} />
            <AttributeFilterConfiguration widget={widget} />
        </div>
    );
}
