// (C) 2007-2025 GoodData Corporation
import React, { memo } from "react";
import { FormattedMessage } from "react-intl";
import cx from "classnames";

import { stringUtils } from "@gooddata/util";

/**
 * @internal
 */
export interface IMultiSelectListItemProps {
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
export const MultiSelectListItem = memo(function MultiSelectListItem({
    title,
    onClick,
    onMouseOver,
    onMouseOut,
    isSelected,
    onOnly,
}: IMultiSelectListItemProps) {
    const getClassNames = () => {
        return cx({
            "gd-list-item": true,
            [`s-${stringUtils.simplifyText(title)}`]: true,
            "has-only-visible": true,
            "is-selected": isSelected,
        });
    };

    const renderOnly = () => {
        return (
            <span
                className="gd-list-item-only"
                onClick={(e) => {
                    e.stopPropagation();
                    if (onOnly) {
                        onOnly();
                    }
                }}
            >
                <FormattedMessage id="gs.list.only" />
            </span>
        );
    };

    return (
        <div className={getClassNames()} onClick={onClick} onMouseOver={onMouseOver} onMouseOut={onMouseOut}>
            <label className="input-checkbox-label">
                <input type="checkbox" className="input-checkbox" readOnly={true} checked={isSelected} />
                <span className="input-label-text">{title}</span>
            </label>
            {renderOnly()}
        </div>
    );
});
