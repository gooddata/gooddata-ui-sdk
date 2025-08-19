// (C) 2007-2025 GoodData Corporation
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
    showSelectionStatus?: boolean;
}

/**
 * @internal
 */
export function InvertableSelectStatusBar<T>(props: IInvertableSelectStatusBarProps<T>) {
    const {
        className,
        selectedItems,
        getItemTitle,
        isInverted,
        selectedItemsLimit,
        showSelectionStatus = true,
    } = props;

    return (
        <>
            {showSelectionStatus ? (
                <div
                    className={cx([className, "gd-invertable-select-selection-status", "s-list-status-bar"])}
                >
                    <InvertableSelectStatus
                        selectedItems={selectedItems}
                        getItemTitle={getItemTitle}
                        isInverted={isInverted}
                    />
                </div>
            ) : null}
            {selectedItems.length >= selectedItemsLimit ? (
                <InvertableSelectLimitWarning
                    limit={selectedItemsLimit}
                    selectedItemsCount={selectedItems.length}
                />
            ) : null}
        </>
    );
}
