// (C) 2025-2026 GoodData Corporation

import { memo, useCallback, useMemo } from "react";

import { type MessageDescriptor, defineMessages, useIntl } from "react-intl";

import { useFilterActions, useFilterState } from "./FilterContext.js";
import { StaticFilter } from "./StaticFilter.js";
import { filterVisibility } from "../automation/testIds.js";

type VisibilityOption = "visible" | "hidden";

const options: VisibilityOption[] = ["visible", "hidden"];

const messages: Record<VisibilityOption, MessageDescriptor> = defineMessages({
    visible: { id: "analyticsCatalog.filter.visibility.visible" },
    hidden: { id: "analyticsCatalog.filter.visibility.hidden" },
});

export function FilterVisibility() {
    const intl = useIntl();
    const { setIsHidden } = useFilterActions();
    const { isHidden } = useFilterState();

    const selection: VisibilityOption[] = useMemo(
        () => (isHidden === undefined ? [] : [isHidden ? "hidden" : "visible"]),
        [isHidden],
    );

    const getItemTitle = useCallback((item: VisibilityOption) => intl.formatMessage(messages[item]), [intl]);

    const handleChange = (selection: VisibilityOption[], isInverted: boolean) => {
        const included = isInverted ? options.filter((option) => !selection.includes(option)) : selection;
        if (included.length === 0 || included.length === options.length) {
            setIsHidden(undefined);
        } else {
            setIsHidden(included.includes("hidden"));
        }
    };

    return (
        <StaticFilter
            label={intl.formatMessage({ id: "analyticsCatalog.filter.visibility.title" })}
            options={options}
            selection={selection}
            isSelectionInverted={isHidden === undefined}
            onSelectionChange={handleChange}
            getItemTitle={getItemTitle}
            dataTestId={filterVisibility}
            noDataMessage={null}
        />
    );
}

export const FilterVisibilityMemo = memo(FilterVisibility);
