// (C) 2019-2022 GoodData Corporation
import React, { ReactNode } from "react";
import cx from "classnames";
import { FormattedMessage } from "react-intl";
import { Typography } from "@gooddata/sdk-ui-kit";
import { DashboardLayoutSectionBorder } from "./DashboardLayoutSectionBorder/index.js";

export interface ISectionDropZoneBoxProps {
    isOver: boolean;
}

export const SectionDropZoneBox: React.FC<ISectionDropZoneBoxProps> = (props) => {
    const { isOver } = props;
    return (
        <div className="new-row-dropzone">
            <DashboardLayoutSectionBorder status={isOver ? "active" : "muted"}>
                <div
                    className={cx(
                        "drag-info-placeholder",
                        "widget-dropzone-box",
                        "s-last-drop-position",
                        "type-kpi",
                    )}
                >
                    <div className={cx("drag-info-placeholder-inner", "can-drop", { "is-over": isOver })}>
                        <div className="drag-info-placeholder-drop-target">
                            <div className="drop-target-inner">
                                <Typography tagName="p" className="drop-target-message kpi-drop-target">
                                    <FormattedMessage
                                        id="dropzone.new.row.desc"
                                        values={{
                                            b: (chunks: ReactNode) => <b>{chunks}</b>,
                                            nbsp: <>&nbsp;</>,
                                        }}
                                    />
                                </Typography>
                            </div>
                        </div>
                    </div>
                </div>
            </DashboardLayoutSectionBorder>
        </div>
    );
};
