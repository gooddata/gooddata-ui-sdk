// (C) 2007-2022 GoodData Corporation
import React, { useCallback } from "react";
import cx from "classnames";
import { useIntl } from "react-intl";

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
    const handleToggle = useCallback(
        (_e: React.ChangeEvent<HTMLInputElement>) => {
            onToggle();
        },
        [onToggle],
    );

    const checkboxClasses = cx("input-checkbox", "gd-checkbox-selection", {
        "checkbox-indefinite": isPartialSelection,
    });

    const labelClasses = cx("input-checkbox-label", "s-select-all-checkbox");

    if (!isVisible) {
        return null;
    }

    return (
        <div className="gd-invertable-select-all-checkbox">
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
