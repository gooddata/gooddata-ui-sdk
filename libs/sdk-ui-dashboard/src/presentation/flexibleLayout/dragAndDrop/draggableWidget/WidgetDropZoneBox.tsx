// (C) 2022-2025 GoodData Corporation

import { type ReactNode } from "react";

import cx from "classnames";
import { FormattedMessage, defineMessages } from "react-intl";

import { Typography } from "@gooddata/sdk-ui-kit";

interface IWidgetDropZoneBoxProps {
    isLast: boolean;
    isInContainer: boolean;
}

const messages = defineMessages({
    last: {
        id: "dropzone.widget.last.in.row.desc",
    },
    lastInContainer: {
        id: "dropzone.widget.last.in.container.row.desc",
    },
    default: {
        id: "dropzone.widget.desc",
    },
});

export function WidgetDropZoneBox({ isLast, isInContainer }: IWidgetDropZoneBoxProps) {
    const message = isLast ? (isInContainer ? messages.lastInContainer : messages.last) : messages.default;
    return (
        <div
            className={cx("drag-info-placeholder", "widget-dropzone-box", "s-last-drop-position", "type-kpi")}
        >
            <div className={cx("drag-info-placeholder-inner", "can-drop", "is-over")}>
                <div className="drag-info-placeholder-drop-target s-drag-info-placeholder-drop-target">
                    <div className="drop-target-inner">
                        <Typography tagName="p" className="drop-target-message kpi-drop-target">
                            <FormattedMessage
                                id={message.id}
                                values={{ b: (chunks: ReactNode) => <b>{chunks}</b> }}
                            />
                        </Typography>
                    </div>
                </div>
            </div>
        </div>
    );
}
