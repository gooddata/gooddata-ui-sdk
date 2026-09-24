// (C) 2026 GoodData Corporation

import { useIntl } from "react-intl";

import { RestrictedFiltersNotice } from "../../presentation/filterBar/filterBar/RestrictedFiltersNotice.js";

export function KdaRestrictedFiltersNotice({ count }: { count: number }) {
    const intl = useIntl();

    return (
        <RestrictedFiltersNotice
            count={count}
            size="compact"
            explanation={intl.formatMessage(
                { id: "kdaDialog.dialog.bars.filters.restricted.reason" },
                { count },
            )}
            dataTestId="kda-restricted-filters"
        />
    );
}
