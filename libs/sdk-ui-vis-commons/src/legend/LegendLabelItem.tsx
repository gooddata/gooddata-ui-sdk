// (C) 2007-2020 GoodData Corporation
import React from "react";

export interface ILegendLabel {
    label?: string;
}

export const LegendLabelItem: React.FC<ILegendLabel> = (props) => {
    const { label } = props;
    if (!label) {
        return null;
    }
    return (
        <div className="series-item">
            <div className="series-name">{`${label}:`}</div>
        </div>
    );
};
