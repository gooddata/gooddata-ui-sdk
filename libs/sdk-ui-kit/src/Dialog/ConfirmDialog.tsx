// (C) 2020-2025 GoodData Corporation
import { Overlay } from "../Overlay/index.js";
import { ConfirmDialogBase } from "./ConfirmDialogBase.js";
import { IConfirmDialogBaseProps } from "./typings.js";

/**
 * @internal
 */
export function ConfirmDialog({ containerClassName, ...dialogProps }: IConfirmDialogBaseProps) {
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
}
