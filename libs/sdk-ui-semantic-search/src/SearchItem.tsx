// (C) 2024-2025 GoodData Corporation

import { type AriaAttributes, type AriaRole, type MouseEvent, type ReactNode } from "react";

import classnames from "classnames";

import { testIds } from "./automation/index.js";

export type SearchItemProps = {
    className?: string;
    children: ReactNode;
    level: number;
    icon: ReactNode;
    details?: ReactNode;
    resultCounter?: ReactNode;
    href?: string;
    isFocused?: boolean;
    ariaAttributes: AriaAttributes & {
        id: string;
        role: AriaRole;
    };
    onClick: (event: MouseEvent) => void;
    onHover: (event: MouseEvent) => void;
};

/**
 * A single result item in the search results.
 * @internal
 */
export function SearchItem({
    className,
    children,
    level,
    isFocused,
    icon,
    details,
    resultCounter,
    href,
    ariaAttributes,
    onClick,
    onHover,
}: SearchItemProps) {
    const handleClick = (event: MouseEvent) => {
        // Only report left and middle clicks
        if (event.button < 2) {
            onClick(event);
        }
    };

    const Tag = href ? "a" : "div";
    const tabIndex = href ? -1 : undefined;
    const wrapperClassName = classnames(className, {
        "gd-semantic-search__results-item": true,
        "gd-semantic-search__results-item--active": isFocused,
    });

    return (
        <div className={wrapperClassName} data-level={level} data-testid={testIds.semanticSearchItem}>
            <Tag
                {...ariaAttributes}
                href={href}
                tabIndex={tabIndex}
                className="gd-semantic-search__results-item__content"
                onClick={handleClick}
                onAuxClick={handleClick}
                onMouseEnter={onHover}
            >
                <span
                    className="gd-semantic-search__results-item__icon"
                    data-testid={testIds.semanticSearchItemIcon}
                >
                    {icon}
                </span>
                <span className="gd-semantic-search__results-item__text">{children}</span>
                <div className="gd-semantic-search__results-item__details-container">
                    {!!isFocused && level === 1 && details}
                    {resultCounter}
                </div>
            </Tag>
        </div>
    );
}
