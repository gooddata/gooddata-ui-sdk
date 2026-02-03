// (C) 2025-2026 GoodData Corporation

import { memo } from "react";

import cx from "classnames";

import { type IDialogCloseButtonProps } from "@gooddata/sdk-ui-kit";

import { KdaDialogActionButtons } from "./KdaDialogActionButtons.js";

/**
 * @internal
 */
export const KdaDialogControls = memo(function KdaDialogControls(props: IDialogCloseButtonProps) {
    const { className, accessibilityConfig, onClose } = props;
    return (
        <KdaDialogActionButtons
            className={cx("gd-dialog-close", "gd-kda-dialog-controls", className)}
            titleElementId={accessibilityConfig?.descriptionElementId}
            size="medium"
            onClose={onClose}
        />
    );
});
