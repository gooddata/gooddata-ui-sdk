// (C) 2007-2026 GoodData Corporation

import { type MouseEvent, type MutableRefObject } from "react";

import cx from "classnames";

import { simplifyText } from "@gooddata/util";

import { Button } from "../Button/Button.js";

interface IHeaderWorkspacePickerButtonProps {
    title: string;
    dropdownId: string;
    onClick: (e: MouseEvent<HTMLDivElement>) => void;
    isOpen?: boolean;
    buttonRef?: MutableRefObject<HTMLElement>;
}

export function HeaderWorkspacePickerButton({
    title,
    onClick,
    isOpen,
    dropdownId,
    buttonRef,
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
            accessibilityConfig={{
                isExpanded: isOpen,
                popupId: dropdownId,
            }}
        >
            <div className={classNames}>{title}</div>
        </Button>
    );
}
