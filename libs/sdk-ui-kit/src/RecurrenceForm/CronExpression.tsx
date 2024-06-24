// (C) 2024 GoodData Corporation

import React from "react";

interface ICronExpressionProps {
    expression: string;
    onChange: (expression: string) => void;
}

export const CronExpression: React.FC<ICronExpressionProps> = (props) => {
    const { expression, onChange } = props;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    };

    return (
        <div className="gd-recurrence-form-cron s-recurrence-form-cron">
            <input className="gd-input-field" onChange={handleChange} value={expression} />
        </div>
    );
};
