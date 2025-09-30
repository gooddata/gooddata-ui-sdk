// (C) 2025 GoodData Corporation

import { ReactNode } from "react";

import cx from "classnames";

interface IKdaBarProps {
    title: string;
    content: ReactNode;
}

export function KdaBar(props: IKdaBarProps) {
    return (
        <div className={cx("gd-kda-dialog-bar")}>
            <div className={cx("gd-kda-dialog-bar-title")}>{props.title}</div>
            <div className={cx("gd-kda-dialog-bar-content")}>{props.content}</div>
        </div>
    );
}
