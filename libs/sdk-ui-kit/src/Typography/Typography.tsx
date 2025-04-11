// (C) 2007-2025 GoodData Corporation
import React from "react";
import cx from "classnames";

/**
 * @internal
 */
export type TypographyTagName = "h1" | "h2" | "h3" | "p";

/**
 * @internal
 */
export interface ITypographyProps {
    tagName: TypographyTagName;
    children: React.ReactNode;
    className?: string;
    onClick?: (e: React.MouseEvent) => void;
    title?: string;
    id?: string;
}

/**
 * @internal
 */
export const Typography: React.FC<ITypographyProps> = (props) => {
    const { tagName: Tag, children, className, title, id, onClick } = props;

    return (
        <Tag
            className={cx("gd-typography", `gd-typography--${Tag}`, className)}
            onClick={onClick}
            title={title}
            id={id}
        >
            {children}
        </Tag>
    );
};
