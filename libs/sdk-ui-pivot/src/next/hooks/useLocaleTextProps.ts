// (C) 2025 GoodData Corporation

import { useMemo } from "react";

import { useIntl } from "react-intl";

import { messages } from "../../locales.js";
import { type AgGridProps } from "../types/agGrid.js";

/**
 * Returns ag-grid props with localized texts.
 *
 * @internal
 */
export function useLocaleTextProps(): (agGridReactProps: AgGridProps) => AgGridProps {
    const intl = useIntl();

    return useMemo(
        () => (agGridReactProps: AgGridProps) => {
            const localeText: Record<string, string> = {
                ...agGridReactProps.localeText,
                of: intl.formatMessage(messages["paginationOf"]),
                ariaPagePrevious: intl.formatMessage(messages["ariaPagePrevious"]),
                ariaPageNext: intl.formatMessage(messages["ariaPageNext"]),
            };

            return {
                ...agGridReactProps,
                localeText,
            };
        },
        [intl],
    );
}
