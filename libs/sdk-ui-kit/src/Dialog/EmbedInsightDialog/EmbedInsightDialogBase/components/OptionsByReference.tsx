// (C) 2022 GoodData Corporation
import React from "react";
import { IOptionsByReference } from "../types";
import { HeightSetting } from "./HeightSetting";
import { ToggleSwitch } from "./ToggleSwitch";

/**
 * @internal
 */
export interface IOptionsByReferenceProps {
    option: IOptionsByReference;
    onChange: (opt: IOptionsByReference) => void;
}

/**
 * @internal
 */
export const OptionsByReference: React.VFC<IOptionsByReferenceProps> = (props) => {
    const { option, onChange } = props;

    return (
        <div className="embed-insight-dialog-lang-selector">
            <strong className="bottom-space">Other option</strong>

            <ToggleSwitch
                id={"include-configuration"}
                label={"Display title"}
                checked={option.displayTitle}
                onChange={() => {
                    const opt = { ...option, displayTitle: !option.displayTitle };
                    onChange(opt);
                }}
            />

            <ToggleSwitch
                id={"custom-height"}
                label={"Custom height"}
                checked={option.customHeight}
                onChange={() => {
                    const opt = { ...option, customHeight: !option.customHeight };
                    onChange(opt);
                }}
            />

            {option.customHeight && (
                <HeightSetting
                    value={option.height}
                    unit={option.unit}
                    onValueChange={(height, unit) => {
                        const opt = { ...option, height, unit };
                        onChange(opt);
                    }}
                />
            )}
        </div>
    );
};
