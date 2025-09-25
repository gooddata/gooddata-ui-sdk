// (C) 2025 GoodData Corporation

import { ReactNode } from "react";

import cx from "classnames";

import { useKdaState } from "../providers/KdaState.js";

interface IKdaContentProps {
    leftContent?: ReactNode;
    rightContent?: ReactNode;
    leftLoader?: ReactNode;
    rightLoader?: ReactNode;
    leftError?: ReactNode;
    rightError?: ReactNode;
}

export function KdaContent({
    leftContent,
    rightContent,
    leftLoader,
    rightLoader,
    leftError,
    rightError,
}: IKdaContentProps) {
    const { state } = useKdaState();

    const leftPanelLoading = state.itemsStatus === "pending" || state.itemsStatus === "loading";
    const rightPanelLoading = state.selectedStatus === "pending" || state.selectedStatus === "loading";

    const leftPanelError = state.itemsStatus === "error";
    const rightPanelError = state.selectedStatus === "error";

    return (
        <div className={cx("gd-kda-dialog-content")}>
            <div className={cx("gd-kda-dialog-content-left-panel")}>
                {leftPanelLoading ? leftLoader : leftPanelError ? leftError : leftContent}
            </div>
            <div className={cx("gd-kda-dialog-content-divider")}></div>
            <div className={cx("gd-kda-dialog-content-right-panel")}>
                {rightPanelLoading ? rightLoader : rightPanelError ? rightError : rightContent}
            </div>
        </div>
    );
}
