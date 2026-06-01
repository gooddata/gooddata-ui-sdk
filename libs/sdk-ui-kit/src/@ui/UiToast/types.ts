// (C) 2026 GoodData Corporation

import { type MessageDescriptor, type PrimitiveType } from "react-intl";

import { type IAccessibilityConfigBase } from "../../typings/accessibility.js";

/**
 * Interpolation values accepted by `react-intl`'s `formatMessage`, **narrowed
 * to plain primitives** for toast use. Toast text is plain text by contract,
 * so React-element interpolation values (`<b>name</b>`) are intentionally
 * disallowed — `formatMessage` would otherwise return `ReactNode[]` which our
 * downstream `text: string` would have to stringify, producing
 * `"[object Object]"` for any element. Reject at compile time instead.
 *
 * @internal
 */
export type UiToastIntlValues = Record<string, PrimitiveType>;

/**
 * Severity / visual kind of a toast.
 *
 * @internal
 */
export type UiToastKind = "success" | "info" | "warning" | "error";

/**
 * Toast text content. Either a plain string or an `intl` message descriptor
 * with optional interpolation values.
 *
 * @internal
 */
export type UiToastMessage = string | { descriptor: MessageDescriptor; values?: UiToastIntlValues };

/**
 * Optional per-toast accessibility overrides. The container is a polite live
 * region by default; `error` and `warning` toasts upgrade to assertive
 * `role="alert"` unless overridden here.
 *
 * @internal
 */
export interface IUiToastAccessibilityConfig extends Pick<
    IAccessibilityConfigBase,
    "ariaLabel" | "ariaLabelledBy" | "ariaDescribedBy" | "role"
> {
    ariaLive?: "off" | "polite" | "assertive";
    /**
     * Accessible name for the close button. Defaults to the localized
     * "Close" — pass a context-specific string (e.g. "Dismiss the
     * 'access updated' notification") when a generic label isn't
     * descriptive enough for screen-reader users.
     */
    closeButtonLabel?: string;
}

/**
 * Optional inline action rendered next to the toast text (e.g. "Undo").
 *
 * @internal
 */
export interface IUiToastAction {
    /** Visible label on the action button. */
    label: string;
    /** Fired when the action is activated. */
    onClick: () => void;
}

/**
 * Options accepted by `useUiToast`'s `add*` methods (and the generic `add`).
 *
 * @internal
 */
export interface IUiToastOptions {
    /**
     * Caller-supplied id. When omitted a stable id is generated. Use to
     * dedupe or to remove a specific toast programmatically.
     */
    id?: string;
    /**
     * Skip auto-dismiss — the toast stays until the user closes it or
     * `remove(id)` is called. Defaults to `false`.
     */
    sticky?: boolean;
    /**
     * Auto-dismiss delay in milliseconds. Ignored when `sticky` is true.
     * Defaults to 4000 ms.
     */
    durationMs?: number;
    /** Optional inline action rendered next to the message. */
    action?: IUiToastAction;
    /**
     * Optional intl interpolation values used when `message` is a string —
     * exposed primarily so the kind-specific `add*` helpers can forward
     * intl values supplied alongside a `MessageDescriptor`.
     */
    values?: UiToastIntlValues;
    /** Fires once when the toast is dismissed (auto or user). */
    onDismiss?: () => void;
    /** Per-toast accessibility overrides. */
    accessibilityConfig?: IUiToastAccessibilityConfig;
}

/**
 * A toast as the container renders it. Internal — not part of the public API.
 *
 * @internal
 */
export interface IUiToast {
    id: string;
    kind: UiToastKind;
    /** Resolved display text (already passed through `formatMessage` if needed). */
    text: string;
    sticky: boolean;
    durationMs: number;
    action?: IUiToastAction;
    accessibilityConfig?: IUiToastAccessibilityConfig;
    onDismiss?: () => void;
}

/**
 * Public hook surface. Each `add*` returns the toast id, which callers can
 * pass to `remove` to dismiss it programmatically.
 *
 * @internal
 */
export interface IUseUiToastResult {
    addSuccess: (message: UiToastMessage, options?: IUiToastOptions) => string;
    addInfo: (message: UiToastMessage, options?: IUiToastOptions) => string;
    addWarning: (message: UiToastMessage, options?: IUiToastOptions) => string;
    addError: (message: UiToastMessage, options?: IUiToastOptions) => string;
    /** Generic add — provide your own `kind`. */
    add: (kind: UiToastKind, message: UiToastMessage, options?: IUiToastOptions) => string;
    /** Dismiss a single toast by id. No-op if no toast with that id is showing. */
    remove: (id: string) => void;
    /** Dismiss all currently showing toasts. */
    removeAll: () => void;
}
