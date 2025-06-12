// (C) 2019 GoodData Corporation
import React from "react";
import { IErrorProps } from "../base/index.js";

/**
 * @internal
 */
export const KpiError: React.FC<IErrorProps> = (props) => {
    const message: string = props.message;

    return (
        <span
            className="gdc-kpi-error"
            style={{
                whiteSpace: "normal",
                lineHeight: "normal",
                fontSize: "14px",
                fontWeight: 700,
                verticalAlign: "middle",
                color: "#94a1ad",
                fontFamily: "gdcustomfont, avenir, Helvetica Neue, arial, sans-serif",
            }}
        >
            {message}
        </span>
    );
};
