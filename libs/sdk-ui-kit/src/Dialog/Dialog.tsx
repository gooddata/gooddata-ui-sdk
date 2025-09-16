// (C) 2020-2025 GoodData Corporation

import { memo } from "react";

import { DialogBase } from "./DialogBase.js";
import { IDialogProps } from "./typings.js";
import { Overlay } from "../Overlay/index.js";

/**
 * @internal
 */
export const Dialog = memo<IDialogProps>(function Dialog({
    containerClassName,
    onClick,
    onMouseUp,
    onMouseOver,
    onClose,
    shouldCloseOnClick,
    isModal = true,
    alignPoints,
    closeOnParentScroll,
    closeOnEscape,
    closeOnMouseDrag,
    ...dialogProps
}) {
    return (
        <Overlay
            isModal={isModal}
            positionType="fixed"
            alignPoints={
                alignPoints ?? [
                    {
                        align: "cc cc",
                    },
                ]
            }
            containerClassName={containerClassName}
            onMouseUp={onMouseUp}
            onMouseOver={onMouseOver}
            onClick={onClick}
            closeOnOutsideClick={Boolean(shouldCloseOnClick)}
            shouldCloseOnClick={shouldCloseOnClick}
            closeOnEscape={closeOnEscape}
            closeOnParentScroll={closeOnParentScroll}
            closeOnMouseDrag={closeOnMouseDrag}
            onClose={onClose}
        >
            <DialogBase {...dialogProps} isModal={isModal} onClose={onClose} />
        </Overlay>
    );
});
