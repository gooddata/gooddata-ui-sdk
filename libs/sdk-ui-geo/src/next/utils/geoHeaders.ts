// (C) 2025 GoodData Corporation

import { IntlShape } from "react-intl";

export interface IGeoHeaderStrings {
    emptyHeaderString: string;
    nullHeaderString: string;
}

/**
 * Resolve localized strings used when transforming empty or null geo headers.
 *
 * @internal
 */
export function getGeoHeaderStrings(intl: IntlShape): IGeoHeaderStrings {
    const emptyHeaderString = intl.formatMessage({ id: "visualization.emptyValue" });
    const nullHeaderString = intl.formatMessage({ id: "visualization.emptyValue" });

    return { emptyHeaderString, nullHeaderString };
}
