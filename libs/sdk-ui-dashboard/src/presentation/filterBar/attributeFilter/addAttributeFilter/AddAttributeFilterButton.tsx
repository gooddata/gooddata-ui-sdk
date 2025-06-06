// (C) 2007-2025 GoodData Corporation
import React from "react";
import cx from "classnames";
import { useIntl } from "react-intl";

/**
 * @internal
 */
export interface IAddAttributeFilterButtonProps {
    className: string;
    isOpen: boolean;
    title?: string;
    buttonRef?: React.MutableRefObject<HTMLElement>;
    onClick?: () => void;
}

/**
 * @internal
 */
export function AddAttributeFilterButton({
    className,
    isOpen,
    title,
    buttonRef,
    onClick,
}: IAddAttributeFilterButtonProps) {
    const intl = useIntl();

    title = title ?? intl.formatMessage({ id: "addPanel.attributeFilter" });
    const rootClassNames = cx(className, "is-loaded", {
        "is-active": isOpen,
    });

    return (
        <div ref={buttonRef as React.RefObject<HTMLDivElement>} className={rootClassNames} onClick={onClick}>
            <div className="button-content">
                <div className="button-title">{title}</div>
            </div>
        </div>
    );
}
