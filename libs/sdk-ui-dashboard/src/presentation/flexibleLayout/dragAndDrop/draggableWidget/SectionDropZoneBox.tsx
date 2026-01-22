// (C) 2019-2026 GoodData Corporation

import { type ReactNode } from "react";

import cx from "classnames";
import { FormattedMessage } from "react-intl";

import { type IDashboardLayoutSizeByScreenSize } from "@gooddata/sdk-model";
import { Typography } from "@gooddata/sdk-ui-kit";

import { DashboardLayoutSectionBorder } from "./DashboardLayoutSectionBorder/DashboardLayoutSectionBorder.js";

export interface ISectionDropZoneBoxProps {
    isOver: boolean;
    itemSize?: IDashboardLayoutSizeByScreenSize; // optional so I don't need to handle this in old layout yet
}

export function SectionDropZoneBox({ isOver, itemSize }: ISectionDropZoneBoxProps) {
    return (
        <div className="new-row-dropzone">
            <DashboardLayoutSectionBorder status={isOver ? "active" : "muted"} itemSize={itemSize}>
                <div
                    className={cx(
                        "drag-info-placeholder",
                        "widget-dropzone-box",
                        "s-last-drop-position",
                        "type-kpi",
                    )}
                >
                    <div className={cx("drag-info-placeholder-inner", "can-drop", { "is-over": isOver })}>
                        <div className="drag-info-placeholder-drop-target s-drag-info-placeholder-drop-target">
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
}
