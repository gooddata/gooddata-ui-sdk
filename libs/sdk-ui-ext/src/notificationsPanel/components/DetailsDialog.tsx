// (C) 2024 GoodData Corporation
import { UiButton, UiIcon } from "@gooddata/sdk-ui-kit";
import React from "react";
import { bem } from "../bem.js";
import { defineMessages, useIntl } from "react-intl";
interface IDetailsDialogProps {
    onClose: () => void;
    title: string;
    content: React.ReactNode;
}

const { b, e } = bem("gd-ui-ext-notification-details-dialog");

const messages = defineMessages({
    closeButtonLabel: {
        id: "close",
    },
});

export function DetailsDialog({ onClose, title, content }: IDetailsDialogProps) {
    const intl = useIntl();
    return (
        <div className={b()}>
            <div className={e("header")}>
                <div className={e("header-title")}>{title}</div>
                <div role="button" className={e("header-close-button")} onClick={onClose}>
                    <UiIcon type="close" size={14} color="complementary-7" />
                </div>
            </div>
            <div className={e("content")}>{content}</div>
            <div className={e("footer")}>
                <UiButton
                    variant="secondary"
                    label={intl.formatMessage(messages.closeButtonLabel)}
                    size="small"
                    onClick={onClose}
                />
            </div>
        </div>
    );
}
