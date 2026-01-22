// (C) 2023-2026 GoodData Corporation

import { useEffect, useMemo, useRef, useState } from "react";

import { useIntl } from "react-intl";

import { IconReset, UiTooltip } from "@gooddata/sdk-ui-kit";

import { useResetFiltersButton } from "./hooks/useResetFiltersButton.js";
import { useEventToastMessage } from "../../../_staging/sharedHooks/useEventToastMessage.js";
import { messages } from "../../../locales.js";
import { isDashboardFilterContextSelectionReset } from "../../../model/events/filters.js";

/**
 * @internal
 */
export function ResetFiltersButton() {
    const intl = useIntl();
    const [isOpenInternal, setIsOpen] = useState(false);
    const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const { canReset, resetFilters, resetType } = useResetFiltersButton();

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (focusTimeoutRef.current) {
                clearTimeout(focusTimeoutRef.current);
            }
        };
    }, []);

    useEventToastMessage(
        "success",
        isDashboardFilterContextSelectionReset,
        messages.filterResetButtonSuccess,
    );

    // Custom focus handling with delay support
    const customFocusHandlers = useMemo(() => {
        return {
            onFocus: () => {
                if (focusTimeoutRef.current) {
                    clearTimeout(focusTimeoutRef.current);
                }
                focusTimeoutRef.current = setTimeout(() => {
                    setIsOpen(true);
                }, 0);
            },
            onBlur: () => {
                if (focusTimeoutRef.current) {
                    clearTimeout(focusTimeoutRef.current);
                }
                setIsOpen(false);
            },
        };
    }, []);

    if (!canReset) {
        return null;
    }

    const bubbleText =
        resetType === "all"
            ? intl.formatMessage(messages.filterResetButtonTooltip)
            : intl.formatMessage(messages.crossFilterResetButtonTooltip);

    return (
        <div className="dash-filters-reset">
            <UiTooltip
                arrowPlacement="top-start"
                content={bubbleText}
                triggerBy={["hover", "focus"]}
                disabled={!isOpenInternal}
                anchor={
                    <button
                        className="gd-button-link button-filter-bar-reset"
                        onClick={resetFilters}
                        aria-label={bubbleText}
                        onMouseEnter={() => setIsOpen(true)}
                        {...customFocusHandlers}
                    >
                        <IconReset className="gd-icon-reset" width={20} height={20} ariaHidden />
                    </button>
                }
            />
        </div>
    );
}
