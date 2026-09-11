// (C) 2026 GoodData Corporation

import { FormattedMessage, useIntl } from "react-intl";

import { UiTooltip } from "@gooddata/sdk-ui-kit";

/**
 * Props of the component reporting the dashboard filters that could not be applied.
 *
 * @alpha
 */
export interface IRestrictedFiltersPlaceholderProps {
    /** How many filters were left out of the dashboard. */
    count: number;
}

/**
 * Reports filters left out because the current user may not read the objects they filter by.
 */
export function RestrictedFiltersPlaceholder({ count }: IRestrictedFiltersPlaceholderProps) {
    const intl = useIntl();

    return (
        // the filter bar counts its rows by measuring its direct children, so the tooltip's own
        // wrapper and its screen-reader copy have to sit inside a single one of them
        <span className="dash-filters-restricted">
            <UiTooltip
                triggerBy={["hover", "focus"]}
                content={intl.formatMessage({ id: "filterBar.restrictedFilters.reason" }, { count })}
                anchor={
                    // focusable so the reason is reachable without a pointer; it opens nothing
                    <span
                        className="dash-filters-restricted-notice"
                        tabIndex={0}
                        data-testid="restricted-filters"
                    >
                        <span className="gd-icon-lock" />
                        <FormattedMessage id="filterBar.restrictedFilters" values={{ count }} />
                    </span>
                }
            />
        </span>
    );
}
