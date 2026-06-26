// (C) 2026 GoodData Corporation

import { type ReactNode, useEffect, useState } from "react";

import { useIntl } from "react-intl";

import { UiTooltip } from "@gooddata/sdk-ui-kit";

import { messages } from "../../../locales.js";
import { isMacOS } from "../../hooks/useLocaleTextProps.js";
import { type AgGridHeaderParams } from "../../types/agGrid.js";

interface IHeaderKeyboardHintProps {
    eGridHeader: HTMLElement | undefined;
    canSort?: boolean;
    canOpenMenu?: boolean;
    enabled?: boolean;
    children: ReactNode;
}

const MAC_KEYS = { openMenu: "⌥ + ↓", sort: "⏎", multiSort: "⇧ + ⏎", columnWidth: "⌥ + ←/→" };
const WINDOWS_KEYS = {
    openMenu: "Alt + ↓",
    sort: "Enter",
    multiSort: "Shift + Enter",
    columnWidth: "Alt + ←/→",
};

/**
 * True when `params` renders the first displayed (left-most) column — the only header that shows the hint.
 *
 * @internal
 */
export function isFirstDisplayedColumn(params: AgGridHeaderParams): boolean {
    return params.api.getAllDisplayedColumns()[0] === params.column;
}

function useHeaderKeyboardFocus(eGridHeader: HTMLElement): boolean {
    const [isKeyboardFocused, setIsKeyboardFocused] = useState(false);

    useEffect(() => {
        // `:focus-visible` keeps the hint keyboard-only; `focusin`/`focusout` bubble so descendant focus is seen.
        const handler = () => setIsKeyboardFocused(eGridHeader.matches(":focus-visible"));

        eGridHeader.addEventListener("focusin", handler);
        eGridHeader.addEventListener("focusout", handler);
        return () => {
            eGridHeader.removeEventListener("focusin", handler);
            eGridHeader.removeEventListener("focusout", handler);
        };
    }, [eGridHeader]);

    return isKeyboardFocused;
}

function HeaderKeyboardHintTooltip({
    eGridHeader,
    canSort = false,
    canOpenMenu = false,
    children,
}: {
    eGridHeader: HTMLElement;
    canSort?: boolean;
    canOpenMenu?: boolean;
    children: ReactNode;
}) {
    const intl = useIntl();
    const isKeyboardFocused = useHeaderKeyboardFocus(eGridHeader);

    const keys = isMacOS() ? MAC_KEYS : WINDOWS_KEYS;
    const hint = [
        canOpenMenu ? `${intl.formatMessage(messages["keyboardHintOpenMenu"])} (${keys.openMenu})` : null,
        canSort ? `${intl.formatMessage(messages["keyboardHintSort"])} (${keys.sort})` : null,
        canSort ? `${intl.formatMessage(messages["keyboardHintMultiSort"])} (${keys.multiSort})` : null,
        `${intl.formatMessage(messages["keyboardHintColumnWidth"])} (${keys.columnWidth})`,
    ]
        .filter((line): line is string => line !== null)
        .join("\n");

    return (
        <UiTooltip
            isOpen={isKeyboardFocused}
            triggerBy={[]}
            accessibilityHidden
            arrowPlacement="top"
            optimalPlacement
            content={<div style={{ whiteSpace: "pre-line" }}>{hint}</div>}
            anchorWrapperStyles={{ display: "flex", width: "100%", height: "100%" }}
            anchor={children}
        />
    );
}

/**
 * Wraps a column header with a keyboard-shortcut hint shown while it has keyboard focus. Limited to the first
 * column via `enabled` ({@link isFirstDisplayedColumn}); `accessibilityHidden` because every header already
 * announces the shortcuts via ARIA.
 *
 * @internal
 */
export function HeaderKeyboardHint({
    eGridHeader,
    enabled = true,
    canSort,
    canOpenMenu,
    children,
}: IHeaderKeyboardHintProps) {
    if (!eGridHeader || !enabled) {
        return <>{children}</>;
    }

    return (
        <HeaderKeyboardHintTooltip eGridHeader={eGridHeader} canSort={canSort} canOpenMenu={canOpenMenu}>
            {children}
        </HeaderKeyboardHintTooltip>
    );
}
