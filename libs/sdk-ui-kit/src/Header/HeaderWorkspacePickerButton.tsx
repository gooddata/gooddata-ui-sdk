// (C) 2007-2025 GoodData Corporation
import React from "react";
import cx from "classnames";
import { stringUtils } from "@gooddata/util";
import { Button } from "../Button/index.js";

interface IHeaderWorkspacePickerButtonProps {
    title: string;
    dropdownId: string;
    onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
    isOpen?: boolean;
    buttonRef?: React.MutableRefObject<HTMLElement>;
}

export const HeaderWorkspacePickerButton: React.FC<IHeaderWorkspacePickerButtonProps> = ({
    title,
    onClick,
    isOpen,
    dropdownId,
    buttonRef,
}) => {
    const classNames = cx({
        "gd-header-project": true,
        [`s-${stringUtils.simplifyText(title)}`]: true,
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
};
