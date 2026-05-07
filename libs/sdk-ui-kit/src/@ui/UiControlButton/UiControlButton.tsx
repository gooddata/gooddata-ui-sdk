// (C) 2026 GoodData Corporation

import { type KeyboardEvent, type ReactNode, type Ref } from "react";

import cx from "classnames";

import { ShortenedText } from "../../ShortenedText/ShortenedText.js";
import { type IAlignPoint } from "../../typings/positioning.js";
import { isActionKey } from "../../utils/events.js";
import { useIdPrefixed } from "../../utils/useId.js";
import { bem } from "../@utils/bem.js";
import { UiTooltip } from "../UiTooltip/UiTooltip.js";

const { b, e } = bem("gd-ui-kit-control-button");

const TITLE_TOOLTIP_ALIGN_POINTS: IAlignPoint[] = [
    { align: "tc bc", offset: { x: 0, y: -2 } },
    { align: "cc tc", offset: { x: 0, y: 10 } },
    { align: "bl tr", offset: { x: -2, y: -8 } },
];

/**
 * @internal
 */
export interface IUiControlButtonProps {
    title: string;
    titleClassName?: string;
    subtitle?: ReactNode;
    icon?: ReactNode;
    titleExtension?: ReactNode;
    subtitleExtension?: ReactNode;
    isOpen?: boolean;
    isDraggable?: boolean;
    isDragging?: boolean;
    isError?: boolean;
    disabled?: boolean;
    /**
     * Already-localized string. When set together with `disabled`, a tooltip is wired up and
     * `aria-describedby` points at it.
     */
    disabledTooltip?: string;
    onClick?: () => void;
    className?: string;
    "data-testid"?: string;
    buttonRef?: Ref<HTMLDivElement>;
    buttonId?: string;
    dropdownId?: string;
}

/**
 * Generic chip-shaped dropdown trigger primitive. One source of truth for filter-bar chip
 * visuals; consumed by both attribute filter chips and parameter chips.
 *
 * Owns: layout, visual states, keyboard activation, ARIA contract.
 *
 * Does NOT own: lifecycle states (loading/filtering), count display, error-icon swap, domain i18n.
 *
 * @internal
 */
export function UiControlButton({
    title,
    titleClassName,
    subtitle,
    icon,
    titleExtension,
    subtitleExtension,
    isOpen,
    isDraggable,
    isDragging,
    isError,
    disabled,
    disabledTooltip,
    onClick,
    className,
    "data-testid": dataTestId,
    buttonRef,
    buttonId,
    dropdownId,
}: IUiControlButtonProps) {
    const tooltipId = useIdPrefixed("gd-ui-kit-control-button-tooltip");
    const showDisabledTooltip = !!disabled && !!disabledTooltip;

    const onKeyDown = (event: KeyboardEvent) => {
        if (!isActionKey(event)) {
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        if (disabled) {
            return;
        }
        onClick?.();
    };

    const button = (
        <div
            id={buttonId}
            ref={buttonRef}
            className={cx(
                b({
                    isOpen: !!isOpen,
                    isDraggable: !!isDraggable,
                    isDragging: !!isDragging,
                    isError: !!isError,
                    disabled: !!disabled,
                }),
                className,
            )}
            role="button"
            tabIndex={0}
            aria-haspopup="dialog"
            aria-expanded={isOpen}
            aria-disabled={disabled}
            aria-controls={isOpen ? dropdownId : undefined}
            aria-describedby={showDisabledTooltip ? tooltipId : undefined}
            data-testid={dataTestId}
            onClick={disabled ? undefined : onClick}
            onKeyDown={onKeyDown}
        >
            {icon ? <div className={e("icon")}>{icon}</div> : null}
            <div className={e("content")}>
                <div className={e("title-row")}>
                    <div className={e("title")}>
                        <ShortenedText
                            tooltipAlignPoints={TITLE_TOOLTIP_ALIGN_POINTS}
                            className={titleClassName}
                        >
                            {title}
                        </ShortenedText>
                    </div>
                    {titleExtension}
                </div>
                {subtitle === undefined && subtitleExtension === undefined ? null : (
                    <div className={e("subtitle-row")}>
                        {typeof subtitle === "string" ? (
                            <span className={e("subtitle")}>{subtitle}</span>
                        ) : (
                            subtitle
                        )}
                        {subtitleExtension}
                    </div>
                )}
            </div>
        </div>
    );

    if (showDisabledTooltip) {
        return (
            <UiTooltip
                id={tooltipId}
                anchor={button}
                content={disabledTooltip}
                triggerBy={["focus"]}
                arrowPlacement="top"
                showArrow
            />
        );
    }

    return button;
}
