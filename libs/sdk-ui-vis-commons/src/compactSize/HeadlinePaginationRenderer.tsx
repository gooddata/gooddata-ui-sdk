// (C) 2021-2025 GoodData Corporation
import { useCallback } from "react";
import cx from "classnames";

interface IHeadlinePaginationProps {
    item: number;
    accessibilityConfig?: {
        nextAriaLabel?: string;
        previousAriaLabel?: string;
    };
    showPrevItem: () => void;
    showNextItem: () => void;
}

export function HeadlinePaginationRenderer({
    item,
    accessibilityConfig,
    showPrevItem,
    showNextItem,
}: IHeadlinePaginationProps) {
    const { nextAriaLabel, previousAriaLabel } = accessibilityConfig ?? {};
    const commonClassNames = "gd-button-link gd-button-icon-only pagination";

    const isFirstItemDisabled = item === 1;
    const isSecondItemDisabled = item === 2;

    const handleFirstItemClick = useCallback(() => {
        if (!isFirstItemDisabled) {
            showPrevItem();
        }
    }, [isFirstItemDisabled, showPrevItem]);

    const handleSecondItemClick = useCallback(() => {
        if (!isSecondItemDisabled) {
            showNextItem();
        }
    }, [isSecondItemDisabled, showNextItem]);

    return (
        <div className="headline-pagination">
            <button
                className={cx(`${commonClassNames} first-item gd-icon-chevron-left`, {
                    "is-disabled": isFirstItemDisabled,
                })}
                onClick={handleFirstItemClick}
                aria-disabled={isFirstItemDisabled}
                aria-label={previousAriaLabel}
            />
            <button
                className={cx(`${commonClassNames} second-item gd-icon-chevron-right`, {
                    "is-disabled": isSecondItemDisabled,
                })}
                onClick={handleSecondItemClick}
                aria-disabled={isSecondItemDisabled}
                aria-label={nextAriaLabel}
            />
        </div>
    );
}
