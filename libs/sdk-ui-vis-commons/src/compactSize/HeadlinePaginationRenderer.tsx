// (C) 2021-2025 GoodData Corporation
import React from "react";

interface IHeadlinePaginationProps {
    item: number;
    accessibilityConfig?: {
        nextAriaLabel?: string;
        previousAriaLabel?: string;
    };
    showPrevItem: () => void;
    showNextItem: () => void;
}

export const HeadlinePaginationRenderer: React.FC<IHeadlinePaginationProps> = ({
    item,
    accessibilityConfig,
    showPrevItem,
    showNextItem,
}) => {
    const { nextAriaLabel, previousAriaLabel } = accessibilityConfig ?? {};
    const commonClassNames = "gd-button-link gd-button-icon-only pagination";

    const isFirstItemDisabled = item === 1;
    const isSecondItemDisabled = item === 2;

    return (
        <div className="headline-pagination">
            <button
                className={`${commonClassNames} first-item gd-icon-chevron-left`}
                onClick={showPrevItem}
                disabled={isFirstItemDisabled}
                aria-disabled={isFirstItemDisabled}
                aria-label={previousAriaLabel}
            />
            <button
                className={`${commonClassNames} second-item gd-icon-chevron-right`}
                onClick={showNextItem}
                disabled={isSecondItemDisabled}
                aria-disabled={isSecondItemDisabled}
                aria-label={nextAriaLabel}
            />
        </div>
    );
};
