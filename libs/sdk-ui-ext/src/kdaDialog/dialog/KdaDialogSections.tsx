// (C) 2025 GoodData Corporation

import { ReactNode } from "react";

import cx from "classnames";

import { ErrorComponent, LoadingComponent } from "@gooddata/sdk-ui";

import { useKdaState } from "../providers/KdaState.js";

interface IKdaDialogSectionsProps {
    header: ReactNode;
    content: ReactNode;
    footer: ReactNode;
}

/**
 * @internal
 */
export function KdaDialogSections({ footer, content, header }: IKdaDialogSectionsProps) {
    const { state } = useKdaState();
    const isLoading = state.rootStatus === "pending" || state.rootStatus === "loading";
    const isError = state.rootStatus === "error";

    return (
        <div className={cx("gd-kda-dialog-sections")}>
            {isLoading ? (
                <LoadingComponent />
            ) : isError ? (
                <ErrorComponent
                    message="Unknown error"
                    description="Can not load key drivers data. Please try again later."
                />
            ) : (
                <>
                    <div className={cx("gd-kda-dialog-sections-header")}>{header}</div>
                    <div className={cx("gd-kda-dialog-sections-divider")} />
                    <div className={cx("gd-kda-dialog-sections-content")}>{content}</div>
                    <div className={cx("gd-kda-dialog-sections-divider")} />
                    <div className={cx("gd-kda-dialog-sections-footer")}>{footer}</div>
                </>
            )}
        </div>
    );
}
