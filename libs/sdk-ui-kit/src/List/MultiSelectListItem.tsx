// (C) 2007-2025 GoodData Corporation

import { type MouseEvent, memo, useCallback, useMemo } from "react";

import cx from "classnames";
import { FormattedMessage } from "react-intl";

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
    const classNames = useMemo(() => {
        return cx({
            "gd-list-item": true,
            [`s-${stringUtils.simplifyText(title ?? "")}`]: true,
            "has-only-visible": true,
            "is-selected": isSelected,
        });
    }, [title, isSelected]);

    const handleOnlyClick = useCallback(
        (e: MouseEvent) => {
            e.stopPropagation();
            if (onOnly) {
                onOnly();
            }
        },
        [onOnly],
    );

    const renderOnly = useCallback(() => {
        return (
            <span className="gd-list-item-only" onClick={handleOnlyClick}>
                <FormattedMessage id="gs.list.only" />
            </span>
        );
    }, [handleOnlyClick]);

    return (
        <div className={classNames} onClick={onClick} onMouseOver={onMouseOver} onMouseOut={onMouseOut}>
            <label className="input-checkbox-label">
                <input type="checkbox" className="input-checkbox" readOnly checked={isSelected} />
                <span className="input-label-text">{title}</span>
            </label>
            {renderOnly()}
        </div>
    );
});
