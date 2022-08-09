// (C) 2007-2022 GoodData Corporation
import React, { useCallback } from "react";
import { FormattedMessage } from "react-intl";
import cx from "classnames";

import { stringUtils } from "@gooddata/util";

/**
 * @internal
 */
export interface IInvertableSelectItem {
    title?: string;
    isSelected?: boolean;
    onMouseOut?: () => void;
    onMouseOver?: () => void;
    onOnly?: () => void;
    onClick?: () => void;
}

/**
 * @internal
 */
export function InvertableSelectItem(props: IInvertableSelectItem) {
    const { title, onClick, onMouseOver, onMouseOut, isSelected, onOnly } = props;
    const handleOnly = useCallback(
        (e: React.MouseEvent<HTMLSpanElement, MouseEvent>) => {
            e.stopPropagation();
            onOnly?.();
        },
        [onOnly],
    );

    return (
        <div
            className={cx({
                "gd-list-item": true,
                [`s-${stringUtils.simplifyText(title)}`]: true,
                "has-only-visible": true,
                "is-selected": isSelected,
            })}
            onClick={onClick}
            onMouseOver={onMouseOver}
            onMouseOut={onMouseOut}
        >
            <label className="input-checkbox-label">
                <input type="checkbox" className="input-checkbox" readOnly={true} checked={isSelected} />
                <span className="input-label-text">{title}</span>
            </label>
            {
                <span className="gd-list-item-only" onClick={handleOnly}>
                    <FormattedMessage id="gs.list.only" />
                </span>
            }
        </div>
    );
}
