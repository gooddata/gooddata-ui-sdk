// (C) 2019 GoodData Corporation
import * as React from "react";
import Input from "@gooddata/goodstrap/lib/Form/Input";

import { IInputProps } from "./DropdownBody";

const RangeInput: React.FC<IInputProps> = ({ onChange, value, onEnterKeyPress }) => {
    const { from = "", to = "" } = value || {};

    const onFromChange = (val: string) => onChange({ ...value, from: parseFloat(val) });
    const onToChange = (val: string) => onChange({ ...value, to: parseFloat(val) });

    return (
        <div className={"gd-mvf-range-input"}>
            <Input
                className="s-mvf-range-from-input"
                value={from}
                onChange={onFromChange}
                onEnterKeyPress={onEnterKeyPress}
                isSmall={true}
                autofocus={true}
            />
            <Input
                className="s-mvf-range-to-input"
                value={to}
                onChange={onToChange}
                onEnterKeyPress={onEnterKeyPress}
                isSmall={true}
            />
        </div>
    );
};

export default RangeInput;
