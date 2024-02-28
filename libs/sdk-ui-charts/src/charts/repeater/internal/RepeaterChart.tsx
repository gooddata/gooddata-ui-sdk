// (C) 2024 GoodData Corporation

import React from "react";
import { RepeaterTransformedData } from "./types.js";
import { DataValue } from "@gooddata/sdk-model";

interface IRepeaterChartProps {
    data: RepeaterTransformedData;
    headers: string[];
}

export const RepeaterChart: React.FC<IRepeaterChartProps> = ({ data, headers }) => {
    const renderHeader = () => {
        return (
            <thead>
                <tr>
                    {headers.map((header, index: number) => {
                        return <th key={index}>{header}</th>;
                    })}
                </tr>
            </thead>
        );
    };

    const renderCell = (rows: DataValue[][]) => {
        return (
            <>
                {rows.map((row, index: number) => {
                    return <td key={index}>{row}</td>;
                })}
            </>
        );
    };

    const renderBody = () => {
        return (
            <tbody>
                {data.map((row, index: number) => {
                    return <tr key={index}>{renderCell(row)}</tr>;
                })}
            </tbody>
        );
    };

    return (
        <div className="repeater">
            <table>
                {renderHeader()}
                {renderBody()}
            </table>
        </div>
    );
};
