// (C) 2020-2025 GoodData Corporation
import React, { PureComponent, ReactElement } from "react";
import { Overlay } from "../Overlay/index.js";
import { ConfirmDialogBase } from "./ConfirmDialogBase.js";
import { IConfirmDialogBaseProps } from "./typings.js";

/**
 * @internal
 */
export class ConfirmDialog extends PureComponent<IConfirmDialogBaseProps> {
    public render(): ReactElement {
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
