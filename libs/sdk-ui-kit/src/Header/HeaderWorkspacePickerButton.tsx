// (C) 2007-2026 GoodData Corporation

import { type MouseEvent, type MutableRefObject } from "react";

import cx from "classnames";

import { simplifyText } from "@gooddata/util";

import { Button } from "../Button/Button.js";
import { type IButtonAccessibilityConfig } from "../Button/typings.js";

export type IHeaderWorkspacePickerButtonAccessibilityConfig = Pick<
    IButtonAccessibilityConfig,
    | "role"
    | "isExpanded"
    | "popupId"
    | "ariaLabel"
    | "ariaDescribedBy"
    | "ariaControls"
    | "ariaExpanded"
    | "ariaHaspopup"
    | "ariaPressed"
    | "popupType"
>;

export interface IHeaderWorkspacePickerButtonProps {
    title: string;
    onClick: (e: MouseEvent<HTMLDivElement>) => void;
    isOpen?: boolean;
    buttonRef?: MutableRefObject<HTMLElement>;
    /**
     * Props supporting accessibility that can be passed down to a <Button/>
     */
    accessibilityConfig: Pick<
        IButtonAccessibilityConfig,
        | "role"
        | "isExpanded"
        | "popupId"
        | "ariaLabel"
        | "ariaDescribedBy"
        | "ariaControls"
        | "ariaExpanded"
        | "ariaHaspopup"
        | "ariaPressed"
        | "popupType"
    >;
}

export function HeaderWorkspacePickerButton({
    title,
    onClick,
    isOpen,
    buttonRef,
    accessibilityConfig,
}: IHeaderWorkspacePickerButtonProps) {
    const classNames = cx({
        "gd-header-project": true,
        [`s-${simplifyText(title)}`]: true,
        "is-expanded": isOpen,
        "is-collapsed": !isOpen,
    });

    return (
        <Button
            ref={buttonRef}
            className="gd-header-button gd-workspace-picker-button"
            onClick={onClick}
            title={title}
            accessibilityConfig={accessibilityConfig}
        >
            <div className={classNames}>{title?.trim().length > 0 ? title : <>&nbsp;</>}</div>
        </Button>
    );
}
