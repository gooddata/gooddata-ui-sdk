// (C) 2026 GoodData Corporation

import { type ReactNode, useId, useState } from "react";

import { useIntl } from "react-intl";

import { commonDialogMessages, uiMessageMessages } from "../../locales.js";
import { type IAccessibilityConfigBase } from "../../typings/accessibility.js";
import { type IconType } from "../@types/icon.js";
import { bem } from "../@utils/bem.js";
import { UiIcon } from "../UiIcon/UiIcon.js";

const { b, e } = bem("gd-ui-kit-message");

/**
 * Severity / visual kind of a message.
 *
 * @internal
 */
export type UiMessageVariant = "info" | "success" | "warning" | "error";

/**
 * @internal
 */
export type UiMessageSize = "small" | "medium";

/**
 * `hug` sizes the message to its content (up to a maximum width), `fill` stretches it over its container.
 *
 * @internal
 */
export type UiMessageWidth = "hug" | "fill";

/**
 * `role`, `ariaLabel`, `ariaLabelledBy` and `ariaDescribedBy` apply to the live region around the
 * message text. `role` defaults to `alert` for warning and error and to `status` otherwise.
 *
 * @internal
 */
export interface IUiMessageAccessibilityConfig extends Pick<
    IAccessibilityConfigBase,
    "ariaLabel" | "ariaLabelledBy" | "ariaDescribedBy" | "role"
> {
    /**
     * Accessible name of the close button. Defaults to the localized "Close".
     */
    closeButtonLabel?: string;
}

/**
 * @internal
 */
export interface IUiMessageProps {
    /**
     * The message text.
     */
    children: ReactNode;
    /**
     * Defaults to `info`.
     */
    variant?: UiMessageVariant;
    /**
     * Defaults to `medium`.
     */
    size?: UiMessageSize;
    /**
     * Defaults to `hug`.
     */
    width?: UiMessageWidth;
    /**
     * Shows the leading icon. Defaults to `false`.
     */
    showIcon?: boolean;
    /**
     * Overrides the default icon of the variant.
     */
    icon?: IconType;
    /**
     * Additional text revealed by the "Show more" link placed right after the message text.
     */
    detail?: ReactNode;
    /**
     * Controls whether the detail is shown. Leave undefined to let the message manage it.
     */
    isExpanded?: boolean;
    /**
     * Fired when the user toggles the detail.
     */
    onExpandedChange?: (isExpanded: boolean) => void;
    /**
     * When provided, a close button is shown at the right edge of the message.
     */
    onClose?: () => void;
    accessibilityConfig?: IUiMessageAccessibilityConfig;
    dataTestId?: string;
}

const DEFAULT_ICONS: Record<UiMessageVariant, IconType> = {
    info: "infoCircle",
    success: "checkCircle",
    warning: "warning",
    error: "crossCircle",
};

// Same mapping as UiToast: warnings and errors interrupt, info and success are announced politely.
const DEFAULT_ROLES: Record<UiMessageVariant, "status" | "alert"> = {
    info: "status",
    success: "status",
    warning: "alert",
    error: "alert",
};

/**
 * Inline, persistent feedback message for communicating status, results or important information.
 *
 * @internal
 */
export function UiMessage({
    children,
    variant = "info",
    size = "medium",
    width = "hug",
    showIcon = false,
    icon,
    detail,
    isExpanded: controlledIsExpanded,
    onExpandedChange,
    onClose,
    accessibilityConfig,
    dataTestId,
}: IUiMessageProps) {
    const intl = useIntl();
    const detailId = useId();
    const [uncontrolledIsExpanded, setUncontrolledIsExpanded] = useState(false);
    const isExpanded = controlledIsExpanded ?? uncontrolledIsExpanded;
    // `detail={condition && <Detail />}` passes `false`, which must not render an empty "Show more".
    const hasDetail = detail !== undefined && detail !== null && detail !== false && detail !== "";
    const iconSize = size === "small" ? 12 : 14;

    const toggleExpanded = () => {
        const next = !isExpanded;
        setUncontrolledIsExpanded(next);
        onExpandedChange?.(next);
    };

    return (
        <div
            className={b({ variant, size, width, isExpanded: hasDetail && isExpanded })}
            data-testid={dataTestId}
        >
            <div className={e("row")}>
                {showIcon ? (
                    <span className={e("icon")}>
                        <UiIcon type={icon ?? DEFAULT_ICONS[variant]} size={iconSize} color="currentColor" />
                    </span>
                ) : null}
                {/* The live region wraps only the text, so toggling Show more / Show less does not
                    make screen readers re-read the whole message. */}
                <span
                    className={e("text")}
                    role={accessibilityConfig?.role ?? DEFAULT_ROLES[variant]}
                    aria-label={accessibilityConfig?.ariaLabel}
                    aria-labelledby={accessibilityConfig?.ariaLabelledBy}
                    aria-describedby={accessibilityConfig?.ariaDescribedBy}
                >
                    {children}
                </span>
                {hasDetail ? (
                    <button
                        type="button"
                        className={e("toggle")}
                        aria-expanded={isExpanded}
                        aria-controls={detailId}
                        onClick={toggleExpanded}
                    >
                        {intl.formatMessage(
                            isExpanded ? uiMessageMessages.showLess : uiMessageMessages.showMore,
                        )}
                    </button>
                ) : null}
                {onClose ? (
                    <button
                        type="button"
                        className={e("close")}
                        aria-label={
                            accessibilityConfig?.closeButtonLabel ??
                            intl.formatMessage(commonDialogMessages.close)
                        }
                        onClick={onClose}
                    >
                        <UiIcon type="cross" size={iconSize} color="currentColor" />
                    </button>
                ) : null}
            </div>
            {hasDetail ? (
                <div className={e("detail")} id={detailId} hidden={!isExpanded}>
                    {detail}
                </div>
            ) : null}
        </div>
    );
}
