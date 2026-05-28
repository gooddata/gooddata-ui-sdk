// (C) 2026 GoodData Corporation

import { type KeyboardEvent, type ReactNode, createContext, useContext, useId } from "react";

import { bem } from "../@utils/bem.js";
import { UiFocusManager } from "../UiFocusManager/UiFocusManager.js";

const { b } = bem("gd-ui-kit-dialog-shell");

/**
 * Accessibility config for a dialog. By default the shell wires
 * `aria-labelledby` to the `UiDialogHeader` title via
 * context — no config is needed when a header is present. For headerless
 * dialogs, pass `ariaLabel`; to point at an external title
 * element, pass `ariaLabelledBy`.
 *
 * @internal
 */
export interface IUiDialogShellAccessibilityConfig {
    ariaLabel?: string;
    ariaLabelledBy?: string;
    ariaDescribedBy?: string;
}

/**
 * @internal
 */
export interface IUiDialogShellProps {
    /** Header / body / footer composed by the caller. */
    children: ReactNode;
    /** Dialog width in px. Defaults to 540. */
    width?: number;
    /**
     * When true, the dialog acts as a modal: focus is trapped inside,
     * autofocus + return-focus-on-unmount apply, ESC fires `onClose`,
     * and `aria-modal="true"` is set. Leave off for inline
     * non-blocking dialog cards.
     */
    isModal?: boolean;
    /** Fires when the user dismisses via ESC. Only active when `isModal`. */
    onClose?: () => void;
    /**
     * Accessibility config. Usually unnecessary — when `UiDialogHeader`
     * is used as a child the shell auto-wires `aria-labelledby` to
     * the header's title.
     */
    accessibilityConfig?: IUiDialogShellAccessibilityConfig;
    /** Test id forwarded to the root element. */
    dataTestId?: string;
}

interface IUiDialogContext {
    titleId: string;
}

const UiDialogContext = createContext<IUiDialogContext | null>(null);

/**
 * @internal
 */
export function useUiDialogContext(): IUiDialogContext | null {
    return useContext(UiDialogContext);
}

/**
 * Plain dialog card chrome — 4px radius, soft shadow, complementary-0 fill,
 * 20px padding. Holds whatever the caller composes inside. Set
 * `isModal` for blocking dialogs (adds focus trap, autofocus,
 * return-focus, ESC handling and `aria-modal`).
 *
 * @internal
 */
export function UiDialogShell({
    children,
    width = 540,
    isModal = false,
    onClose,
    accessibilityConfig,
    dataTestId,
}: IUiDialogShellProps) {
    const titleId = useId();
    const ariaLabelledBy =
        accessibilityConfig?.ariaLabelledBy ?? (accessibilityConfig?.ariaLabel ? undefined : titleId);
    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (isModal && event.key === "Escape" && onClose) {
            event.stopPropagation();
            onClose();
        }
    };
    const card = (
        <div
            className={b()}
            data-testid={dataTestId}
            style={{ width }}
            role="dialog"
            aria-modal={isModal || undefined}
            aria-label={accessibilityConfig?.ariaLabel}
            aria-labelledby={ariaLabelledBy}
            aria-describedby={accessibilityConfig?.ariaDescribedBy}
            onKeyDown={handleKeyDown}
        >
            <UiDialogContext.Provider value={{ titleId }}>{children}</UiDialogContext.Provider>
        </div>
    );

    if (!isModal) {
        return card;
    }
    return (
        <UiFocusManager enableAutofocus enableFocusTrap enableReturnFocusOnUnmount>
            {card}
        </UiFocusManager>
    );
}
