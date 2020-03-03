// (C) 2019 GoodData Corporation
import * as React from "react";
import Input from "@gooddata/goodstrap/lib/Form/Input";

export interface IRangeInputProps {
    from: number;
    to: number;
    onFromChange: (value: number) => void;
    onToChange: (value: number) => void;
    onEnterKeyPress?: () => void;
}

const RangeInput = ({ onFromChange, onToChange, from, to, onEnterKeyPress }: IRangeInputProps) => {
    const handleFromChange = (val: string) => onFromChange(parseFloat(val));
    const handleToChange = (val: string) => onToChange(parseFloat(val));

    return (
        <div className={"gd-mvf-range-input"}>
            <Input
                className="s-mvf-range-from-input"
                value={from}
                onChange={handleFromChange}
                onEnterKeyPress={onEnterKeyPress}
                isSmall={true}
                autofocus={true}
            />
            <Input
                className="s-mvf-range-to-input"
                value={to}
                onChange={handleToChange}
                onEnterKeyPress={onEnterKeyPress}
                isSmall={true}
            />
        </div>
    );
};

export default RangeInput;
