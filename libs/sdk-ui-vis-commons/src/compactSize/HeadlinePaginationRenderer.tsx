// (C) 2021 GoodData Corporation
import React from "react";

interface IHeadlinePaginationProps {
    item: number;
    showPrevItem: () => void;
    showNextItem: () => void;
}

export const HeadlinePaginationRenderer: React.FC<IHeadlinePaginationProps> = ({
    item,
    showPrevItem,
    showNextItem,
}) => {
    const commonClassNames = "gd-button-link gd-button-icon-only pagination";

    return (
        <div className="headline-pagination">
            <button
                className={`${commonClassNames} first-item gd-icon-chevron-left`}
                onClick={showPrevItem}
                disabled={item === 1}
            />
            <button
                className={`${commonClassNames} second-item gd-icon-chevron-right`}
                onClick={showNextItem}
                disabled={item === 2}
            />
        </div>
    );
};
