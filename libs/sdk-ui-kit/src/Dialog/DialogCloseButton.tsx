// (C) 2022-2025 GoodData Corporation
import React from "react";
import { TDialogCloseButtonProps } from "./typings.js";
import { Button } from "../Button/index.js";

export const DialogCloseButton = React.memo<TDialogCloseButtonProps>(function DialogCloseButton({
    accessibilityConfig,
    onCancel,
    onClose,
}) {
    return (
        <div className="gd-dialog-close">
            <Button
                className="gd-button-link gd-button-icon-only gd-icon-cross s-dialog-close-button"
                value=""
                onClick={onClose ?? onCancel}
                accessibilityConfig={accessibilityConfig?.closeButton}
            />
        </div>
    );
});
