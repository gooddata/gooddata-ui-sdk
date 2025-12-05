// (C) 2007-2025 GoodData Corporation

import { CSSProperties, HTMLAttributes, MouseEvent, ReactNode, RefObject } from "react";

import classnames from "classnames";

import { IMenuContainerAccessibilityConfig } from "../typings/accessibility.js";

/**
 * @internal
 */
export interface IItemsWrapperProps {
    smallItemsSpacing?: boolean;
    children: ReactNode;
    className?: string;
    style?: CSSProperties;
    accessibilityConfig?: IMenuContainerAccessibilityConfig;
    wrapperRef?: RefObject<HTMLDivElement | null>;
}

/**
 * @internal
 */
export function ItemsWrapper({
    smallItemsSpacing = false,
    className,
    children,
    style,
    wrapperRef,
}: IItemsWrapperProps) {
    return (
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
}

/**
 * @internal
 */
export function Separator(props: HTMLAttributes<HTMLDivElement>) {
    return <div className="gd-list-item gd-list-item-separator" {...props} />;
}

/**
 * @internal
 */
export interface IHeaderProps {
    children: ReactNode;
}
/**
 * @internal
 */
export function Header({ children, ...restProps }: IHeaderProps) {
    return (
        <div className="gd-list-item gd-list-item-header" {...restProps}>
            {children}
        </div>
    );
}

/**
 * @internal
 */
export interface IItemProps {
    checked?: boolean;
    subMenu?: boolean;
    disabled?: boolean;
    children: ReactNode;
    className?: string;
    style?: CSSProperties;
    onClick?: (e: MouseEvent<HTMLDivElement>) => void;
}

/**
 * @internal
 */
export function Item({
    checked = false,
    subMenu = false,
    disabled = false,
    className,
    children,
    style,
    onClick,
}: IItemProps) {
    return (
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
}
