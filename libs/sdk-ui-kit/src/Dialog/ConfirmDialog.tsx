// (C) 2020-2025 GoodData Corporation

import { memo } from "react";

import { ConfirmDialogBase } from "./ConfirmDialogBase.js";
import { IConfirmDialogBaseProps } from "./typings.js";
import { Overlay } from "../Overlay/index.js";

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
