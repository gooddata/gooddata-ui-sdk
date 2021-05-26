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
        const { containerClassName, ...dialogProps } = this.props;

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
}
