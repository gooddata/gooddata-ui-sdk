// (C) 2007-2025 GoodData Corporation
import cx from "classnames";

interface ISeparatorProps {
    className?: string;
}

export function Separator({ className, ...restProps }: ISeparatorProps) {
    return <hr className={cx("gd-separator-generic", className)} {...restProps} />;
}
