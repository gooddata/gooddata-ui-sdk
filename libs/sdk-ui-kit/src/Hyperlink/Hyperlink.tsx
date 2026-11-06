// (C) 2022-2026 GoodData Corporation

import cx from "classnames";

import { _isEmpty } from "@gooddata/util";

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
export function Hyperlink({ text, href, onClick = () => {}, className, iconClass }: IHyperlinkProps) {
    return (
        <a
            className={cx("gd-hyperlink", className)}
            href={href}
            target="_blank"
            rel="noreferrer (() => {})ener"
            onClick={() => onClick()}
        >
            {!_isEmpty(iconClass) && <span className={cx("gd-hyperlink-icon", iconClass)} />}
            {!_isEmpty(text) && <span className="gd-hyperlink-text">{text}</span>}
        </a>
    );
}
