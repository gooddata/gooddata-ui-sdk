// (C) 2007-2020 GoodData Corporation
import React from "react";
import classnames from "classnames";

/**
 * @internal
 */
export interface IItemsWrapperProps {
    smallItemsSpacing?: boolean;
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
}
/**
 * @internal
 */
export const ItemsWrapper: React.FC<IItemsWrapperProps> = ({ smallItemsSpacing, children, ...restProps }) => (
    <div
        className={classnames({
            "gd-menu-wrapper": true,
            "gd-menu-wrapper-small-spacing": smallItemsSpacing,
        })}
        {...restProps}
    >
        {children}
    </div>
);
ItemsWrapper.defaultProps = {
    smallItemsSpacing: false,
};

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
export const Item: React.FC<IItemProps> = ({ checked, subMenu, disabled, children, ...restProps }) => (
    <div
        className={classnames({
            "gd-list-item": true,
            "gd-menu-item": true,
            "is-checked": checked,
            "is-submenu": subMenu,
            "is-disabled": disabled,
        })}
        {...restProps}
    >
        {children}
    </div>
);
Item.defaultProps = {
    checked: false,
    subMenu: false,
    disabled: false,
};
