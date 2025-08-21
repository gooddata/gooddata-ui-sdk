// (C) 2022-2025 GoodData Corporation
import React, { ReactNode } from "react";

import cx from "classnames";
import { FormattedMessage } from "react-intl";

import { Typography } from "@gooddata/sdk-ui-kit";

interface IWidgetDropZoneBoxProps {
    isLast: boolean;
}

export function WidgetDropZoneBox(props: IWidgetDropZoneBoxProps) {
    const { isLast } = props;
    return (
        <div
            className={cx("drag-info-placeholder", "widget-dropzone-box", "s-last-drop-position", "type-kpi")}
        >
            <div className={cx("drag-info-placeholder-inner", "can-drop", "is-over")}>
                <div className="drag-info-placeholder-drop-target s-drag-info-placeholder-drop-target">
                    <div className="drop-target-inner">
                        <Typography tagName="p" className="drop-target-message kpi-drop-target">
                            {isLast ? (
                                <FormattedMessage
                                    id="dropzone.widget.last.in.row.desc"
                                    values={{ b: (chunks: ReactNode) => <b>{chunks}</b> }}
                                />
                            ) : (
                                <FormattedMessage
                                    id="dropzone.widget.desc"
                                    values={{ b: (chunks: ReactNode) => <b>{chunks}</b> }}
                                />
                            )}
                        </Typography>
                    </div>
                </div>
            </div>
        </div>
    );
}
