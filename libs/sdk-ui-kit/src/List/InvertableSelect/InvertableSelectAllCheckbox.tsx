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

    isFiltered: boolean;
    loadedItemsCount: number;
    totalItemsCount: number;

    isPartialSelection: boolean;
}

/**
 * @internal
 */
export function InvertableSelectAllCheckbox(props: IInvertableSelectAllCheckboxProps) {
    const { checked, onChange, isFiltered, loadedItemsCount, totalItemsCount, isPartialSelection } = props;

    const intl = useIntl();

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            onChange(e.target.checked);
        },
        [onChange],
    );

    const checkboxClasses = cx("input-checkbox", "gd-checkbox-selection", {
        "checkbox-indefinite": isPartialSelection,
    });

    const labelClasses = cx("input-checkbox-label", "s-select-all-checkbox");

    return (
        <label className={labelClasses}>
            <input
                readOnly={true}
                type="checkbox"
                className={checkboxClasses}
                checked={checked}
                onChange={handleChange}
            />
            <span className="input-label-text">
                <span
                    className={cx(
                        "gd-list-all-checkbox gd-list-actions-selection-size s-list-search-selection-size",
                        { "gd-list-all-checkbox-checked": checked },
                    )}
                >
                    {intl.formatMessage({ id: "gs.list.all" })}
                    {isFiltered &&
                        ` ${intl.formatMessage({
                            id: "gs.list.searchResults",
                        })}`}
                </span>
                <span>{` (${
                    isFiltered && loadedItemsCount < totalItemsCount ? loadedItemsCount + "/" : ""
                }${totalItemsCount})`}</span>
            </span>
        </label>
    );
}
