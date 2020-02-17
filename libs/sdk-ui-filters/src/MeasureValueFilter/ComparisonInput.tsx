// (C) 2019 GoodData Corporation
import * as React from "react";
import Input from "@gooddata/goodstrap/lib/Form/Input";

import { IInputProps } from "./DropdownBody";

const ComparisonInput = ({ onChange, value, onEnterKeyPress }: IInputProps) => {
    const onValueChange = (val: string) => onChange({ ...value, value: parseFloat(val) });

    return (
        <Input
            className="s-mvf-comparison-value-input"
            value={(value && value.value) || ""}
            onEnterKeyPress={onEnterKeyPress}
            onChange={onValueChange}
            isSmall={true}
            autofocus={true}
        />
    );
};

export default ComparisonInput;
