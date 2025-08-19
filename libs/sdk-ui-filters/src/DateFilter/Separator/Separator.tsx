// (C) 2007-2025 GoodData Corporation
import React from "react";

import cx from "classnames";

interface ISeparatorProps {
    className?: string;
}

export const Separator: React.FC<ISeparatorProps> = ({ className, ...restProps }) => (
    <hr className={cx("gd-separator-generic", className)} {...restProps} />
);
