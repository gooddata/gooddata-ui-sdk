// (C) 2020 GoodData Corporation
import React, { PureComponent } from "react";
import { Overlay } from "../Overlay";
import { ConfirmDialogBase } from "./ConfirmDialogBase";
import { IConfirmDialogBaseProps } from "./typings";

/**
 * @internal
 */
export class ConfirmDialog extends PureComponent<IConfirmDialogBaseProps> {
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
                <ConfirmDialogBase {...this.props} />
            </Overlay>
        );
    }
}
