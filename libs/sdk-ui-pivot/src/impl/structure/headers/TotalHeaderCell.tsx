// (C) 2023-2025 GoodData Corporation
import { Component } from "react";
import cx from "classnames";

import { HEADER_LABEL_CLASS } from "../../base/constants.js";

export type AlignPositions = "left" | "right" | "center";
export const ALIGN_LEFT = "left";

export interface IHeaderCellProps {
    displayText: string;
    className?: string;
    textAlign?: AlignPositions;
}

export default class TotalHeaderCell extends Component<IHeaderCellProps> {
    public static defaultProps: Pick<IHeaderCellProps, "textAlign"> = {
        textAlign: ALIGN_LEFT,
    };

    public render() {
        const { className } = this.props;

        return <div className={cx("gd-pivot-table-header", className)}>{this.renderText()}</div>;
    }

    private renderText() {
        const { displayText, textAlign } = this.props;

        const classes = cx(HEADER_LABEL_CLASS, "gd-pivot-table-header-label", {
            "gd-pivot-table-header-label--right": textAlign === "right",
            "gd-pivot-table-header-label--center": textAlign === "center",
        });

        return (
            <div className={classes}>
                <span>{displayText ? displayText : ""}</span>
            </div>
        );
    }
}
