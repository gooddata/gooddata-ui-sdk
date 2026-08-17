// (C) 2020-2026 GoodData Corporation

import { type MouseEvent, type ReactNode } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import { useTheme } from "@gooddata/sdk-ui-theme-provider";

import { Icon } from "../Icon/Icon.js";

/**
 * @internal
 */
export interface IWorkspacePickerHomeFooterProps {
    href?: string;
    onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
    className?: string;
    children?: ReactNode;
}

/**
 * @internal
 */
export function WorkspacePickerHomeFooter({
    children,
    className,
    href,
    onClick,
}: IWorkspacePickerHomeFooterProps) {
    const intl = useIntl();
    const theme = useTheme();
    const mergedClassNames = cx("gd-workspace-picker-home-footer", className);

    const HomeIcon = Icon["Home"];

    return (
        <a
            className={mergedClassNames}
            data-testid="s-workspace-picker-home-footer"
            href={href}
            onClick={onClick}
            tabIndex={0}
            aria-label={intl.formatMessage({ id: "gs.header.href.accessibility" })}
        >
            <HomeIcon
                className="gd-icon-home"
                width={20}
                height={20}
                color={theme?.palette?.complementary?.c7}
                ariaHidden
            />
            {children}
        </a>
    );
}
