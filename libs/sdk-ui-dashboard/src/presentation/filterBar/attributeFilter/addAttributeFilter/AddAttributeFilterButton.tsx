// (C) 2007-2022 GoodData Corporation
import React from "react";
import cx from "classnames";
import { useIntl } from "react-intl";

/**
 * @internal
 */
export interface IAddAttributeFilterButtonProps {
    className: string;
    isOpen: boolean;
}

/**
 * @internal
 */
export function AddAttributeFilterButton({ className, isOpen }: IAddAttributeFilterButtonProps) {
    const intl = useIntl();

    const title = intl.formatMessage({ id: "addPanel.attributeFilter" });
    const rootClassNames = cx(className, "is-loaded", {
        "is-active": isOpen,
    });

    return (
        <div className={rootClassNames}>
            <div className="button-content">
                <div className="button-title">{title}</div>
            </div>
        </div>
    );
}
