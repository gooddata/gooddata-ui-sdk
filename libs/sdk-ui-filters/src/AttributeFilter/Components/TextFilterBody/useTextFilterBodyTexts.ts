// (C) 2007-2026 GoodData Corporation

import { useIntl } from "react-intl";

/**
 * Hook providing formatted text strings for the TextFilterBody component.
 *
 * @internal
 */
export function useTextFilterBodyTexts() {
    const intl = useIntl();

    return {
        arbitraryValuePlaceholder: intl.formatMessage({
            id: "attributeFilter.text.arbitrary.placeholder",
        }),
        matchValuePlaceholder: intl.formatMessage({
            id: "attributeFilter.text.match.placeholder",
        }),
        arbitraryFilterValue: intl.formatMessage({
            id: "attributeFilter.text.arbitrary.values",
        }),
        matchFilterValue: intl.formatMessage({
            id: "attributeFilter.text.match.value",
        }),
    };
}
