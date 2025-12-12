// (C) 2007-2025 GoodData Corporation

import { FormattedMessage } from "react-intl";

import { type IInsightWidget, isInsightWidget } from "@gooddata/sdk-model";
import { Typography } from "@gooddata/sdk-ui-kit";

import { InsightCrossFiltering } from "./InsightCrossFiltering.js";
import { InsightDateDataSetFilter } from "./InsightDateDataSetFilter.js";
import { FilterConfiguration } from "../../common/configuration/FilterConfiguration.js";

interface IInsightFiltersProps {
    widget: IInsightWidget;
}

export function InsightFilters({ widget }: IInsightFiltersProps) {
    return (
        <div className="s-viz-filters-panel configuration-category">
            <Typography tagName="h3" className="s-viz-filters-headline">
                <FormattedMessage id="configurationPanel.filterBy" />
            </Typography>
            {isInsightWidget(widget) ? <InsightDateDataSetFilter widget={widget} /> : null}
            <FilterConfiguration widget={widget} />
            <InsightCrossFiltering widget={widget} />
        </div>
    );
}
