// (C) 2007-2019 GoodData Corporation
import React from "react";

interface IKpiMetricBoxProps {
    title: string;
    children: React.ReactNode;
}

export const KpiMetricBox = ({ title, children }: IKpiMetricBoxProps): JSX.Element => {
    return (
        <div className="kpi-metric">
            {/* language=CSS */}
            <style jsx>{`
                .kpi-metric {
                    min-width: 200px;
                    text-align: center;
                    border: 2px solid #14b2e2;
                    padding-top: 20px;
                    margin: 20px;
                    border-radius: 5px;
                }

                .kpi-metric .value {
                    font-weight: bold;
                    font-size: 2rem;
                    line-height: 1em;
                    text-align: center;
                    padding: 10px;
                }

                .kpi-metric .title {
                    display: block;
                    margin: 10px 10px -15px 15px;
                    font-size: 1.1rem;
                    border-radius: 5px;
                    background-color: #14b2e2;
                    padding: 5px 20px;
                    color: #ffffff;
                }
            `}</style>
            <div className="value">{children}</div>
            {title ? (
                <div className="title">
                    <span>{title}</span>
                </div>
            ) : null}
        </div>
    );
};
