// (C) 2025-2026 GoodData Corporation

import { type ReactNode } from "react";

import cx from "classnames";

import { useKdaState } from "../providers/KdaState.js";

interface IKdaContentProps {
    contentError?: (err?: Error) => ReactNode;
    leftContent?: ReactNode;
    rightContent?: ReactNode;
    leftLoader?: ReactNode;
    rightLoader?: ReactNode;
    rightError?: (err?: Error) => ReactNode;
}

export function KdaContent({
    contentError,
    leftContent,
    rightContent,
    leftLoader,
    rightLoader,
    rightError,
}: IKdaContentProps) {
    const { state } = useKdaState();

    const loading = state.relevantStatus === "loading" || state.relevantStatus === "pending";

    const leftPanelLoading = loading || state.itemsStatus === "pending" || state.itemsStatus === "loading";
    const rightPanelLoading =
        loading || state.selectedStatus === "pending" || state.selectedStatus === "loading";

    const fullContentError = state.itemsStatus === "error";
    const rightPanelError = state.selectedStatus === "error";

    return (
        <div className={cx("gd-kda-dialog-content")}>
            {fullContentError ? (
                <div className={cx("gd-kda-dialog-content-full")}>{contentError?.(state.itemsError)}</div>
            ) : (
                <>
                    <div className={cx("gd-kda-dialog-content-left-panel")}>
                        {leftPanelLoading ? leftLoader : leftContent}
                    </div>
                    <div className={cx("gd-kda-dialog-content-divider")}></div>
                    <div className={cx("gd-kda-dialog-content-right-panel")}>
                        {rightPanelLoading
                            ? rightLoader
                            : rightPanelError
                              ? rightError?.(state.selectedError)
                              : rightContent}
                    </div>
                </>
            )}
        </div>
    );
}
