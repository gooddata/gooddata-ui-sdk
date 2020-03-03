// (C) 2019 GoodData Corporation
import * as React from "react";
import Input from "@gooddata/goodstrap/lib/Form/Input";

export interface IComparisonInputProps {
    value: number;
    onValueChange: (value: number) => void;
    onEnterKeyPress?: () => void;
}

const ComparisonInput = ({ onValueChange, value, onEnterKeyPress }: IComparisonInputProps) => {
    const handleValueChange = (val: string) => onValueChange(parseFloat(val));

    return (
        <Input
            className="s-mvf-comparison-value-input"
            value={value}
            onEnterKeyPress={onEnterKeyPress}
            onChange={handleValueChange}
            isSmall={true}
            autofocus={true}
        />
    );
};

export default ComparisonInput;
