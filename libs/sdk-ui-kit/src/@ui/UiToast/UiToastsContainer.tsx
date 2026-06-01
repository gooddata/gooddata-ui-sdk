// (C) 2026 GoodData Corporation

import { type ReactNode, useContext, useMemo } from "react";

import { useIntl } from "react-intl";

import { commonDialogMessages } from "../../locales.js";
import { bem } from "../@utils/bem.js";
import { UiIcon } from "../UiIcon/UiIcon.js";

import { type IUiToast, type UiToastKind } from "./types.js";
import { UiToastContextInternal } from "./UiToastProvider.js";

const { b, e } = bem("gd-ui-kit-toast");

// Errors and warnings interrupt screen readers by default; success/info wait
// for the assistive-tech queue to be free. Callers can override per toast.
const DEFAULT_ARIA_LIVE: Record<UiToastKind, "polite" | "assertive"> = {
    success: "polite",
    info: "polite",
    warning: "assertive",
    error: "assertive",
};

/**
 * @internal
 */
export interface IUiToastItemProps {
    toast: IUiToast;
    /** Fired when the user dismisses (close X or action click). */
    onClose: (id: string) => void;
}

/**
 * Presentational single-toast component. Most consumers use
 * `UiToastsContainer` (which reads queued toasts from the provider), but
 * this can be rendered directly for static demos or one-off composition.
 *
 * @internal
 */
export function UiToastItem({ toast, onClose }: IUiToastItemProps): ReactNode {
    const intl = useIntl();
    const ariaLive = toast.accessibilityConfig?.ariaLive ?? DEFAULT_ARIA_LIVE[toast.kind];
    const role = toast.accessibilityConfig?.role ?? (ariaLive === "assertive" ? "alert" : "status");
    const closeLabel =
        toast.accessibilityConfig?.closeButtonLabel ?? intl.formatMessage(commonDialogMessages.close);
    return (
        <div
            className={e("item", { kind: toast.kind })}
            role={role}
            aria-live={ariaLive}
            aria-label={toast.accessibilityConfig?.ariaLabel}
            aria-labelledby={toast.accessibilityConfig?.ariaLabelledBy}
            aria-describedby={toast.accessibilityConfig?.ariaDescribedBy}
            // Test id is per-toast (kind + id) so multiple concurrent
            // toasts of the same kind don't collide. Tests that only care
            // about kind can use `getAllByTestId(/^gd-ui-kit-toast-<kind>-/)`.
            data-testid={`gd-ui-kit-toast-${toast.kind}-${toast.id}`}
        >
            <span className={e("body")}>{toast.text}</span>
            {toast.action ? (
                <button
                    type="button"
                    className={e("action")}
                    onClick={() => {
                        toast.action!.onClick();
                        onClose(toast.id);
                    }}
                >
                    {toast.action.label}
                </button>
            ) : null}
            <button
                type="button"
                className={e("close")}
                onClick={() => onClose(toast.id)}
                aria-label={closeLabel}
            >
                <UiIcon type="cross" size={14} color="currentColor" />
            </button>
        </div>
    );
}

/**
 * @internal
 */
export interface IUiToastsContainerProps {
    /** Test id forwarded to the root element. */
    dataTestId?: string;
}

/**
 * Renders the list of toasts queued by `useUiToast`. Mount once near the app
 * root, inside a `UiToastProvider`. Nested containers render nothing — only
 * the outermost one is visible, preserving the topmost-only behaviour.
 *
 * @internal
 */
export function UiToastsContainer({ dataTestId }: IUiToastsContainerProps): ReactNode {
    const ctx = useContext(UiToastContextInternal);
    // Render newest-first so the most recent notification sits at the top
    // of the stack — matches the legacy `ToastsCenter` overlay
    // (`messages.sort((a, b) => b.createdAt - a.createdAt)`). The queue
    // itself stays in insertion order for `push` / `remove` correctness;
    // only the rendered list is reversed.
    const items = useMemo(() => (ctx?.toasts ? [...ctx.toasts].reverse() : []), [ctx?.toasts]);

    if (!ctx || ctx.isNested) {
        return null;
    }

    return (
        <div className={b()} data-testid={dataTestId}>
            {items.map((toast) => (
                <UiToastItem key={toast.id} toast={toast} onClose={ctx.remove} />
            ))}
        </div>
    );
}
