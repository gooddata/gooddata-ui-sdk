// (C) 2024-2025 GoodData Corporation

import React from "react";
import classnames from "classnames";

export type SearchItemProps = {
    className?: string;
    children: React.ReactNode;
    ariaLabel: string;
    level: number;
    icon: React.ReactNode;
    details?: React.ReactNode;
    resultCounter?: React.ReactNode;
    href?: string;
    isFocused?: boolean;
    onClick: (event: React.MouseEvent) => void;
    onHover: (event: React.MouseEvent) => void;
};

/**
 * A single result item in the search results.
 * @internal
 */
export const SearchItem = ({
    className,
    children,
    ariaLabel,
    level,
    isFocused,
    icon,
    details,
    resultCounter,
    href,
    onClick,
    onHover,
}: SearchItemProps) => {
    const handleClick = (event: React.MouseEvent) => {
        // Only report left and middle clicks
        if (event.button < 2) {
            onClick(event);
        }
    };

    const Tag = href ? "a" : "div";
    const wrapperClassName = classnames(className, {
        "gd-semantic-search__results-item": true,
        "gd-semantic-search__results-item--active": isFocused,
    });

    return (
        <div className={wrapperClassName} data-level={level}>
            <Tag
                aria-label={ariaLabel}
                href={href}
                className="gd-semantic-search__results-item__content"
                onClick={handleClick}
                onAuxClick={handleClick}
                onMouseEnter={onHover}
            >
                <span className="gd-semantic-search__results-item__icon">{icon}</span>
                <span className="gd-semantic-search__results-item__text">{children}</span>
                <div className="gd-semantic-search__results-item__details-container">
                    {!!isFocused && level === 1 && details}
                    {resultCounter}
                </div>
            </Tag>
        </div>
    );
};
