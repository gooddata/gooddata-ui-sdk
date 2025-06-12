// (C) 2007-2025 GoodData Corporation
import React from "react";
import classnames from "classnames";
import { IMenuContainerAccessibilityConfig } from "../typings/accessibility.js";

/**
 * @internal
 */
export interface IItemsWrapperProps {
    smallItemsSpacing?: boolean;
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    accessibilityConfig?: IMenuContainerAccessibilityConfig;
    wrapperRef?: React.RefObject<HTMLDivElement>;
}

/**
 * @internal
 */
export const ItemsWrapper: React.FC<IItemsWrapperProps> = ({
    smallItemsSpacing = false,
    className,
    children,
    style,
    wrapperRef,
}) => (
    <div
        ref={wrapperRef}
        className={classnames(
            {
                "gd-menu-wrapper": true,
                "gd-menu-wrapper-small-spacing": smallItemsSpacing,
            },
            className,
        )}
        style={style}
    >
        {children}
    </div>
);

/**
 * @internal
 */
export const Separator: React.FC = (props) => (
    <div className="gd-list-item gd-list-item-separator" {...props} />
);

/**
 * @internal
 */
export interface IHeaderProps {
    children: React.ReactNode;
}
/**
 * @internal
 */
export const Header: React.FC<IHeaderProps> = ({ children, ...restProps }) => (
    <div className="gd-list-item gd-list-item-header" {...restProps}>
        {children}
    </div>
);

/**
 * @internal
 */
export interface IItemProps {
    checked?: boolean;
    subMenu?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

/**
 * @internal
 */
export const Item: React.FC<IItemProps> = ({
    checked = false,
    subMenu = false,
    disabled = false,
    className,
    children,
    style,
    onClick,
}) => (
    <div
        className={classnames(
            {
                "gd-list-item": true,
                "gd-menu-item": true,
                "is-checked": checked,
                "is-submenu": subMenu,
                "is-disabled": disabled,
            },
            className,
        )}
        style={style}
        onClick={onClick}
    >
        {children}
    </div>
);
