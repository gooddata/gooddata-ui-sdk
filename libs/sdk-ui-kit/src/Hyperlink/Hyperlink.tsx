// (C) 2022-2025 GoodData Corporation
import cx from "classnames";
import noop from "lodash/noop.js";
import isEmpty from "lodash/isEmpty.js";

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
export function Hyperlink({ text, href, onClick = noop, className, iconClass }: IHyperlinkProps) {
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
}
