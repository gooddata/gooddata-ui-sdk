// (C) 2025 GoodData Corporation

import { ReactNode } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import { UiFocusManager, UiSubmenuHeader } from "@gooddata/sdk-ui-kit";

import { DateFilterHeader } from "./DateFilterHeader.js";

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
    backLabel,
    isMobile,
}: IDateFilterFormNavigationWrapperProps) {
    const intl = useIntl();
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
                <UiSubmenuHeader
                    title={title}
                    onBack={() => onBack()}
                    backAriaLabel={backLabel ?? intl.formatMessage({ id: "menu.back" })}
                    useShortenedTitle={false}
                />
            )}
            <UiFocusManager enableAutofocus>
                <div className="gd-date-filter-form-navigation-content">{children}</div>
            </UiFocusManager>
        </div>
    );
}
