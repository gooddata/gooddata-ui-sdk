// (C) 2025-2026 GoodData Corporation

import { type ReactNode } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import { UiButton } from "@gooddata/sdk-ui-kit";

interface IKdaFooterProps {
    content?: ReactNode;
    onClose?: () => void;
}

export function KdaFooter({ content, onClose }: IKdaFooterProps) {
    const intl = useIntl();
    const closeLabel = intl.formatMessage({ id: "kdaDialog.dialog.close" });

    return (
        <div className={cx("gd-kda-dialog-footer")}>
            <div className={cx("gd-kda-dialog-footer-content")}>{content}</div>
            <div className={cx("gd-kda-dialog-footer-buttons")}>
                <UiButton size="large" label={closeLabel} variant="secondary" onClick={onClose} />
            </div>
        </div>
    );
}
