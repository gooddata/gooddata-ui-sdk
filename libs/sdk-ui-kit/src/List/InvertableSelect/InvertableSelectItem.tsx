// (C) 2007-2025 GoodData Corporation

import { MouseEvent, ReactElement, RefObject, useCallback } from "react";

import cx from "classnames";
import { FormattedMessage } from "react-intl";

import { stringUtils } from "@gooddata/util";

/**
 * @internal
 */
export interface IInvertableSelectItemRenderOnlyProps {
    onOnly?: () => void;
}

/**
 * @internal
 */
export interface IInvertableSelectItemAccessibilityConfig {
    ariaLabelledBy?: string;
}

/**
 * @internal
 */
export interface IInvertableSelectItem {
    title?: string;
    icon?: ReactElement;
    isSelected?: boolean;
    onMouseOut?: () => void;
    onMouseOver?: () => void;
    onOnly?: () => void;
    onClick?: () => void;
    renderOnly?: (props: IInvertableSelectItemRenderOnlyProps) => ReactElement;
    renderRight?: () => ReactElement | null;
    isDisabled?: boolean;
    listRef?: RefObject<HTMLElement>;
    accessibilityConfig?: IInvertableSelectItemAccessibilityConfig;
}

/**
 * @internal
 */
export function InvertableSelectItem({
    title,
    onClick,
    onMouseOver,
    onMouseOut,
    isSelected,
    onOnly,
    renderOnly,
    renderRight,
    icon,
    isDisabled,
    accessibilityConfig,
}: IInvertableSelectItem) {
    const handleOnly = useCallback(
        (e: MouseEvent<HTMLSpanElement>) => {
            if (isDisabled) {
                return;
            }
            e.stopPropagation();
            onOnly?.();
        },
        [onOnly, isDisabled],
    );

    return (
        <div
            className={cx({
                "gd-list-item": true,
                [`s-${stringUtils.simplifyText(title ?? "")}`]: true,
                "has-only-visible": true,
                "is-selected": isSelected,
                "is-disabled": isDisabled,
            })}
            onClick={isDisabled ? () => {} : onClick}
            aria-labelledby={accessibilityConfig?.ariaLabelledBy}
            onMouseOver={onMouseOver}
            onMouseOut={onMouseOut}
        >
            <label className="input-checkbox-label">
                <input
                    type="checkbox"
                    className="input-checkbox"
                    readOnly
                    checked={isSelected}
                    disabled={isDisabled}
                />
                {icon ?? null}
                <span className="input-label-text">{title}</span>
            </label>
            {renderOnly?.({ onOnly: onOnly }) ?? (
                <span className="gd-list-item-only" onClick={handleOnly}>
                    <FormattedMessage id="gs.list.only" />
                </span>
            )}
            {renderRight?.()}
        </div>
    );
}
