// (C) 2007-2024 GoodData Corporation
import React from "react";
import cx from "classnames";
import { InvertableSelectLimitWarning } from "./InvertableSelectLimitWarning.js";
import { InvertableSelectStatus } from "./InvertableSelectSelectionStatus.js";
/**
 * @internal
 */
export interface IInvertableSelectStatusBarProps<T> {
    className?: string;
    isInverted: boolean;
    selectedItems: T[];
    getItemTitle: (item: T) => string;
    selectedItemsLimit: number;
}

/**
 * @internal
 */
export function InvertableSelectStatusBar<T>(props: IInvertableSelectStatusBarProps<T>) {
    const { className, selectedItems, getItemTitle, isInverted, selectedItemsLimit } = props;

    return (
        <>
            <div className={cx([className, "gd-invertable-select-selection-status", "s-list-status-bar"])}>
                <InvertableSelectStatus
                    selectedItems={selectedItems}
                    getItemTitle={getItemTitle}
                    isInverted={isInverted}
                />
            </div>
            {selectedItems.length >= selectedItemsLimit ? (
                <InvertableSelectLimitWarning
                    limit={selectedItemsLimit}
                    selectedItemsCount={selectedItems.length}
                />
            ) : null}
        </>
    );
}
