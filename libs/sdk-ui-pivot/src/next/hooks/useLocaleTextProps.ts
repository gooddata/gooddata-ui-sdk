// (C) 2025 GoodData Corporation

import { useMemo } from "react";

import { useIntl } from "react-intl";

import { messages } from "../../locales.js";
import { AgGridProps } from "../types/agGrid.js";

/**
 * Returns ag-grid props with localized text for pagination.
 *
 * @internal
 */
export function useLocaleTextProps(): (agGridReactProps: AgGridProps) => AgGridProps {
    const intl = useIntl();

    return useMemo(
        () => (agGridReactProps: AgGridProps) => {
            const values = {
                of: intl.formatMessage(messages["paginationOf"]),
            };

            return {
                ...agGridReactProps,
                localeText: {
                    ...agGridReactProps.localeText,
                    ...values,
                },
            };
        },
        [intl],
    );
}
