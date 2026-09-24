// (C) 2026 GoodData Corporation

import { type ReactNode, useId, useRef, useState } from "react";

import { useIntl } from "react-intl";

import { UiButton, UiFocusManager, UiIcon, UiTooltip, getFocusableElements } from "@gooddata/sdk-ui-kit";

interface IRestrictedFiltersNoticeProps {
    count: number;
    size: "regular" | "compact";
    explanation: string;
    onRemove?: () => void;
    dataTestId?: string;
}

/** Shared restricted-filter notice for the dashboard bar and compact analysis controls. */
export function RestrictedFiltersNotice({
    count,
    size,
    explanation,
    onRemove,
    dataTestId = "restricted-filters",
}: IRestrictedFiltersNoticeProps) {
    const intl = useIntl();
    const wrapperRef = useRef<HTMLSpanElement>(null);
    const tooltipId = useId();
    // hovering must not steal the focus, so only a deliberate open moves it into the tooltip
    const [isOpenedForAction, setIsOpenedForAction] = useState(false);

    if (count === 0) {
        return null;
    }

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
            <UiIcon type="lock" size={16} color="complementary-6" layout="block" />
            {noticeText}
        </>
    );

    return (
        // the bar counts its rows by measuring its direct children, so keep the tooltip's own
        // elements inside one of them
        <span className={`gd-restricted-filters gd-restricted-filters--${size}`} ref={wrapperRef}>
            <UiTooltip
                id={tooltipId}
                anchorWrapperStyles={{ display: "flex" }}
                behaviour="popover"
                arrowPlacement="top-start"
                width={300}
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
                    if (type === "screen-reader") {
                        return explanation;
                    }

                    return withFocusInside(
                        <div className="gd-restricted-filters__tooltip">
                            {explanation}
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
                            className="gd-restricted-filters__notice gd-restricted-filters__notice--actionable"
                            data-testid={dataTestId}
                            aria-haspopup="dialog"
                            aria-expanded={isOpenedForAction}
                            aria-describedby={tooltipId}
                            onClick={openForAction}
                        >
                            {notice}
                        </button>
                    ) : (
                        <span
                            className="gd-restricted-filters__notice"
                            role="note"
                            tabIndex={0}
                            aria-label={noticeText}
                            aria-describedby={tooltipId}
                            data-testid={dataTestId}
                        >
                            {notice}
                        </span>
                    )
                }
            />
        </span>
    );
}
