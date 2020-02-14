// (C) 2007-2019 GoodData Corporation
import * as React from "react";
import cx from "classnames";
import { Separator } from "../Separator/Separator";

interface ISelectSeparatorProps {
    className?: string;
    key?: string;
    style?: React.CSSProperties;
}

export const SelectSeparator: React.FC<ISelectSeparatorProps> = ({ className, ...otherProps }) => (
    <div className={cx("gd-select-separator", className)} {...otherProps}>
        <Separator />
    </div>
);
