// (C) 2007-2024 GoodData Corporation
import React from "react";
import cx from "classnames";
import { stringUtils } from "@gooddata/util";
import { Button } from "../Button/index.js";

interface IHeaderWorkspacePickerButtonProps {
    title: string;
    onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
    isOpen?: boolean;
}

export const HeaderWorkspacePickerButton: React.FC<IHeaderWorkspacePickerButtonProps> = ({
    title,
    onClick,
    isOpen,
}) => {
    const classNames = cx({
        "gd-header-project": true,
        [`s-${stringUtils.simplifyText(title)}`]: true,
        "is-expanded": isOpen,
        "is-collapsed": !isOpen,
    });

    return (
        <Button className="gd-header-button gd-workspace-picker-button" onClick={onClick} title={title}>
            <div className={classNames}>{title}</div>
        </Button>
    );
};
