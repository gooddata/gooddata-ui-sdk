// (C) 2020-2025 GoodData Corporation
import React from "react";
import cx from "classnames";
import { ITheme } from "@gooddata/sdk-model";
import { withTheme } from "@gooddata/sdk-ui-theme-provider";

import { Icon } from "../Icon/index.js";

/**
 * @internal
 */
export interface IWorkspacePickerHomeFooterProps {
    href?: string;
    onClick?: (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
    className?: string;
    theme?: ITheme;
    children?: React.ReactNode;
}

const WorkspacePickerHomeFooterComponent: React.FC<IWorkspacePickerHomeFooterProps> = ({
    children,
    className,
    href,
    onClick,
    theme,
}) => {
    const mergedClassNames = cx("gd-workspace-picker-home-footer", className);

    return (
        <a
            className={mergedClassNames}
            data-testid="s-workspace-picker-home-footer"
            href={href}
            onClick={onClick}
        >
            <Icon.Home
                className="gd-icon-home"
                width={20}
                height={20}
                color={theme?.palette?.complementary?.c7}
                ariaHidden={true}
            />
            {children}
        </a>
    );
};

/**
 * @internal
 */
export const WorkspacePickerHomeFooter = withTheme(WorkspacePickerHomeFooterComponent);
