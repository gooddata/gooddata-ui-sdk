// (C) 2022 GoodData Corporation
import React from "react";
import { HeightSetting } from "./HeightSetting";
import { ToggleSwitch } from "./ToggleSwitch";

/**
 * @internal
 */
export interface IOptionsByDefinition {
    includeConfiguration: boolean;
    customHeight: boolean;
    height: number;
}

/**
 * @internal
 */
export interface IOptionsByDefinitionProps {
    option: IOptionsByDefinition;
    onChange: (opt: IOptionsByDefinition) => void;
}

/**
 * @internal
 */
export const OptionsByDefinition: React.VFC<IOptionsByDefinitionProps> = (props) => {
    const { option, onChange } = props;

    return (
        <div className="embed-insight-dialog-lang-selector">
            <strong className="bottom-space">Other option</strong>

            <ToggleSwitch
                id={"include-configuration"}
                label={"Include configuration"}
                questionMarkMessage={"Bla bla"}
                checked={option.includeConfiguration}
                onChange={() => {
                    const opt = { ...option, includeConfiguration: !option.includeConfiguration };
                    onChange(opt);
                }}
            />

            <ToggleSwitch
                id={"custom-height"}
                label={"Custom height"}
                checked={option.customHeight}
                onChange={() => {
                    const opt = { ...option, customHeight: !option.customHeight }; // TODO Add default
                    onChange(opt);
                }}
            />

            {option.customHeight && (
                <HeightSetting
                    value={option.height}
                    onValueChange={(value) => {
                        const opt = { ...option, height: value };
                        onChange(opt);
                    }}
                />
            )}
        </div>
    );
};
