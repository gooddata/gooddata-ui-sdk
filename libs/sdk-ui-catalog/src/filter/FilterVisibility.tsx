// (C) 2025 GoodData Corporation

import { memo } from "react";

import { FormattedMessage, type MessageDescriptor, defineMessages, useIntl } from "react-intl";

import { useFilterActions } from "./FilterContext.js";
import { FilterGroupLayout } from "./FilterGroupLayout.js";
import { StaticFilter } from "./StaticFilter.js";
import { testIds } from "../automation/index.js";

type VisibilityOption = "visible" | "hidden";

const options: VisibilityOption[] = ["visible", "hidden"];

const messages: Record<VisibilityOption, MessageDescriptor> = defineMessages({
    visible: { id: "analyticsCatalog.filter.visibility.visible" },
    hidden: { id: "analyticsCatalog.filter.visibility.hidden" },
});

export function FilterVisibility() {
    const intl = useIntl();
    const { setIsHidden } = useFilterActions();

    const handleChange = (selection: VisibilityOption[]) => {
        if (selection.length === 0) {
            setIsHidden(undefined);
            return;
        }
        if (selection.includes("hidden")) {
            setIsHidden(true);
        } else {
            setIsHidden(false);
        }
    };

    return (
        <FilterGroupLayout title={<FormattedMessage id="analyticsCatalog.filter.visibility.title" />}>
            <StaticFilter
                options={options}
                onChange={handleChange}
                getItemKey={(item) => item}
                getItemTitle={(item) => intl.formatMessage(messages[item])}
                dataTestId={testIds.filterVisibility}
                header={<FormattedMessage id="analyticsCatalog.filter.visibility.title" />}
                noDataMessage={null}
            />
        </FilterGroupLayout>
    );
}

export const FilterVisibilityMemo = memo(FilterVisibility);
