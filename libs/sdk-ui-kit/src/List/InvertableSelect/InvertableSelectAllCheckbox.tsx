// (C) 2007-2025 GoodData Corporation

import { KeyboardEvent, useRef } from "react";

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
export function InvertableSelectAllCheckbox({
    isVisible,
    checked,
    onToggle,
    onApplyButtonClick,
    isApplyDisabled,
    isFiltered,
    totalItemsCount,
    isPartialSelection,
}: IInvertableSelectAllCheckboxProps) {
    const intl = useIntl();
    const itemRef = useRef<HTMLDivElement>(null);

    const onClick = () => {
        onToggle();
    };

    const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        event.preventDefault(); // Prevent scrolling
        if (isSpaceKey(event)) {
            onToggle();
        }
        if (isEnterKey(event) && !isApplyDisabled) {
            onApplyButtonClick();
        }
    };

    const wrapperClasses = cx("gd-invertable-select-all-checkbox-wrapper", "input-checkbox-label");

    const controlsId = ListWithActionsFocusStore.useContextStoreOptional((ctx) => ctx.containerId);

    const ariaLabel = isFiltered
        ? intl.formatMessage({ id: "gs.list.allSearchResultsAndCount" }, { count: totalItemsCount })
        : intl.formatMessage({ id: "gs.list.allAndCount" }, { count: totalItemsCount });

    if (!isVisible) {
        return null;
    }

    return (
        <div
            className="gd-invertable-select-all-checkbox s-select-all-checkbox"
            ref={itemRef}
            tabIndex={0}
            onClick={onClick}
            onKeyDown={onKeyDown}
            role="checkbox"
            aria-checked={isPartialSelection ? "mixed" : checked}
            aria-controls={controlsId}
            aria-label={ariaLabel}
        >
            <span className={wrapperClasses}>
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
            </span>
        </div>
    );
}
