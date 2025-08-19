// (C) 2022-2025 GoodData Corporation
import React from "react";

import cx from "classnames";
import isEmpty from "lodash/isEmpty.js";
import noop from "lodash/noop.js";

/**
 * @internal
 */
export interface IHyperlinkProps {
    href: string;
    text?: string;
    className?: string;
    iconClass?: string;
    onClick?: () => void;
}

/**
 * This component was implemented to follow current design of links
 * with minimal necessary stylization.
 *
 * @internal
 */
export const Hyperlink: React.FC<IHyperlinkProps> = (props) => {
    const { text, href, onClick = noop, className, iconClass } = props;
    return (
        <a
            className={cx("gd-hyperlink", className)}
            href={href}
            target="_blank"
            rel="noreferrer noopener"
            onClick={() => onClick()}
        >
            {!isEmpty(iconClass) && <span className={cx("gd-hyperlink-icon", iconClass)} />}
            {!isEmpty(text) && <span className="gd-hyperlink-text">{text}</span>}
        </a>
    );
};
