// (C) 2020 GoodData Corporation
import React, { Component } from "react";
import { Overlay } from "../Overlay";
import { DialogBase } from "./DialogBase";
import { IDialogBaseProps } from "./typings";

/**
 * @internal
 */
export class Dialog extends Component<IDialogBaseProps> {
    public render(): JSX.Element {
        return (
            <Overlay
                alignPoints={[
                    {
                        align: "cc cc",
                    },
                ]}
                isModal
                positionType="fixed"
            >
                <DialogBase {...this.props} />
            </Overlay>
        );
    }
}
