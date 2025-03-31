// (C) 2007-2025 GoodData Corporation
import React, { useCallback, useRef } from "react";
import cx from "classnames";
import { useIntl } from "react-intl";
import { isSpaceKey } from "../../utils/events.js";

/**
 * @internal
 */
export interface IInvertableSelectAllCheckboxProps {
    checked: boolean;
    onChange: (value: boolean) => void;
    onToggle: () => void;
    isFiltered: boolean;
    totalItemsCount: number;
    isPartialSelection: boolean;
    isVisible: boolean;
}

/**
 * @internal
 */
export function InvertableSelectAllCheckbox(props: IInvertableSelectAllCheckboxProps) {
    const { isVisible, checked, onToggle, isFiltered, totalItemsCount, isPartialSelection } = props;

    const intl = useIntl();
    const itemRef = useRef<HTMLDivElement>(null);

    const handleToggle = useCallback(
        (_e: React.ChangeEvent<HTMLInputElement>) => {
            onToggle();
        },
        [onToggle],
    );

    const onFocus = (event: React.FocusEvent<HTMLDivElement>) => {
        // Prevent focus from moving from item inside to the checkbox
        if (event.target.tagName === "INPUT") {
            event.preventDefault();
            itemRef.current?.focus(); // Keep focus on the item
        }
    };

    const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (isSpaceKey(event)) {
            event.preventDefault(); // Prevent scrolling on Space
            onToggle();
        }
    };

    const checkboxClasses = cx("input-checkbox", "gd-checkbox-selection", {
        "checkbox-indefinite": isPartialSelection,
    });

    const labelClasses = cx("input-checkbox-label", "s-select-all-checkbox");

    if (!isVisible) {
        return null;
    }

    return (
        <div
            className="gd-invertable-select-all-checkbox"
            ref={itemRef}
            tabIndex={0}
            onFocus={onFocus}
            onKeyDown={onKeyDown}
            role="option"
        >
            <label className={labelClasses}>
                <input
                    readOnly={true}
                    type="checkbox"
                    className={checkboxClasses}
                    checked={checked}
                    onChange={handleToggle}
                />
                <span className="input-label-text">
                    <span className={cx("gd-list-all-checkbox", { "gd-list-all-checkbox-checked": checked })}>
                        {intl.formatMessage({ id: "gs.list.all" })}
                        {isFiltered
                            ? ` ${intl.formatMessage({
                                  id: "gs.list.searchResults",
                              })}`
                            : null}
                    </span>
                    <span className="gd-list-actions-selection-size s-list-search-selection-size">{`(${totalItemsCount})`}</span>
                </span>
            </label>
        </div>
    );
}
