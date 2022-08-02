// (C) 2022 GoodData Corporation
import React from "react";
import cx from "classnames";
import { FormattedMessage } from "react-intl";
import { Typography } from "@gooddata/sdk-ui-kit";

interface IWidgetDropZoneBoxProps {
    isLast: boolean;
}

export const WidgetDropZoneBox: React.FC<IWidgetDropZoneBoxProps> = (props) => {
    const { isLast } = props;
    return (
        <div
            className={cx("drag-info-placeholder", "widget-dropzone-box", "s-last-drop-position", "type-kpi")}
        >
            <div className={cx("drag-info-placeholder-inner", "can-drop", "is-over")}>
                <div className="drag-info-placeholder-drop-target">
                    <div className="drop-target-inner">
                        <Typography tagName="p" className="drop-target-message kpi-drop-target">
                            {isLast ? (
                                <FormattedMessage
                                    id="dropzone.widget.last.in.row.desc"
                                    values={{ b: (chunks: string) => <b>{chunks}</b> }}
                                />
                            ) : (
                                <FormattedMessage
                                    id="dropzone.widget.desc"
                                    values={{ b: (chunks: string) => <b>{chunks}</b> }}
                                />
                            )}
                        </Typography>
                    </div>
                </div>
            </div>
        </div>
    );
};
