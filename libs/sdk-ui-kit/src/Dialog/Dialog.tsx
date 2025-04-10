// (C) 2020-2025 GoodData Corporation
import React from "react";
import { Overlay } from "../Overlay/index.js";
import { DialogBase } from "./DialogBase.js";
import { IDialogProps } from "./typings.js";

/**
 * @internal
 */
export const Dialog = React.memo<IDialogProps>(function Dialog({
    containerClassName,
    onClick,
    onMouseUp,
    onMouseOver,
    shouldCloseOnClick,
    ...dialogProps
}) {
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
            onMouseUp={onMouseUp}
            onMouseOver={onMouseOver}
            onClick={onClick}
            closeOnOutsideClick={Boolean(shouldCloseOnClick)}
            shouldCloseOnClick={shouldCloseOnClick}
        >
            <DialogBase {...dialogProps} />
        </Overlay>
    );
});
