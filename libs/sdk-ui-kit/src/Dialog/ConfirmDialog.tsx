// (C) 2020-2025 GoodData Corporation
import React, { memo } from "react";
import { Overlay } from "../Overlay/index.js";
import { ConfirmDialogBase } from "./ConfirmDialogBase.js";
import { IConfirmDialogBaseProps } from "./typings.js";

/**
 * @internal
 */
export const ConfirmDialog = memo(function ConfirmDialog({
    containerClassName,
    ...dialogProps
}: IConfirmDialogBaseProps) {
    return (
        <Overlay
            alignPoints={[
                {
                    align: "cc cc",
                },
            ]}
            isModal
            positionType="fixed"
            containerClassName={containerClassName}
        >
            <ConfirmDialogBase {...dialogProps} />
        </Overlay>
    );
});
