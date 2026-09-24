// (C) 2026 GoodData Corporation

import { useIntl } from "react-intl";

import { RestrictedFiltersNotice } from "./RestrictedFiltersNotice.js";

/**
 * Props of the component reporting the dashboard filters that could not be applied.
 *
 * @alpha
 */
export interface IRestrictedFiltersPlaceholderProps {
    /** How many filters were left out of the dashboard. */
    count: number;

    /** Removes the filters from the dashboard for good; absent unless the dashboard is being edited. */
    onRemove?: () => void;
}

/**
 * Reports filters left out because the current user may not read the objects they filter by.
 */
export function RestrictedFiltersPlaceholder({ count, onRemove }: IRestrictedFiltersPlaceholderProps) {
    const intl = useIntl();

    return (
        <RestrictedFiltersNotice
            count={count}
            size="regular"
            explanation={intl.formatMessage({ id: "filterBar.restrictedFilters.reason" }, { count })}
            onRemove={onRemove}
        />
    );
}
