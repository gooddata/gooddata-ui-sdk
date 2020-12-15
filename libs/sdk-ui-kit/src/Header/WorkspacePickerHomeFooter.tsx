// (C) 2020 GoodData Corporation
import React from "react";
import cx from "classnames";

/**
 * @internal
 */
export interface IWorkspacePickerHomeFooterProps {
    href: string;
    className?: string;
}
/**
 * @internal
 */
export const WorkspacePickerHomeFooter: React.FC<IWorkspacePickerHomeFooterProps> = ({
    children,
    className,
    href,
}) => {
    const mergedClassNames = cx("gd-workspace-picker-home-footer", className);
    return (
        <a className={mergedClassNames} href={href}>
            {children}
        </a>
    );
};
