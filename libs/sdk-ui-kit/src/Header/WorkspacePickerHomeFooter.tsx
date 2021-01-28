// (C) 2020 GoodData Corporation
import React from "react";
import cx from "classnames";

/**
 * @internal
 */
export interface IWorkspacePickerHomeFooterProps {
    href?: string;
    onClick?: (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
    className?: string;
}
/**
 * @internal
 */
export const WorkspacePickerHomeFooter: React.FC<IWorkspacePickerHomeFooterProps> = ({
    children,
    className,
    href,
    onClick,
}) => {
    const mergedClassNames = cx("gd-workspace-picker-home-footer", className);
    return (
        <a className={mergedClassNames} href={href} onClick={onClick}>
            {children}
        </a>
    );
};
