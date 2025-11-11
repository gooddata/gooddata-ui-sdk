// (C) 2024-2025 GoodData Corporation

import { AriaAttributes, AriaRole, MouseEvent, ReactNode } from "react";

import classnames from "classnames";

import * as styles from "./SearchItem.module.scss.js";

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
    const wrapperClassName = classnames(className, styles.resultsItem, isFocused && styles.resultsItemActive);

    return (
        <div className={wrapperClassName} data-level={level} data-testid="semantic-search-results-item">
            <Tag
                {...ariaAttributes}
                href={href}
                tabIndex={tabIndex}
                className={styles.content}
                onClick={handleClick}
                onAuxClick={handleClick}
                onMouseEnter={onHover}
            >
                <span className={styles.icon}>{icon}</span>
                <span className={styles.text}>{children}</span>
                <div className={styles.detailsContainer}>
                    {!!isFocused && level === 1 && details}
                    {resultCounter}
                </div>
            </Tag>
        </div>
    );
}
