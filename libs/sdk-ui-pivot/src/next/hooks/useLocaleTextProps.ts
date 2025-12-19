// (C) 2025 GoodData Corporation

import { useMemo } from "react";

import { useIntl } from "react-intl";

import { messages } from "../../locales.js";
import { type AgGridProps } from "../types/agGrid.js";

/**
 * Detect if the user is on macOS for OS-specific keyboard shortcut instructions.
 */
function isMacOS(): boolean {
    return typeof navigator !== "undefined" && /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);
}

/**
 * Returns ag-grid props with localized texts.
 *
 * @internal
 */
export function useLocaleTextProps(): (agGridReactProps: AgGridProps) => AgGridProps {
    const intl = useIntl();

    const keyboardInstructionsMessage = isMacOS()
        ? messages["keyboardInstructionsMac"]
        : messages["keyboardInstructionsWindows"];

    return useMemo(
        () => (agGridReactProps: AgGridProps) => {
            const localeText: Record<string, string> = {
                ...agGridReactProps.localeText,
                of: intl.formatMessage(messages["paginationOf"]),
                ariaPagePrevious: intl.formatMessage(messages["ariaPagePrevious"]),
                ariaPageNext: intl.formatMessage(messages["ariaPageNext"]),
                // Override default "Press ENTER to sort" with comprehensive keyboard instructions
                ariaSortableColumn: intl.formatMessage(keyboardInstructionsMessage),
            };

            return {
                ...agGridReactProps,
                localeText,
            };
        },
        [intl, keyboardInstructionsMessage],
    );
}
