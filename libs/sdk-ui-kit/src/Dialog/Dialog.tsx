// (C) 2020-2024 GoodData Corporation
import React, { Component } from "react";
import { Overlay } from "../Overlay/index.js";
import { DialogBase } from "./DialogBase.js";
import { IDialogBaseProps } from "./typings.js";

/**
 * @internal
 */
export class Dialog extends Component<IDialogBaseProps> {
    public render(): JSX.Element {
        const { containerClassName, onClick, onMouseUp, onMouseOver, shouldCloseOnClick, ...dialogProps } =
            this.props;

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
    }
}
