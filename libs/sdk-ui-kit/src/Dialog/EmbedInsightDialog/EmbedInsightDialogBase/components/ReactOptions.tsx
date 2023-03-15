// (C) 2023 GoodData Corporation
import React, { useCallback } from "react";

import { CodeLanguageType, InsightCodeType, IReactOptions } from "../types";

import { CodeLanguageSelect } from "./CodeLanguageSelect";
import { CodeOptions } from "./CodeOptions";
import { ComponentTypeSelect } from "./ComponentTypeSelect";

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
