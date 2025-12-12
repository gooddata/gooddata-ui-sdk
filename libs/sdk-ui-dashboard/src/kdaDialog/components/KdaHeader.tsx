// (C) 2025 GoodData Corporation

import { type ReactNode } from "react";

import cx from "classnames";

interface IKdaHeaderProps {
    title: string;
    titleId: string;
    bars: ReactNode;
}

export function KdaHeader({ title, bars, titleId }: IKdaHeaderProps) {
    return (
        <div className={cx("gd-kda-dialog-header")}>
            <div className={cx("gd-kda-dialog-header-title")}>
                <div className={cx("gd-kda-dialog-header-title-text")} id={titleId}>
                    {title}
                </div>
            </div>
            <div className={cx("gd-kda-dialog-header-bars")} role="status" aria-live="polite">
                {bars}
            </div>
        </div>
    );
}
