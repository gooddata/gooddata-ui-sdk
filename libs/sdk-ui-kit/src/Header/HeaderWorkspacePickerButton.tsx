// (C) 2007-2020 GoodData Corporation
import React from "react";
import cx from "classnames";
import { stringUtils } from "@gooddata/util";

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
        <div className={classNames} onClick={onClick}>
            {title}
        </div>
    );
};
