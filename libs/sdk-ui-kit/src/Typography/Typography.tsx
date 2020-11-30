// (C) 2007-2020 GoodData Corporation
import React from "react";
import cx from "classnames";

/**
 * @internal
 */
export interface ITypographyProps {
    tagName: "h1" | "h2" | "h3" | "p";
    children: React.ReactNode;
    className?: string;
    onClick?: (e: React.MouseEvent) => void;
}

/**
 * @internal
 */
export const Typography: React.FC<ITypographyProps> = (props) => {
    const { tagName: Tag, children, className, onClick } = props;

    return (
        <Tag className={cx("gd-typography", `gd-typography--${Tag}`, className)} onClick={onClick}>
            {children}
        </Tag>
    );
};
