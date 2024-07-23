// (C) 2007-2024 GoodData Corporation
import React from "react";
import cx from "classnames";
import { FormattedMessage } from "react-intl";
import { Button } from "../Button/index.js";

type HeaderSearchProps = {
    onClick: () => void;
    className?: string;
};

export const HeaderSearch: React.FC<HeaderSearchProps> = ({ onClick, className }) => {
    const classNames = cx(["gd-header-button", "gd-header-help", "gd-icon-header-search", className]);

    return (
        <Button className={classNames} onClick={onClick}>
            <FormattedMessage id="gs.header.search" />
        </Button>
    );
};
