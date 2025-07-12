// (C) 2007-2025 GoodData Corporation
import { CSSProperties } from "react";
import cx from "classnames";
import { Separator } from "../Separator/Separator.js";

interface ISelectSeparatorProps {
    className?: string;
    key?: string;
    style?: CSSProperties;
}

export function SelectSeparator({ className, ...otherProps }: ISelectSeparatorProps) {
    return (
        <div className={cx("gd-select-separator", className)} {...otherProps}>
            <Separator />
        </div>
    );
}
