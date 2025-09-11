// (C) 2007-2025 GoodData Corporation

import React, { useCallback, useRef } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import { ListWithActionsFocusStore } from "../../@ui/hooks/useListWithActionsFocus.js";
import { isEnterKey, isSpaceKey } from "../../utils/events.js";

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
    onApplyButtonClick?: () => void;
    isApplyDisabled?: boolean;
}

/**
 * @internal
 */
export function InvertableSelectAllCheckbox(props: IInvertableSelectAllCheckboxProps) {
    const {
        isVisible,
        checked,
        onToggle,
        onApplyButtonClick,
        isApplyDisabled,
        isFiltered,
        totalItemsCount,
        isPartialSelection,
    } = props;

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
        event.preventDefault(); // Prevent scrolling
        if (isSpaceKey(event)) {
            onToggle();
        }
        if (isEnterKey(event) && !isApplyDisabled) {
            onApplyButtonClick();
        }
    };

    const checkboxClasses = cx("input-checkbox", "gd-checkbox-selection", {
        "checkbox-indefinite": isPartialSelection,
    });

    const labelClasses = cx("input-checkbox-label", "s-select-all-checkbox");

    const controlsId = ListWithActionsFocusStore.useContextStoreOptional((ctx) => ctx.containerId);

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
            role="checkbox"
            aria-checked={isPartialSelection ? "mixed" : checked}
            aria-controls={controlsId}
        >
            <label className={labelClasses}>
                <input
                    readOnly={true}
                    type="checkbox"
                    className={checkboxClasses}
                    checked={checked}
                    onChange={handleToggle}
                    aria-hidden={true}
                    role={"presentation"}
                    tabIndex={-1}
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
