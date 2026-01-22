// (C) 2020-2025 GoodData Corporation

import { type MouseEvent, type ReactNode } from "react";

import cx from "classnames";

import { type ITheme } from "@gooddata/sdk-model";
import { withTheme } from "@gooddata/sdk-ui-theme-provider";

import { Icon } from "../Icon/Icon.js";

/**
 * @internal
 */
export interface IWorkspacePickerHomeFooterProps {
    href?: string;
    onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
    className?: string;
    theme?: ITheme;
    children?: ReactNode;
}

function WorkspacePickerHomeFooterComponent({
    children,
    className,
    href,
    onClick,
    theme,
}: IWorkspacePickerHomeFooterProps) {
    const mergedClassNames = cx("gd-workspace-picker-home-footer", className);

    const HomeIcon = Icon["Home"];

    return (
        <a
            className={mergedClassNames}
            data-testid="s-workspace-picker-home-footer"
            href={href}
            onClick={onClick}
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

/**
 * @internal
 */
export const WorkspacePickerHomeFooter = withTheme(WorkspacePickerHomeFooterComponent);
