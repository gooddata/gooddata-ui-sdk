// (C) 2025 GoodData Corporation

import { FormattedMessage } from "react-intl";

import { type IRichTextWidget } from "@gooddata/sdk-model";
import { Typography } from "@gooddata/sdk-ui-kit";

import { RichTextDateDataSetFilter } from "./RichTextDateDataSetFilter.js";
import { FilterConfiguration } from "../../common/configuration/FilterConfiguration.js";

interface IRichTextFiltersProps {
    widget: IRichTextWidget;
}

export function RichTextFilters({ widget }: IRichTextFiltersProps) {
    return (
        <div className="s-viz-filters-panel configuration-category">
            <Typography tagName="h3" className="s-viz-filters-headline">
                <FormattedMessage id="configurationPanel.filterBy" />
            </Typography>
            <RichTextDateDataSetFilter widget={widget} />
            <FilterConfiguration widget={widget} />
        </div>
    );
}
