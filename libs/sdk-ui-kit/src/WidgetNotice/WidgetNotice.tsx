// (C) 2026 GoodData Corporation

import { type ReactNode, useId, useState } from "react";

import { useIntl } from "react-intl";

import { type IconType } from "../@ui/@types/icon.js";
import { type ThemeColor } from "../@ui/@types/themeColors.js";
import { bem } from "../@ui/@utils/bem.js";
import { UiIcon } from "../@ui/UiIcon/UiIcon.js";
import { UiIconButton } from "../@ui/UiIconButton/UiIconButton.js";
import { commonDialogMessages } from "../locales.js";

const { b, e } = bem("gd-ui-kit-widget-notice");

/**
 * @internal
 */
export type WidgetNoticeType = "info" | "success" | "warning" | "error";

/**
 * @internal
 */
export interface IWidgetNoticeProps {
    type?: WidgetNoticeType;
    message: ReactNode;
    action?: ReactNode;
    detail?: ReactNode;
    detailAction?: ReactNode;
    expandLabel?: ReactNode;
    collapseLabel?: ReactNode;
    defaultExpanded?: boolean;
    showIcon?: boolean;
    onClose?: () => void;
    closeButtonLabel?: string;
    dataTestId?: string;
}

const ICON_BY_TYPE: Record<WidgetNoticeType, IconType> = {
    info: "infoCircle",
    success: "checkCircle",
    warning: "warning",
    error: "exclamationCircle",
};

const ICON_COLOR_BY_TYPE: Record<WidgetNoticeType, ThemeColor> = {
    info: "primary",
    success: "success",
    warning: "warning",
    error: "error",
};

/**
 * @internal
 */
export function WidgetNotice({
    type = "info",
    message,
    action,
    detail,
    detailAction,
    expandLabel,
    collapseLabel,
    defaultExpanded = false,
    showIcon = true,
    onClose,
    closeButtonLabel,
    dataTestId,
}: IWidgetNoticeProps) {
    const intl = useIntl();
    const detailId = useId();
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);
    const hasDetail = Boolean(detail);
    const effectiveCloseButtonLabel = closeButtonLabel ?? intl.formatMessage(commonDialogMessages.close);

    return (
        <div className={b({ type, expandable: hasDetail })} data-testid={dataTestId}>
            <div className={e("header")}>
                <div className={e("content")}>
                    {showIcon ? (
                        <span className={e("icon")} aria-hidden="true">
                            <UiIcon type={ICON_BY_TYPE[type]} size={16} color={ICON_COLOR_BY_TYPE[type]} />
                        </span>
                    ) : null}
                    <div className={e("text")}>
                        <span className={e("message")}>{message}</span>
                        {action ? <span className={e("action")}>{action}</span> : null}
                        {hasDetail ? (
                            <button
                                type="button"
                                className={e("toggle")}
                                data-testid="widget-notice-toggle"
                                aria-expanded={isExpanded}
                                aria-controls={isExpanded ? detailId : undefined}
                                onClick={() => setIsExpanded((wasExpanded) => !wasExpanded)}
                            >
                                {isExpanded ? collapseLabel : expandLabel}
                            </button>
                        ) : null}
                    </div>
                </div>
                {onClose ? (
                    <UiIconButton
                        icon="cross"
                        variant="tertiary"
                        size="xsmall"
                        label={effectiveCloseButtonLabel}
                        onClick={onClose}
                        dataTestId="widget-notice-close"
                    />
                ) : null}
            </div>
            {hasDetail && isExpanded ? (
                <div id={detailId} className={e("detail")}>
                    <div className={e("detail-text")}>{detail}</div>
                    {detailAction ? <div className={e("detail-action")}>{detailAction}</div> : null}
                </div>
            ) : null}
        </div>
    );
}
