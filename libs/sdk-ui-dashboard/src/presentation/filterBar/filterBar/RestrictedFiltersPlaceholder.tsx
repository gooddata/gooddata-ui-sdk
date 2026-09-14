// (C) 2026 GoodData Corporation

import { type ReactNode, useRef, useState } from "react";

import { FormattedMessage, useIntl } from "react-intl";

import { UiButton, UiFocusManager, UiTooltip, getFocusableElements } from "@gooddata/sdk-ui-kit";

/**
 * Props of the component reporting the dashboard filters that could not be applied.
 *
 * @alpha
 */
export interface IRestrictedFiltersPlaceholderProps {
    /** How many filters were left out of the dashboard. */
    count: number;

    /** Removes the filters from the dashboard for good; absent unless the dashboard is being edited. */
    onRemove?: () => void;
}

/**
 * Reports filters left out because the current user may not read the objects they filter by.
 */
export function RestrictedFiltersPlaceholder({ count, onRemove }: IRestrictedFiltersPlaceholderProps) {
    const intl = useIntl();
    const wrapperRef = useRef<HTMLSpanElement>(null);
    // hovering must not steal the focus, so only a deliberate open moves it into the tooltip
    const [isOpenedForAction, setIsOpenedForAction] = useState(false);

    const openForAction = () => setIsOpenedForAction(true);

    const withFocusInside = (content: ReactNode, onClose: () => void) =>
        isOpenedForAction ? (
            <UiFocusManager
                enableAutofocus
                enableReturnFocusOnUnmount
                tabOutHandler={() => {
                    setIsOpenedForAction(false);
                    onClose();
                }}
            >
                {content}
            </UiFocusManager>
        ) : (
            content
        );

    // the notice goes away with the filters it reports, so the focus has to move out of it first
    const focusNextControl = () => {
        const wrapper = wrapperRef.current;
        const { focusableElements } = getFocusableElements(wrapper?.parentElement);
        focusableElements.find((element) => !wrapper?.contains(element))?.focus();
    };

    const noticeText = intl.formatMessage({ id: "filterBar.restrictedFilters" }, { count });

    const notice = (
        <>
            <span className="gd-icon-lock" />
            {noticeText}
        </>
    );

    return (
        // the bar counts its rows by measuring its direct children, so keep the tooltip's own
        // elements inside one of them
        <span className="dash-filters-restricted" ref={wrapperRef}>
            <UiTooltip
                anchorWrapperStyles={{ display: "flex", flex: 1 }}
                accessibilityConfig={
                    isOpenedForAction ? { role: "dialog", ariaLabel: noticeText } : undefined
                }
                triggerBy={onRemove ? ["hover", "focus", "click"] : ["hover", "focus"]}
                onOpenChange={(open) => {
                    if (!open) {
                        setIsOpenedForAction(false);
                    }
                }}
                content={({ onClose, type }) => {
                    const reason = (
                        <FormattedMessage id="filterBar.restrictedFilters.reason" values={{ count }} />
                    );
                    if (type === "screen-reader") {
                        return reason;
                    }

                    return withFocusInside(
                        <div className="dash-filters-restricted-tooltip">
                            {reason}
                            {onRemove ? (
                                <UiButton
                                    variant="tooltip"
                                    size="small"
                                    label={intl.formatMessage({ id: "filterBar.restrictedFilters.remove" })}
                                    onClick={() => {
                                        focusNextControl();
                                        onClose();
                                        onRemove();
                                    }}
                                />
                            ) : null}
                        </div>,
                        onClose,
                    );
                }}
                anchor={
                    onRemove ? (
                        <button
                            type="button"
                            className="dash-filters-restricted-notice dash-filters-restricted-notice--actionable"
                            data-testid="restricted-filters"
                            aria-haspopup="dialog"
                            onClick={openForAction}
                        >
                            {notice}
                        </button>
                    ) : (
                        <span
                            className="dash-filters-restricted-notice"
                            tabIndex={0}
                            data-testid="restricted-filters"
                        >
                            {notice}
                        </span>
                    )
                }
            />
        </span>
    );
}
