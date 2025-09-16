// (C) 2025 GoodData Corporation

import { MouseEvent, ReactNode, useCallback } from "react";

import cx from "classnames";

import { Button, Typography, UiFocusManager } from "@gooddata/sdk-ui-kit";

import { DateFilterHeader } from "./DateFilterHeader.js";

interface IHeaderProps {
    title: string;
    onHeaderClick: () => void;
    backLabel?: string;
}

function Header({ title, onHeaderClick, backLabel }: IHeaderProps) {
    const onClick = useCallback(
        (e: MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            e.stopPropagation();
            onHeaderClick();
        },
        [onHeaderClick],
    );
    return (
        <div className="header">
            <Button
                className="header-back-button configuration-panel-header-back-button gd-icon-navigateleft"
                onClick={onClick}
                accessibilityConfig={{
                    ariaLabel: backLabel,
                }}
            />
            <Typography tagName="h3" className="header-title" onClick={onHeaderClick}>
                {title}
            </Typography>
        </div>
    );
}

export interface IDateFilterFormNavigationWrapperProps {
    /**
     * The form title to display in the header
     */
    title: string;

    /**
     * Callback when back button is clicked
     */
    onBack: () => void;

    /**
     * The form content to display
     */
    children: ReactNode;

    /**
     * Optional CSS class name
     */
    className?: string;

    /**
     * Optional back label
     */
    backLabel?: string;

    /**
     * Whether the component is mobile
     */
    isMobile?: boolean;
}

/**
 * Navigation wrapper for date filter forms that provides a back button
 * and proper header structure for form views.
 */
export function DateFilterFormNavigationWrapper({
    title,
    onBack,
    children,
    className,
    backLabel = "menu.back",
    isMobile,
}: IDateFilterFormNavigationWrapperProps) {
    return (
        <div
            className={cx(
                "gd-date-filter-form-navigation",

                className,
            )}
        >
            {isMobile ? (
                <DateFilterHeader onBack={onBack} title={title} ariaLabel={backLabel} />
            ) : (
                <Header title={title} onHeaderClick={onBack} backLabel={backLabel} />
            )}
            <UiFocusManager enableAutofocus>
                <div className="gd-date-filter-form-navigation-content">{children}</div>
            </UiFocusManager>
        </div>
    );
}
