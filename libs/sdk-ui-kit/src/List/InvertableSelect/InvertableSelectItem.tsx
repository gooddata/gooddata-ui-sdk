// (C) 2007-2024 GoodData Corporation
import React, { useCallback } from "react";
import { FormattedMessage } from "react-intl";
import cx from "classnames";

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
export interface IInvertableSelectItem {
    title?: string;
    icon?: JSX.Element;
    isSelected?: boolean;
    onMouseOut?: () => void;
    onMouseOver?: () => void;
    onOnly?: () => void;
    onClick?: () => void;
    renderOnly?: (props: IInvertableSelectItemRenderOnlyProps) => JSX.Element;
    isDisabled?: boolean;
}

/**
 * @internal
 */
export function InvertableSelectItem(props: IInvertableSelectItem) {
    const { title, onClick, onMouseOver, onMouseOut, isSelected, onOnly, renderOnly, icon, isDisabled } =
        props;
    const handleOnly = useCallback(
        (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
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
                [`s-${stringUtils.simplifyText(title)}`]: true,
                "has-only-visible": true,
                "is-selected": isSelected,
                "is-disabled": isDisabled,
            })}
            onClick={isDisabled ? () => {} : onClick}
            onMouseOver={onMouseOver}
            onMouseOut={onMouseOut}
        >
            <label className="input-checkbox-label">
                <input
                    type="checkbox"
                    className="input-checkbox"
                    readOnly={true}
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
        </div>
    );
}
