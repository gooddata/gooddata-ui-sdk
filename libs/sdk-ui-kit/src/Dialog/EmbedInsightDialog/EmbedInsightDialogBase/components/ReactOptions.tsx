// (C) 2023 GoodData Corporation
import React, { useCallback } from "react";

import { CodeLanguageType, InsightCodeType, IReactOptions } from "../types.js";

import { CodeLanguageSelect } from "./CodeLanguageSelect.js";
import { CodeOptions } from "./CodeOptions.js";
import { ComponentTypeSelect } from "./ComponentTypeSelect.js";

interface IReactOptionsProps {
    option: IReactOptions;
    onChange: (option: IReactOptions) => void;
}
export const ReactOptions = (props: IReactOptionsProps) => {
    const { option, onChange } = props;

    const onComponentTypeChanged = useCallback(
        (componentType: InsightCodeType) => {
            const opt: IReactOptions = { ...option, componentType };
            onChange(opt);
        },
        [option, onChange],
    );

    const onLanguageChanged = useCallback(
        (codeType: CodeLanguageType) => {
            const opt: IReactOptions = { ...option, codeType };
            onChange(opt);
        },
        [option, onChange],
    );

    return (
        <>
            <ComponentTypeSelect
                selectedComponentType={option.componentType}
                onComponentTypeChanged={onComponentTypeChanged}
            />
            <CodeLanguageSelect selectedLanguage={option.codeType} onLanguageChanged={onLanguageChanged} />
            <CodeOptions option={option} onChange={onChange} />
        </>
    );
};
