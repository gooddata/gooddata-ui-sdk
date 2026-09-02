// (C) 2020-2026 GoodData Corporation

import { type NamedExoticComponent, memo } from "react";

import { Overlay } from "../Overlay/Overlay.js";

import { ConfirmDialogBase } from "./ConfirmDialogBase.js";
import { type IConfirmDialogBaseProps } from "./typings.js";

/**
 * @internal
 */
export const ConfirmDialog: NamedExoticComponent<IConfirmDialogBaseProps> = memo(function ConfirmDialog({
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
