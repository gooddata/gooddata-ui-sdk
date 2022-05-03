// (C) 2022 GoodData Corporation
import React from "react";
import { CodeOptionType } from "../types";
import { OptionsByDefinition } from "./OptionsByDefinition";
import { OptionsByReference } from "./OptionsByReference";

/**
 * @internal
 */
export interface ICodeOptionsProps {
    option: CodeOptionType;
    onChange: (opt: CodeOptionType) => void;
}

/**
 * @internal
 */
export const CodeOptions: React.VFC<ICodeOptionsProps> = (props) => {
    const { option, onChange } = props;

    if (option.type === "definition") {
        return <OptionsByDefinition option={option} onChange={onChange} />;
    }

    return <OptionsByReference option={option} onChange={onChange} />;
};
