// (C) 2019 GoodData Corporation
import * as React from "react";
import { IErrorProps } from "../base";

/**
 * @internal
 */
export const KpiError: React.StatelessComponent<IErrorProps> = (props) => {
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
                fontFamily: "avenir, Helvetica Neue, arial, sans-serif",
            }}
        >
            {message}
        </span>
    );
};
